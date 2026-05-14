# migrate-to-interactive-claude

A Claude Code skill that walks an agent through migrating a project from non-interactive `claude -p` invocations onto a tmux-driven interactive `claude` backend.

## Why

On 2026-06-15 Anthropic splits Claude plan usage into two pools:

- **Programmatic pool** (separate monthly credit sized at subscription fee, non-rollover): Claude Agent SDK, `claude -p`, Claude Code GitHub Actions, third-party apps authenticated via Agent SDK.
- **Subscription pool** (unchanged): interactive Claude Code in the terminal or IDE, Claude conversations on web/desktop/mobile, Claude Cowork, other features that draw from extra usage.

Source: <https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan>

Projects that currently shell out to `claude -p` will start consuming the smaller, non-rollover programmatic pool. Driving the official `claude` binary in interactive mode through a tmux PTY keeps usage on the subscription pool.

## What the skill does

When invoked, the skill:

1. Detects the project's current `claude -p` usage.
2. Surfaces the billing rationale and the legal gray area, lets the user choose.
3. Installs tmux + libtmux (or the Node/TS equivalent).
4. Implements a tmux-driven session backend with marker-based completion detection, JSONL-based content/usage reading, and a token watchdog (replacing the silently-`-p`-only `--max-turns` flag).
5. Wires backend selection through env > CLI > config, defaulting to the existing print backend for backward compatibility.
6. Rewires kill paths through a tagged-union active-child registry.
7. Validates against a real `claude` install.
8. Updates documentation.

See [`skills/migrate-to-interactive-claude/SKILL.md`](skills/migrate-to-interactive-claude/SKILL.md) for the full walkthrough.

## Invocation

The skill auto-activates when a user mentions:

- "migrate off claude -p"
- "move to interactive claude"
- "fix the credit pool bill"
- "drive claude via tmux"
- similar phrasing

## Files

```
skills/migrate-to-interactive-claude/
├── SKILL.md
├── reference/
│   ├── banned-flags.md
│   ├── idle-detection-regex.md
│   ├── jsonl-schema.md
│   └── marker-injection-template.md
└── snippets/
    ├── python-session.py
    └── typescript-session.ts
```
