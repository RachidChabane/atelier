# Conversation JSONL Schema

`claude` (both interactive and `-p`) persists every conversation as a line-delimited JSON file. This is the **source of truth** for assistant content and token usage in the tmux backend.

## Path

```
~/.claude/projects/<cwd-slug>/<session-uuid>.jsonl
```

Where `<cwd-slug>` is the cwd's absolute path with `/` replaced by `-`. The leading `-` is normal because absolute paths begin with `/`.

Example:

```
cwd:  /Users/alice/proj
slug: -Users-alice-proj
file: ~/.claude/projects/-Users-alice-proj/<session-uuid>.jsonl
```

Python:

```python
def jsonl_path(cwd: str, session_id: str) -> Path:
    # .resolve() expands symlinks to match claude's getcwd-based slug.
    # On macOS, /tmp -> /private/tmp; without resolve() the slug
    # diverges from where claude actually writes.
    slug = str(Path(cwd).resolve()).replace("/", "-")
    return Path.home() / ".claude" / "projects" / slug / f"{session_id}.jsonl"
```

## Timing — read this before designing your wait loop

**The JSONL is created AFTER the first user message arrives, not on session boot.**

If you `new-session` and immediately stat the JSONL, it will not exist. Wait until after `send-keys` delivers the first prompt — the JSONL appears within ~1–3 seconds.

Your boot-ready signal must therefore be capture-pane idle detection (see `idle-detection-regex.md`), not JSONL existence. The wait-for-completion loop on subsequent prompts can poll the JSONL directly.

## Line schema

One JSON object per line. `type` is one of:

```
"user", "assistant", "system", "attachment", ...
```

Assistant rows carry the content + usage we care about:

```json
{
  "type": "assistant",
  "message": {
    "content": [
      {"type": "text", "text": "..."},
      {"type": "tool_use", "..." : "..."}
    ],
    "usage": {
      "input_tokens": 1234,
      "output_tokens": 567,
      "cache_read_input_tokens": 8901,
      "cache_creation_input_tokens": 234,
      "service_tier": "...",
      "iterations": 1
    }
  }
}
```

The `usage` block has the **same shape** as `claude -p --output-format json` emits. Any telemetry that consumes the print-mode usage block is a drop-in replacement.

## Reading content from JSONL

Walk the JSONL, find the LAST `type == "assistant"` row, join the `text` from `message.content` entries where `type == "text"` (skip `tool_use` blocks):

```python
import json
from pathlib import Path

def latest_assistant_text(jsonl: Path) -> str:
    last_text = ""
    with jsonl.open() as f:
        for line in f:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("type") != "assistant":
                continue
            content = row.get("message", {}).get("content", [])
            parts = [b.get("text", "") for b in content if b.get("type") == "text"]
            last_text = "".join(parts)
    return last_text
```

Strip the completion marker (see `marker-injection-template.md`) before returning to the caller.

## Summing usage across a session

```python
def session_usage(jsonl: Path) -> dict:
    totals = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_input_tokens": 0,
        "cache_creation_input_tokens": 0,
    }
    with jsonl.open() as f:
        for line in f:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("type") != "assistant":
                continue
            usage = row.get("message", {}).get("usage", {}) or {}
            for k in totals:
                totals[k] += int(usage.get(k) or 0)
    return totals
```

## Why not capture-pane

- ANSI noise — capture output for a trivial turn is several KB of escape codes.
- Verb-cycling animation frames can land mid-content.
- Tool-use blocks render visibly different from their structured JSONL form.

JSONL is **clean structured data** with stable field names. Always read content here.
