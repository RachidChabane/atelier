# migrate-to-interactive-claude

A skill that walks an agent through migrating a project from non-interactive `claude -p` invocations onto a tmux-driven interactive `claude` backend. Built for Anthropic's 2026-06-15 billing split: starting that date, `claude -p`, the Agent SDK, Claude Code GitHub Actions, and SDK-authenticated third-party apps draw from a separate, smaller, non-rollover programmatic credit pool. Interactive `claude` in a real terminal still bills against the normal subscription pool — this skill ports a project from the former onto the latter without breaking the existing wrapper contract.

Source: <https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan>.

## What ships

- Skill: **`migrate-to-interactive-claude`** — drives the 8-step migration: detect the current `claude -p` usage, present the plan, install tmux + libtmux, implement a session-lifecycle backend (marker-based completion detection, JSONL content/usage reading, JSONL token watchdog replacing the silently-`-p`-only `--max-turns`), wire backend selection through env > CLI > config (default stays on the existing print path), rewire kill paths through a tagged-union registry, validate against real `claude`, and update docs.
- Reference docs (verbatim): banned flags that silently activate `-p`, capture-pane idle-detection regex with ANSI strip, JSONL conversation schema with the cwd→slug path rule, marker-injection prompt template with the fresh-UUID-per-call rule.
- Runnable session snippets: Python (libtmux) and TypeScript (`child_process` + tmux CLI), both implementing `new_session`, `send_prompt`, `read_final_text`, `read_total_usage`, `kill`. Both ship a smoke test gated on `CLAUDE_TMUX_LIVE_TEST=1`.

## How to use

In a project that currently shells out to `claude -p` or the Agent SDK, describe the task in any words — *"migrate off claude -p"*, *"move this project to interactive claude"*, *"fix the credit pool bill"*, *"drive claude via tmux"* — and Claude will trigger the skill from the description match. Or invoke it directly:

```text
/migrate-to-interactive-claude
```

The skill will:

1. Grep the codebase for `claude -p`, `subprocess.*claude`, Agent SDK and Anthropic SDK imports.
2. Surface the billing rationale and the legal gray area, and get user sign-off on the migration direction (tmux + subscription vs accepting the programmatic pool vs `ANTHROPIC_API_KEY` pay-as-you-go).
3. Install tmux ≥ 3.3 and the libtmux dependency.
4. Add the tmux session backend, preserving the wrapper's existing public contract (same `returncode`, same `usage` dict shape, same side-channel telemetry) so the six-or-so call sites that hit the wrapper don't need to change.
5. Add an opt-in selector (env > CLI > config; default stays on the existing print path so backward compat is preserved).
6. Rewire kill paths from `pkill -P` (which can't reach claude inside the tmux server) to a tagged-union active-child registry.
7. Smoke-test the boot + trivial prompt + tool-using prompt + slash-content prompt + mid-run kill + token watchdog paths.
8. Update the project's README and changelog.

## What this skill does NOT do

- Does not flip the default backend. The existing `claude -p` path stays default; tmux is opt-in via env / CLI / config.
- Does not pursue dead ends already verified: `--output-format` interactively (silently activates `-p`), `--bare` (forces `ANTHROPIC_API_KEY`), `--remote-control` (cloud relay to claude.ai), `claude agents --bg` (programmatic-class), pexpect / screen / dtach (work technically but tmux is the de-facto standard).
- Does not decide the legal-gray-area call for the user. Anthropic's Consumer Terms §3(7) prohibit "automated or non-human means"; driving the official binary in a real PTY is a different framing than third-party harnesses spoofing the protocol; the skill surfaces this once and lets the user decide.

## See also

- The skill itself: [`skills/migrate-to-interactive-claude/SKILL.md`](skills/migrate-to-interactive-claude/SKILL.md)
- Banned-flags reference: [`skills/migrate-to-interactive-claude/reference/banned-flags.md`](skills/migrate-to-interactive-claude/reference/banned-flags.md)
- Idle-detection regex: [`skills/migrate-to-interactive-claude/reference/idle-detection-regex.md`](skills/migrate-to-interactive-claude/reference/idle-detection-regex.md)
- JSONL schema: [`skills/migrate-to-interactive-claude/reference/jsonl-schema.md`](skills/migrate-to-interactive-claude/reference/jsonl-schema.md)
- Marker injection template: [`skills/migrate-to-interactive-claude/reference/marker-injection-template.md`](skills/migrate-to-interactive-claude/reference/marker-injection-template.md)
- Runnable Python session starter: [`skills/migrate-to-interactive-claude/snippets/python-session.py`](skills/migrate-to-interactive-claude/snippets/python-session.py)
- Runnable TypeScript session starter: [`skills/migrate-to-interactive-claude/snippets/typescript-session.ts`](skills/migrate-to-interactive-claude/snippets/typescript-session.ts)
- Marketplace root: [`../../README.md`](../../README.md)
