# Idle Detection on capture-pane

Primary completion signal is the marker in the JSONL (see `marker-injection-template.md`). Idle detection is the **fallback**, triggered when the marker has not appeared within `timeout * 0.8`. It is also the **boot signal** — the JSONL does not exist until after the first user message, so use idle detection (not JSONL existence) to know that `claude` has finished booting and is ready to receive a prompt.

## ANSI strip

`tmux capture-pane -p` output contains ANSI escape sequences. Strip them before regex matching:

```python
import re

ANSI = re.compile(r'\x1b\[[0-9;?]*[A-Za-z]')

def strip_ansi(text: str) -> str:
    return ANSI.sub("", text)
```

## Idle pattern

The TUI's idle screen has a recognizable footer. After ANSI stripping, an idle pane contains all of:

1. A line matching `^>\s*$` (empty input prompt) — the user-input line.
2. That line is bracketed above and below by two horizontal rules made of U+2500 (`─`) characters, each at least 20 chars long.
3. A footer line below the second rule that contains **both** the literal text `bypass permissions on` AND `tokens`. Example:

   ```
   ⏵⏵ bypass permissions on (shift+tab to cycle)            33075 tokens
   ```

## Reference idle check

```python
import re

ANSI = re.compile(r'\x1b\[[0-9;?]*[A-Za-z]')
EMPTY_PROMPT = re.compile(r'^>\s*$', re.MULTILINE)
RULE = re.compile(r'─{20,}')
FOOTER = re.compile(r'bypass permissions on.*tokens', re.IGNORECASE)

def is_idle(capture_output: str) -> bool:
    text = ANSI.sub("", capture_output)
    if not EMPTY_PROMPT.search(text):
        return False
    if len(RULE.findall(text)) < 2:
        return False
    return bool(FOOTER.search(text))
```

## Verb cycling caveat — DO NOT pin on the verb

Above the input line, the TUI cycles through verbs while it works:

```
Worked | Baked | Crunched | Cooked | Brewed | Sautéing | ...
```

The set rotates across `claude` releases. **Match the footer pattern, not the verb.** Code that pins on a specific verb will silently break on the next release.

## What capture-pane is NOT for

- Reading assistant content. Use the JSONL — capture-pane is ANSI-noisy and may include verb-cycling animation frames mid-content. See `jsonl-schema.md`.
- A primary completion signal. Use the marker. See `marker-injection-template.md`.

## What capture-pane IS for

- Boot detection (idle before the first prompt is sent).
- Fallback completion detection when the marker is missing or arrives slowly.
- Matching usage-limit strings against rendered output. These strings are ASCII (length-cap match window at ~200 chars to avoid false positives in prose):

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
