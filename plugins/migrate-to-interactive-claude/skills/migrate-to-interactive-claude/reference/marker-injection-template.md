# Marker Injection Template

Primary completion-detection mechanism: append an instruction to every prompt asking Claude to terminate its final assistant message with a unique line containing a fresh marker. Detection then becomes a substring check on the latest assistant text in the JSONL.

## The marker string

Format:

```
<<DONE-{12-hex}>>
```

Where `{12-hex}` is a **fresh** value per call:

```python
import uuid
marker = f"<<DONE-{uuid.uuid4().hex[:12]}>>"
```

**Never** use a constant marker across calls. A constant marker triggers false-positive completion when the model quotes the marker string in explanatory text — e.g. when you ask the model how the marker mechanism works.

## The verbatim instruction to append

Append this to every prompt body, separated from the user's text by a horizontal rule and a blank line:

```text


---
When you have completed the task above, end your final assistant message
with a separate last line containing exactly `<<DONE-{12-hex}>>` and
nothing else. Do not include this marker anywhere else — not in tool
output, not in intermediate text, only on the very last line. If you
cannot complete the task, still end with the marker line after
explaining what blocked you.
```

Substitute the literal `{12-hex}` placeholder with the fresh hex you generated above.

The closing clause — "**still end with the marker line after explaining what blocked you**" — is mandatory. Refusals without a marker time out instead of returning the refusal text to the caller.

## Reference Python builder

```python
import uuid

MARKER_TEMPLATE = """

---
When you have completed the task above, end your final assistant message
with a separate last line containing exactly `<<DONE-{marker}>>` and
nothing else. Do not include this marker anywhere else — not in tool
output, not in intermediate text, only on the very last line. If you
cannot complete the task, still end with the marker line after
explaining what blocked you.
"""

def build_prompt(user_text: str) -> tuple[str, str]:
    """Return (augmented_prompt, marker) — caller passes marker to wait_for_completion."""
    token = uuid.uuid4().hex[:12]
    marker = f"<<DONE-{token}>>"
    return user_text + MARKER_TEMPLATE.format(marker=token), marker
```

## Detection

Detection: tail the JSONL, for each assistant row join the `text` blocks under `content`, check if the joined text `rstrip()`s to end with the marker.

```python
def is_complete(latest_assistant_text: str, marker: str) -> bool:
    return latest_assistant_text.rstrip().endswith(marker)
```

Strip the marker before returning the text to the caller:

```python
def strip_marker(text: str, marker: str) -> str:
    stripped = text.rstrip()
    if stripped.endswith(marker):
        stripped = stripped[: -len(marker)].rstrip()
    return stripped
```

## Verified properties

- Marker survives Bash tool calls in `claude`'s interactive TUI.
- Bracketed paste (`tmux paste-buffer -p -d`) preserves prompts containing literal `/` lines, so the marker instruction's `---` and the user's content are both delivered as content rather than interpreted by the TUI as commands.

## Token-budget hint (optional)

If your wrapper imposes per-call token caps (replacing `--max-turns`), append this **before** the marker instruction so the model can pace itself:

```text

---
You have a token budget of approximately {N} for this turn. After that,
the session will be terminated. Plan accordingly.
```

The model treats this as guidance, not a hard limit — the watchdog enforces the hard limit by killing the session.

## Where to inject

At the **lowest-level wrapper boundary**, BEFORE sending to claude. Caller-built prompts (planner, reviewer, implementer, etc.) need no changes — the wrapper augments. This keeps the cut point clean and prevents leaking marker logic into business code.
