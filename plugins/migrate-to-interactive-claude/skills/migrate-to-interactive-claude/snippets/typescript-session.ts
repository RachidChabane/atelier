/**
 * Tmux-backed Claude Code session (TypeScript / Node).
 *
 * Drop-in starter for projects migrating off `claude -p`. Drives an interactive
 * `claude` session inside a detached tmux window, sends prompts via bracketed
 * paste, and reads completions out of the JSONL conversation file. The wrapper
 * shells out to the `tmux` CLI directly via child_process - no node-tmux
 * library dependency.
 *
 * Requires: tmux >= 3.3, claude CLI >= 2.x, Node >= 18.
 *
 * Smoke test (will actually launch claude and consume a few tokens):
 *
 *     CLAUDE_TMUX_LIVE_TEST=1 npx ts-node typescript-session.ts
 *
 * Reference: see ../SKILL.md, and the sibling reference/ docs.
 */

import { spawnSync } from "node:child_process";
import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// --- Constants ---------------------------------------------------------------

const PTY_WIDTH = 220;
const PTY_HEIGHT = 50;

const ANSI_RE = /\x1b\[[0-9;?]*[A-Za-z]/g;
const EMPTY_PROMPT_RE = /^>\s*$/m;
const RULE_RE = /─{20,}/g;
const FOOTER_RE = /bypass permissions on.*tokens/i;

const USAGE_LIMIT_PATTERNS = [
  "usage limit",
  "weekly limit",
  "org's monthly usage limit",
  "/extra-usage to enable",
  "/extra-usage to request more",
  "Server is temporarily limiting requests (not your usage limit)",
  "Fast limit reset",
  "usage limit reached",
  "limit reached",
  "limit will reset",
];

const MARKER_INSTRUCTION = `

---
When you have completed the task above, end your final assistant message
with a separate last line containing exactly \`<<DONE-{MARKER}>>\` and
nothing else. Do not include this marker anywhere else - not in tool
output, not in intermediate text, only on the very last line. If you
cannot complete the task, still end with the marker line after
explaining what blocked you.
`;

// --- Types -------------------------------------------------------------------

export interface TokenCaps {
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxTotalTokens?: number;
  graceTurns?: number; // consecutive over-budget turns tolerated (default 1)
}

export interface UsageTotals {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export interface SendResult {
  text: string;
  usage: UsageTotals;
  completed: boolean;
  subtype?: "error_max_turns" | "rate_limited" | "timeout" | "idle_fallback";
  rawCapture?: string;
}

export interface TmuxSession {
  name: string;
  sessionId: string;
  cwd: string;
  jsonl: string;
}

export interface NewSessionOptions {
  model?: string;
  effort?: string;
  namePrefix?: string;
}

export interface SendPromptOptions {
  timeoutMs?: number;
  tokenCaps?: TokenCaps;
}

// --- Public API --------------------------------------------------------------

export async function newSession(
  cwd: string,
  opts: NewSessionOptions = {},
): Promise<TmuxSession> {
  const resolvedCwd = path.resolve(cwd);
  if (!fs.existsSync(resolvedCwd) || !fs.statSync(resolvedCwd).isDirectory()) {
    throw new Error(`cwd does not exist: ${resolvedCwd}`);
  }

  const model = opts.model ?? "claude-sonnet-4-6";
  const effort = opts.effort ?? "medium";
  const namePrefix = opts.namePrefix ?? "claude";

  const sessionId = crypto.randomUUID();
  const name = `${namePrefix}-${sessionId.slice(0, 8)}`;

  // `cd <cwd> &&` prefix is mandatory: the tmux server inherits its own cwd,
  // not the caller's. Without it, the JSONL path below won't match where
  // claude writes.
  const cmd =
    `cd ${shQuote(resolvedCwd)} && ` +
    `claude --session-id ${sessionId} ` +
    `--permission-mode bypassPermissions ` +
    `--model ${shQuote(model)} ` +
    `--effort ${shQuote(effort)}`;

  runTmux([
    "new-session",
    "-d",
    "-s", name,
    "-x", String(PTY_WIDTH),
    "-y", String(PTY_HEIGHT),
    cmd,
  ]);

  const session: TmuxSession = {
    name,
    sessionId,
    cwd: resolvedCwd,
    jsonl: jsonlPath(resolvedCwd, sessionId),
  };

  await waitForBoot(session, 30_000);
  return session;
}

export async function sendPrompt(
  session: TmuxSession,
  userText: string,
  opts: SendPromptOptions = {},
): Promise<SendResult> {
  const timeoutMs = opts.timeoutMs ?? 300_000;
  // Fresh marker per call - never reuse.
  const markerToken = crypto.randomBytes(6).toString("hex");
  const marker = `<<DONE-${markerToken}>>`;
  const augmented = userText + MARKER_INSTRUCTION.replace("{MARKER}", markerToken);

  pastePrompt(session, augmented);
  sendEnter(session);

  return waitForCompletion(session, marker, timeoutMs, opts.tokenCaps);
}

export function readFinalText(session: TmuxSession): string {
  if (!fs.existsSync(session.jsonl)) return "";
  return stripKnownMarkers(latestAssistantText(session.jsonl));
}

export function readTotalUsage(session: TmuxSession): UsageTotals {
  const totals: UsageTotals = {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  };
  if (!fs.existsSync(session.jsonl)) return totals;
  for (const row of iterAssistantRows(session.jsonl)) {
    const usage = row?.message?.usage ?? {};
    for (const k of Object.keys(totals) as (keyof UsageTotals)[]) {
      totals[k] += Number(usage[k] ?? 0);
    }
  }
  return totals;
}

export async function killSession(
  session: TmuxSession,
  graceMs = 3_000,
): Promise<void> {
  trySilently(() => runTmux(["send-keys", "-t", session.name, "C-c"]));
  await sleep(200);
  // Plain send-keys here (not bracketed paste): we WANT `/exit` interpreted
  // as a slash command. The opposite of prompt delivery in pastePrompt.
  trySilently(() => runTmux(["send-keys", "-t", session.name, "/exit", "Enter"]));

  const deadline = Date.now() + graceMs;
  while (Date.now() < deadline) {
    if (!sessionAlive(session)) return;
    await sleep(200);
  }
  // Idempotent hard reap.
  trySilently(() => runTmux(["kill-session", "-t", session.name]));
}

// --- Internals: paste / send -------------------------------------------------

function pastePrompt(session: TmuxSession, text: string): void {
  // Bracketed paste via load-buffer + paste-buffer -p -d.
  // Bracketed paste suppresses slash-command interpretation, so user content
  // containing literal "/help" or "/exit" lines is delivered as content.
  // -d deletes the paste buffer after consumption (idempotency).
  const bufferName = `buf-${crypto.randomBytes(4).toString("hex")}`;
  const tmpFile = path.join(os.tmpdir(), `claude-tmux-${crypto.randomBytes(6).toString("hex")}.txt`);
  fs.writeFileSync(tmpFile, text);
  try {
    runTmux(["load-buffer", "-t", session.name, "-b", bufferName, tmpFile]);
    runTmux(["paste-buffer", "-t", session.name, "-b", bufferName, "-p", "-d"]);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

function sendEnter(session: TmuxSession): void {
  runTmux(["send-keys", "-t", session.name, "Enter"]);
}

// --- Internals: completion ---------------------------------------------------

async function waitForCompletion(
  session: TmuxSession,
  marker: string,
  timeoutMs: number,
  caps?: TokenCaps,
): Promise<SendResult> {
  const start = Date.now();
  const fallbackDeadline = start + timeoutMs * 0.8;
  const hardDeadline = start + timeoutMs;
  let overBudgetTurns = 0;
  let lastAssistantIdx = -1;

  while (Date.now() < hardDeadline) {
    const capture = capturePanePlain(session);

    // Usage-limit detection (against ANSI-noisy capture is fine; patterns are ASCII).
    const captureLc = capture.toLowerCase();
    for (const pat of USAGE_LIMIT_PATTERNS) {
      if (captureLc.includes(pat.toLowerCase())) {
        return {
          text: readFinalText(session),
          usage: readTotalUsage(session),
          completed: false,
          subtype: "rate_limited",
          rawCapture: capture,
        };
      }
    }

    // Primary: marker in JSONL latest assistant row.
    if (fs.existsSync(session.jsonl)) {
      const text = latestAssistantText(session.jsonl);
      if (text.replace(/\s+$/, "").endsWith(marker)) {
        return {
          text: stripMarker(text, marker),
          usage: readTotalUsage(session),
          completed: true,
          rawCapture: capture,
        };
      }

      // Token watchdog (replaces --max-turns).
      if (caps) {
        const rows = [...iterAssistantRows(session.jsonl)];
        if (rows.length > lastAssistantIdx) {
          lastAssistantIdx = rows.length;
          if (overBudget(rows, caps)) {
            overBudgetTurns += 1;
            const graceTurns = caps.graceTurns ?? 1;
            if (overBudgetTurns > graceTurns) {
              await killSession(session);
              return {
                text: readFinalText(session),
                usage: readTotalUsage(session),
                completed: false,
                subtype: "error_max_turns",
                rawCapture: capture,
              };
            }
          }
        }
      }
    }

    // Fallback: idle-pattern after 80% of the timeout has passed.
    if (Date.now() > fallbackDeadline && isIdle(capture)) {
      return {
        text: readFinalText(session),
        usage: readTotalUsage(session),
        completed: true,
        subtype: "idle_fallback",
        rawCapture: capture,
      };
    }

    await sleep(500);
  }

  return {
    text: readFinalText(session),
    usage: readTotalUsage(session),
    completed: false,
    subtype: "timeout",
    rawCapture: capturePanePlain(session),
  };
}

function overBudget(rows: any[], caps: TokenCaps): boolean {
  let inTok = 0;
  let outTok = 0;
  for (const row of rows) {
    const usage = row?.message?.usage ?? {};
    inTok += Number(usage.input_tokens ?? 0);
    outTok += Number(usage.output_tokens ?? 0);
  }
  if (caps.maxInputTokens !== undefined && inTok > caps.maxInputTokens) return true;
  if (caps.maxOutputTokens !== undefined && outTok > caps.maxOutputTokens) return true;
  if (caps.maxTotalTokens !== undefined && (inTok + outTok) > caps.maxTotalTokens) return true;
  return false;
}

// --- Internals: capture-pane / idle ------------------------------------------

function capturePanePlain(session: TmuxSession): string {
  const out = runTmux(["capture-pane", "-t", session.name, "-p"]);
  return out.stdout;
}

function isIdle(captureOutput: string): boolean {
  const text = captureOutput.replace(ANSI_RE, "");
  if (!EMPTY_PROMPT_RE.test(text)) return false;
  const rules = text.match(RULE_RE);
  if (!rules || rules.length < 2) return false;
  return FOOTER_RE.test(text);
}

async function waitForBoot(session: TmuxSession, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isIdle(capturePanePlain(session))) return;
    await sleep(250);
  }
  throw new Error(
    `claude session ${session.name} did not reach idle within ${timeoutMs}ms. ` +
    `Likely causes: workspace trust dialog (run \`claude\` once by hand in ${session.cwd}), ` +
    `or claude binary not found / failing to authenticate.`
  );
}

function sessionAlive(session: TmuxSession): boolean {
  const res = spawnSync("tmux", ["has-session", "-t", session.name], { encoding: "utf8" });
  return res.status === 0;
}

// --- Internals: JSONL --------------------------------------------------------

function jsonlPath(cwd: string, sessionId: string): string {
  // `cwd` is expected to already be resolved (symlinks expanded) to match
  // claude's getcwd-based slug. On macOS /tmp -> /private/tmp; without
  // path.resolve() the slug would not match where claude actually writes.
  const slug = cwd.replace(/\//g, "-");
  return path.join(os.homedir(), ".claude", "projects", slug, `${sessionId}.jsonl`);
}

function* iterAssistantRows(jsonl: string): Generator<any> {
  if (!fs.existsSync(jsonl)) return;
  const raw = fs.readFileSync(jsonl, "utf8");
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let row: any;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row?.type === "assistant") yield row;
  }
}

function latestAssistantText(jsonl: string): string {
  let last = "";
  for (const row of iterAssistantRows(jsonl)) {
    const content = row?.message?.content ?? [];
    const parts: string[] = [];
    for (const block of content) {
      if (block?.type === "text") parts.push(block.text ?? "");
    }
    if (parts.length) last = parts.join("");
  }
  return last;
}

// --- Internals: misc ---------------------------------------------------------

function runTmux(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const res = spawnSync("tmux", args, { encoding: "utf8" });
  if (res.error) throw res.error;
  return { stdout: res.stdout ?? "", stderr: res.stderr ?? "", status: res.status };
}

function trySilently(fn: () => unknown): void {
  try { fn(); } catch { /* ignore */ }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shQuote(s: string): string {
  if (!s) return "''";
  if (/^[A-Za-z0-9_\-./]+$/.test(s)) return s;
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

function stripMarker(text: string, marker: string): string {
  let stripped = text.replace(/\s+$/, "");
  if (stripped.endsWith(marker)) {
    stripped = stripped.slice(0, -marker.length).replace(/\s+$/, "");
  }
  return stripped;
}

const KNOWN_MARKER_RE = /<<DONE-[0-9a-f]{12}>>\s*$/;

function stripKnownMarkers(text: string): string {
  return text.replace(/\s+$/, "").replace(KNOWN_MARKER_RE, "").replace(/\s+$/, "");
}

// --- Smoke test --------------------------------------------------------------

async function smokeTest(): Promise<number> {
  console.log("Booting tmux session...");
  const sess = await newSession(process.cwd());
  console.log(`  name=${sess.name} jsonl=${sess.jsonl}`);
  try {
    console.log("Sending trivial prompt...");
    const result = await sendPrompt(sess, "Reply with the single word 'pong'.", {
      timeoutMs: 180_000,
    });
    console.log(`  completed=${result.completed} subtype=${result.subtype ?? "-"}`);
    console.log(`  text=${JSON.stringify(result.text)}`);
    console.log(`  usage=${JSON.stringify(result.usage)}`);
    const ok = result.completed && result.text.toLowerCase().includes("pong");
    console.log(`  result: ${ok ? "OK" : "FAIL"}`);
    return ok ? 0 : 1;
  } finally {
    console.log("Killing session...");
    await killSession(sess);
  }
}

// Run smoke test only when invoked directly with the env gate set.
if (require.main === module) {
  if (process.env.CLAUDE_TMUX_LIVE_TEST !== "1") {
    console.error(
      "Live smoke test not enabled. Re-run with CLAUDE_TMUX_LIVE_TEST=1 " +
      "to actually launch claude (will consume a few tokens)."
    );
    process.exit(0);
  }
  smokeTest().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err);
      process.exit(2);
    },
  );
}
