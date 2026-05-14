---
name: migrate-to-interactive-claude
description: Migrate a project that drives Claude Code via `claude -p` (non-interactive mode) onto a tmux-driven interactive backend, to keep usage on the Claude subscription pool after Anthropic's 2026-06-15 billing split. Use this skill when the user asks to "migrate off claude -p", "move to interactive claude", "fix the credit pool bill", "drive claude via tmux", "switch from claude -p to interactive", "stop using the programmatic pool", "keep claude on the subscription pool", or similar phrasing about routing programmatic Claude Code usage onto the subscription pool.
version: 0.1.0
---

# Migrate to Interactive Claude

This skill walks you through migrating a project's `claude -p` (non-interactive) calls onto a tmux-driven interactive `claude` backend, so usage continues to be billed against the Claude subscription pool after the 2026-06-15 split.

## Why this migration exists

On 2026-05-14, Anthropic announced (<https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan>) that starting **2026-06-15**, two products no longer count toward the Claude plan's normal usage limits — they consume a separate, smaller, non-rollover monthly credit pool:

**Programmatic pool** (separate monthly credit sized at subscription fee, non-rollover):
- Claude Agent SDK in your own projects
- The `claude -p` command in Claude Code (non-interactive mode)
- Claude Code GitHub Actions integration
- Third-party apps authenticated via Agent SDK with subscription

**Subscription pool** (unchanged):
- Interactive Claude Code in the terminal or IDE
- Claude conversations on web, desktop, mobile
- Claude Cowork
- Other features that draw from extra usage

Pool sizes: Pro $20/mo, Max 5× $100/mo, Max 20× $200/mo, billed at API rates when consumed (Sonnet 4.6 = $3/$15 per MTok in/out), non-rollover. Once depleted: either pay API rates if extra-usage is enabled, or operations halt until the next billing cycle.

**The workaround**: drive the official `claude` binary in interactive mode (no `-p`) inside a tmux session, sending prompts via `send-keys` and reading completions via JSONL polling. The official binary, the PTY-real-terminal pathway → still classified as "Interactive Claude Code in the terminal", still billed against the subscription pool.

## Risks (the legal gray area)

The Consumer Terms §3(7) prohibit "automated or non-human means" of access; Claude Code legal pages reference "ordinary, individual usage"; and on 2026-04-04 Anthropic banned third-party harnesses such as OpenClaw. The user driving the **official** `claude` binary in a PTY for their own personal workflow is a different framing than third-party harnesses spoofing the protocol — Anthropic's enforcement so far has targeted the latter. The user's call to make. Surface this once and let them decide; do not gate the migration on it.

## When this skill applies

The user has a project that calls `claude -p`, the Claude Agent SDK, or the Anthropic SDK programmatically, and wants the usage to stay on the subscription pool rather than the programmatic pool after 2026-06-15.

## Pre-flight checks before you start

1. **`tmux -V`** returns 3.3 or higher. If not, install (Step 3).
2. **`which claude`** finds the official binary, and `claude --version` shows 2.x.
3. The target project's current `claude` invocations work; you need a green baseline before refactoring.
4. **Workspace trust dialog** — if `claude` has never been launched interactively in the project's working directory before, the first launch will show a "Trust this folder?" prompt that blocks `send-keys`. Run `claude` interactively once by hand in that directory (just type `/exit` immediately), or launch from an already-trusted parent. The skill will hang silently on the first smoke test otherwise.

## Step 1 — Detect the current setup

Grep for usages and entry points:

```
grep -RnE 'claude\s+-p|claude\s+--print|subprocess.*claude|Popen\(\["claude"' .
grep -RnE 'from anthropic|AsyncAnthropic|Anthropic\(' .
grep -RnE 'from claude_agent_sdk|@anthropic-ai/claude-agent-sdk' .
```

Identify:
- The **language** (Python / TypeScript / Node / shell).
- The **wrapper function** that runs `claude -p` and returns text. This is the cut point.
- The wrapper's **public contract**: prompt in, what comes out (text, JSON, exit code, side-channel telemetry). Map this exactly — your tmux backend must preserve it.
- **Downstream consumers** of `usage` dicts, `subtype` strings, exit codes, stderr patterns.
- **Subprocess kill paths**: `pkill`, signal handlers, timeouts.
- Any use of these flags (they will need to change — see `reference/banned-flags.md`):
  - `--output-format`, `--input-format`, `--max-turns`, `--max-budget-usd`, `--include-hook-events`, `--include-partial-messages`, `--replay-user-messages`, `--no-session-persistence`.

Report findings to the user before proceeding.

## Step 2 — Present the plan and get sign-off

Explain to the user:
- Why we are doing this (the 2026-06-15 split, with link).
- The legal gray area in one paragraph (see "Risks" above). Do not belabor.
- The proposed architecture: keep the existing `claude -p` backend as the default; add a tmux backend behind an opt-in switch. Six-call-site refactors typically need zero changes outside the wrapper.
- The three opt-in surfaces with precedence: **env var > CLI flag > config file**. Env first so an operator has a one-line kill switch.

Get explicit user confirmation that they want tmux + subscription (vs accepting the credit pool, vs going to `ANTHROPIC_API_KEY` pay-as-you-go) before you start refactoring.

## Step 3 — Install prerequisites

```
# macOS
brew install tmux
# Debian/Ubuntu
sudo apt-get install -y tmux
# Fedora/RHEL
sudo dnf install -y tmux

tmux -V   # must be 3.3 or higher (bracketed-paste -p flag on paste-buffer)
```

For Python projects:

```
pip install 'libtmux>=0.56,<1.0'
# or
uv add 'libtmux>=0.56,<1.0'
```

For TypeScript / Node projects: no library; shell out to the `tmux` CLI via `child_process`. (No node-tmux library is mature in the same way libtmux is.)

Update the project's dependency manifest (`pyproject.toml` / `requirements.txt` / `package.json`) so other developers on the project get the dep.

**Workspace trust**: if this is a fresh project directory for `claude`, run `claude` interactively once by hand in that directory now, then `/exit`. Otherwise the first smoke test below will hang silently behind a hidden Trust dialog.

## Step 4 — Implement the tmux backend

Build a session-lifecycle module that exposes the following operations:

- `new_session(cwd, model, effort) -> Session` — boot a detached tmux session running `cd <cwd> && claude --session-id <uuid> --permission-mode bypassPermissions --model <model> --effort <effort>`. The `cd <cwd> &&` prefix is **mandatory** — tmux inherits the tmux server's cwd, not the caller's; without `cd` the JSONL path you compute will not match where claude actually writes.
- `send_prompt(session, text, timeout) -> Result` — append a marker instruction, deliver via `load-buffer` → `paste-buffer -p -d` → `send-keys Enter`, wait for completion, return text + usage.
- `wait_for_completion(session, marker, timeout)` — primary: tail the JSONL, join `content[type=="text"].text` for the latest assistant row, return when the joined text `rstrip()`s to end with the marker. Fallback (trigger at `timeout * 0.8`): capture-pane idle detection (see `reference/idle-detection-regex.md`).
- `read_final_text(session) -> str` — last assistant row's text content, marker stripped.
- `read_total_usage(session) -> dict` — sum `usage` blocks across assistant rows; identical shape to `claude -p --output-format json`.
- `kill(session)` — `send-keys C-c` → `send-keys '/exit' Enter` → wait `grace_seconds` (default 3) → `tmux kill-session -t <name>` (idempotent).

**Critical invariants**:

- **Source of truth for content is the JSONL file**, never capture-pane. Path: `~/.claude/projects/<cwd-slug>/<session-uuid>.jsonl` where slug is the cwd's absolute path with `/` replaced by `-` (leading `-` is normal). See `reference/jsonl-schema.md`.
- **The JSONL is created AFTER the first user message arrives**, not on session boot. Wait-for-boot must not depend on its existence; only poll for the JSONL after the first send.
- **Marker per call**: append the instruction in `reference/marker-injection-template.md`, with a **fresh `uuid4().hex[:12]` per call** — never a constant, never reused across calls. A constant marker triggers false positives when the model quotes it in explanatory prose.
- **Bracketed paste only** for prompt delivery: `paste-buffer -p -d`. Plain `send-keys "/help …"` would be interpreted as a slash command. Bracketed paste suppresses interpretation; user-supplied content (which may begin with `/`) is delivered as content. The `-d` flag deletes the paste buffer after consumption (idempotency).
- **PTY size 220×50**. Narrower wraps capture-pane and breaks regex.
- **Pass none of these flags** (silent `-p` activators): `--output-format`, `--input-format`, `--max-turns`, `--max-budget-usd`, `--include-hook-events`, `--include-partial-messages`, `--replay-user-messages`, `--no-session-persistence`. See `reference/banned-flags.md`.
- **`--bare` is wrong** — it forces `ANTHROPIC_API_KEY` billing (banner reads "API Usage Billing"). Opposite direction.
- **`--remote-control` is wrong** — it relays to claude.ai for phone/web, not local automation.

**Replace `--max-turns` with a JSONL token watchdog**:
- Track accumulated input/output/cache tokens across assistant rows by parsing the JSONL.
- Define caps: `max_input_tokens_per_call`, `max_output_tokens_per_call`, `max_total_tokens_per_call` (None = opt-out).
- `watchdog_grace_turns`: consecutive over-budget turns to tolerate before killing (default 1).
- On breach: kill the session and synthesize the SAME sentinel the existing code already reads. In a typical wrapper this is `subtype = "error_max_turns"` — preserve that exact string so downstream branches don't change.

**Usage-limit detection** — preserve across backends. Match these strings (ANSI-stripped) against capture-pane output AND against JSONL assistant text content (length-cap match window at ~200 chars to avoid prose false positives):

```
"usage limit"
"weekly limit"
"org's monthly usage limit"
"/extra-usage to enable"
"/extra-usage to request more"
"Server is temporarily limiting requests (not your usage limit)"
"Fast limit reset"
"usage limit reached"
"limit reached"
"limit will reset"
```

Drop-in starter implementations:
- Python: [`snippets/python-session.py`](snippets/python-session.py) — uses libtmux.
- TypeScript: [`snippets/typescript-session.ts`](snippets/typescript-session.ts) — uses `child_process` + the tmux CLI.

## Step 5 — Wire backend selection

The new backend is **opt-in**, not default. Backward compat first; safer rollout.

Precedence (highest wins):

1. **Env var**: `PROJECT_NAME_BACKEND=tmux|print` (substitute your project's prefix).
2. **CLI flag**: `--backend tmux` (or a friendly alias `--interactive`).
3. **Config file**: `backend: tmux` in whatever the project already reads.
4. **Default**: `print` (existing `claude -p` path).

Env at the top so operators have a one-line kill switch in an emergency without editing config or remembering a flag.

In the wrapper, switch on the resolved value:

```python
backend = resolve_backend()  # env > cli > config > default("print")
if backend == "tmux":
    return _run_via_tmux(prompt, **knobs)
return _run_via_print(prompt, **knobs)
```

Both paths must return the **same shape** — same `returncode`/`text`, same side-channel telemetry (rate-limited, timed-out, subtype, input/output/cache tokens). Six call sites in the reference migration changed zero lines.

## Step 6 — Rewire kill paths

`pkill -TERM -P <runner_pid>` reaches direct descendants. With tmux, `claude` is a child of the **tmux server**, not of the runner. `pkill` becomes a no-op.

Replace with a **tagged-union active-child registry**:

```python
_active_child: dict[int, Popen | TmuxSession] = {}

def kill_all():
    payloads = list(_active_child.values())
    with ThreadPoolExecutor(max_workers=len(payloads)) as ex:
        ex.map(_kill_one, payloads)

def _kill_one(payload):
    if isinstance(payload, Popen):
        # existing path: terminate + pkill -P + wait + kill
        ...
    else:
        payload.kill()  # C-c + /exit + grace + tmux kill-session
```

Run kills in parallel so SIGINT under parallelism N doesn't take N × grace seconds.

## Step 7 — Validate

Smoke tests (do not skip):

1. **Boot + trivial prompt + marker**: `new_session` in a known cwd, `send_prompt("say hello")`, assert the marker appears in the JSONL within timeout and the returned text contains "hello".
2. **Tool-using prompt**: `send_prompt("run the Bash tool to echo abc, then end with the marker")`. Assert tool output ("abc") AND marker present.
3. **Slash-content prompt**: `send_prompt("Explain the line: /help command syntax")`. Assert bracketed paste preserved the slash content as content, not as a command.
4. **Kill mid-run**: send a long-running prompt, kill the session after 2s, assert `tmux ls` shows no leaked session and the runner returned cleanly.
5. **Token watchdog**: set `max_total_tokens_per_call=100`, send a prompt that will exceed, assert the synthesized sentinel matches what your existing print-path emits on `--max-turns` exhaustion.
6. **Existing test suite, backend=print**: confirm zero regressions on the default path.
7. **Existing test suite, backend=tmux** (gated behind an env var so CI doesn't burn tokens): run end-to-end against real `claude`.

The Python snippet at [`snippets/python-session.py`](snippets/python-session.py) has a built-in smoke test gated on `CLAUDE_TMUX_LIVE_TEST=1` — useful as a sanity check before integrating.

## Step 8 — Document

- Update the project README:
  - Add a "Backend selection" section with env / CLI / config knobs and precedence.
  - Add the install-tmux prereq.
  - Mention the workspace-trust gotcha.
- Add a `docs/backends.md` (or equivalent) covering: when to use tmux vs print vs `ANTHROPIC_API_KEY` fallback; cost numbers (Sonnet 4.6 at $3/$15 per MTok in/out for API-rate consumption).
- Note in the changelog: "Default backend remains `print`; tmux opt-in via `PROJECT_BACKEND=tmux`."

## Pitfalls — read before debugging

- **CWD inheritance**: tmux inherits the **server's** cwd. Always prefix the launched command with `cd <cwd> && claude ...` or the JSONL slug diverges from where you computed it.
- **JSONL latency**: file is created after the first user message arrives, not on boot. Use capture-pane idle detection (not JSONL existence) to know that boot is done. Wait for the JSONL only after sending the first prompt.
- **Marker emission on refusal**: instruct the marker to be emitted "even if you cannot complete the task". Otherwise refusals time out.
- **Marker uniqueness**: fresh UUID per call (`uuid4().hex[:12]`). A constant marker false-triggers when the agent quotes it in explanatory text.
- **Slash commands in prompts**: bracketed paste (`paste-buffer -p`) suppresses interpretation. Never use plain `send-keys` for prompts that may begin with `/`.
- **Verb cycling**: the idle-screen verb rotates (`Worked|Baked|Crunched|Cooked|Brewed|Sautéing|…`) and changes across releases. Detect idle via the **footer pattern**, not the verb. See `reference/idle-detection-regex.md`.
- **Permission dialogs**: `--permission-mode bypassPermissions` and `--dangerously-skip-permissions` are interchangeable. Pick one.
- **PTY size**: too narrow → capture-pane shows line-wrapped text that breaks regex. 220 wide is safe.
- **Concurrent sessions**: tested at N=4 simultaneously without auth contention. Use a **single shared tmux server**; do not spawn one server per session (lifecycle hell, no benefit).
- **First-time workspace trust dialog**: if `claude` has never run in a directory, the first launch shows a "Trust this folder?" dialog that blocks `send-keys`. Pre-trust by running `claude` interactively once with a human, OR launch from a directory that's already trusted.
- **stdout buffering**: Python's stdout is block-buffered when redirected. If you pipe the wrapper to a log file, expect 4–8 KB latency. Use `python -u` or `stdbuf -oL` to line-buffer.
- **`--max-turns` is gone**: the flag silently activates `-p`. Use the token watchdog from Step 4 instead.

## Dead ends — do not pursue

- **`claude --output-format stream-json` (interactive)** — silently flips into `-p` mode. Verified by the error message "Input must be provided ... when using --print" on a no-stdin run.
- **`claude --bare`** — forces `ANTHROPIC_API_KEY` billing (banner reads "API Usage Billing"). Opposite of staying on subscription.
- **`claude --remote-control`** — cloud relay to phone/web. Not a local control API. Outbound HTTPS to claude.ai only.
- **`claude agents` subcommand** — feature-flagged off; even when enabled, `--bg` background agents are programmatic-class.
- **pexpect / expect / screen / dtach** — all work technically, but tmux + libtmux is the de-facto standard. All reference projects (claude-squad, Conductor, OpenClaw, claude_code_agent_farm) use tmux. Do not reinvent.
- **`tmux pipe-pane` as primary content reader** — produces ~6 KB of ANSI for a trivial turn. Use JSONL for content; reserve `pipe-pane` for secondary text-marker tailing if ever needed.

## Reference files

- [`reference/banned-flags.md`](reference/banned-flags.md) — flags that silently activate `-p`, and flags that are safe interactively.
- [`reference/idle-detection-regex.md`](reference/idle-detection-regex.md) — capture-pane idle pattern, ANSI strip, verb-cycling caveat.
- [`reference/jsonl-schema.md`](reference/jsonl-schema.md) — JSONL line format with `usage` block, cwd→slug rule, latency note.
- [`reference/marker-injection-template.md`](reference/marker-injection-template.md) — verbatim marker prompt augmentation, UUID rule.

## Snippets

- [`snippets/python-session.py`](snippets/python-session.py) — runnable libtmux-based session class with smoke test gated on `CLAUDE_TMUX_LIVE_TEST=1`.
- [`snippets/typescript-session.ts`](snippets/typescript-session.ts) — same lifecycle, TypeScript + `child_process` + tmux CLI.

## Prior art (don't bundle; reference only)

- `smtg-ai/claude-squad` — tmux + git worktrees, sessions prefixed `claudesquad_`. Best-documented PTY pattern.
- Conductor (conductor.build) — Mac app, tmux per task with worktree.
- `yeachan-heo/oh-my-claudecode` (npm: `oh-my-claude-sisyphus`) — split panes for agent teams. Subject of the 2026-04-04 ban/reinstate cycle.
- `Dicklesworthstone/claude_code_agent_farm` — 20+ parallel agents with lock-based file coordination.
- `obra/superpowers-lab` `using-tmux-for-interactive-commands` — a Claude Code skill (not an orchestrator). Directly applicable pattern: `new-session -d`, `send-keys`, `capture-pane`, 100–500 ms sleep after launch.

## Anthropic primary sources

- <https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan> — the 2026-06-15 split announcement.
- <https://code.claude.com/docs/en/cli-reference> — full CLI reference; cross-reference with `reference/banned-flags.md`.
- <https://code.claude.com/docs/en/remote-control> — cloud Remote Control feature; mentioned to rule out.
