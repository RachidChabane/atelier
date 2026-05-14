# Banned and Safe Flags

Verified against `claude` 2.1.141 (May 2026). Re-check on major releases.

## Banned interactively — these silently activate `--print` mode

Passing any of these to `claude` WITHOUT `-p` flips the entire invocation into print mode. Your "interactive" session quietly becomes programmatic and bills against the **programmatic pool**.

```
--output-format stream-json | json | text
--input-format stream-json | text
--max-turns N
--max-budget-usd
--include-hook-events
--include-partial-messages
--replay-user-messages
--no-session-persistence
```

Detection signal: running the binary with one of these flags but no stdin emits the error message:

```
Input must be provided ... when using --print
```

which proves the flag implies `--print`.

**If you used `--max-turns` for runaway protection**: it cannot be ported. Replace with a JSONL token watchdog. Track input/output/cache tokens across assistant rows, kill the session when caps are breached, and synthesize the same sentinel string your existing code already branches on (typically `subtype = "error_max_turns"`).

## Safe interactively — verified to work in interactive mode

```
--model <model>
--effort <effort>
--add-dir <path>
--session-id <uuid>
--resume <uuid>
--continue
--system-prompt <text>
--append-system-prompt <text>
--mcp-config <path>
--agents <spec>
--permission-mode bypassPermissions
--dangerously-skip-permissions
--allowedTools <list>
--settings <path>
--setting-sources <list>
--plugin-dir <path>
--plugin-url <url>
```

`--permission-mode bypassPermissions` and `--dangerously-skip-permissions` are interchangeable; pick one and stick with it.

## Wrong direction — do NOT use

- `--bare` — forces `ANTHROPIC_API_KEY` and switches the banner to "API Usage Billing". You billed pay-as-you-go API rates the moment you used this flag. Opposite of the goal.
- `--remote-control` — cloud relay to claude.ai for phone/web mirroring. Outbound HTTPS only, no local control. Not a programmatic API.
- `claude agents` subcommand — feature-flagged off by default; the `--bg` background-agent path is **programmatic-class** even when enabled.

## Authoritative reference

- <https://code.claude.com/docs/en/cli-reference>
- Cross-check the announcement at <https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan>.
