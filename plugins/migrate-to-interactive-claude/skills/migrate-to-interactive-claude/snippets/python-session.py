"""Tmux-backed Claude Code session.

Drop-in starter for projects migrating off `claude -p`. Drives an interactive
`claude` session inside a detached tmux window, sends prompts via bracketed
paste, and reads completions out of the JSONL conversation file. Designed so
the wrapper's public contract (prompt in -> text + usage out) stays the same
as the existing `-p` path.

Requires: tmux >= 3.3, libtmux >= 0.56, claude CLI >= 2.x, Python >= 3.9.

Smoke test (will actually launch claude and consume a few tokens):

    CLAUDE_TMUX_LIVE_TEST=1 python python-session.py

Reference: see ../SKILL.md, and the sibling reference/ docs.
"""

from __future__ import annotations

import json
import os
import re
import tempfile
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import libtmux


# --- Constants ---------------------------------------------------------------

PTY_WIDTH = 220
PTY_HEIGHT = 50

ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")
EMPTY_PROMPT_RE = re.compile(r"^>\s*$", re.MULTILINE)
RULE_RE = re.compile(r"─{20,}")
FOOTER_RE = re.compile(r"bypass permissions on.*tokens", re.IGNORECASE)

USAGE_LIMIT_PATTERNS = [
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
]

# Append to every prompt. {marker} is replaced with a fresh per-call hex.
MARKER_INSTRUCTION = """

---
When you have completed the task above, end your final assistant message
with a separate last line containing exactly `<<DONE-{marker}>>` and
nothing else. Do not include this marker anywhere else - not in tool
output, not in intermediate text, only on the very last line. If you
cannot complete the task, still end with the marker line after
explaining what blocked you.
"""


# --- Data types --------------------------------------------------------------


@dataclass
class TokenCaps:
    """Optional per-call token budget. None = unlimited on that axis."""

    max_input_tokens: Optional[int] = None
    max_output_tokens: Optional[int] = None
    max_total_tokens: Optional[int] = None
    grace_turns: int = 1  # consecutive over-budget turns tolerated


@dataclass
class SendResult:
    text: str
    usage: dict
    completed: bool
    subtype: Optional[str] = None  # e.g. "error_max_turns", "rate_limited"
    raw_capture: str = ""


@dataclass
class TmuxSession:
    name: str
    session_id: str
    cwd: Path
    jsonl: Path
    _server: libtmux.Server = field(repr=False)
    _libtmux_session: libtmux.Session = field(repr=False)


# --- Public API --------------------------------------------------------------


def new_session(
    cwd: str | Path,
    model: str = "claude-sonnet-4-6",
    effort: str = "medium",
    *,
    name_prefix: str = "claude",
) -> TmuxSession:
    """Boot a detached tmux session running claude in interactive mode.

    `cd <cwd> &&` prefix is mandatory: the tmux server inherits its own cwd,
    not the caller's. Without it, the JSONL path computed below will not
    match where claude actually writes.
    """
    cwd_path = Path(cwd).expanduser().resolve()
    if not cwd_path.is_dir():
        raise FileNotFoundError(f"cwd does not exist: {cwd_path}")

    session_id = str(uuid.uuid4())
    name = f"{name_prefix}-{session_id[:8]}"

    cmd = (
        f"cd {_shquote(str(cwd_path))} && "
        f"claude --session-id {session_id} "
        f"--permission-mode bypassPermissions "
        f"--model {_shquote(model)} "
        f"--effort {_shquote(effort)}"
    )

    server = libtmux.Server()
    server.cmd(
        "new-session",
        "-d",
        "-s", name,
        "-x", str(PTY_WIDTH),
        "-y", str(PTY_HEIGHT),
        cmd,
    )

    libtmux_session = next(
        (s for s in server.sessions if s.session_name == name),
        None,
    )
    if libtmux_session is None:
        raise RuntimeError(f"tmux new-session {name!r} did not appear in server.sessions")

    jsonl = _jsonl_path(cwd_path, session_id)

    session = TmuxSession(
        name=name,
        session_id=session_id,
        cwd=cwd_path,
        jsonl=jsonl,
        _server=server,
        _libtmux_session=libtmux_session,
    )

    _wait_for_boot(session, boot_timeout=30.0)
    return session


def send_prompt(
    session: TmuxSession,
    user_text: str,
    *,
    timeout: float = 300.0,
    token_caps: Optional[TokenCaps] = None,
) -> SendResult:
    """Send a prompt, wait for completion, return text + usage."""
    marker_token = uuid.uuid4().hex[:12]  # fresh per call - never reuse
    marker = f"<<DONE-{marker_token}>>"
    augmented = user_text + MARKER_INSTRUCTION.format(marker=marker_token)

    _paste_prompt(session, augmented)
    _send_enter(session)

    return _wait_for_completion(
        session,
        marker=marker,
        timeout=timeout,
        token_caps=token_caps,
    )


def read_final_text(session: TmuxSession) -> str:
    """Return the last assistant turn's joined text content, marker stripped."""
    if not session.jsonl.exists():
        return ""
    return _strip_known_markers(_latest_assistant_text(session.jsonl))


def read_total_usage(session: TmuxSession) -> dict:
    """Sum usage across every assistant row in this session's JSONL."""
    totals = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_input_tokens": 0,
        "cache_creation_input_tokens": 0,
    }
    if not session.jsonl.exists():
        return totals
    for row in _iter_assistant_rows(session.jsonl):
        usage = row.get("message", {}).get("usage", {}) or {}
        for k in totals:
            totals[k] += int(usage.get(k) or 0)
    return totals


def kill(session: TmuxSession, grace_seconds: float = 3.0) -> None:
    """Graceful shutdown: C-c, /exit, wait, then hard tmux kill-session."""
    try:
        session._server.cmd("send-keys", "-t", session.name, "C-c")
    except Exception:
        pass
    time.sleep(0.2)
    # Plain send-keys here (not bracketed paste): we WANT `/exit` interpreted
    # as a slash command. The opposite of prompt delivery in _paste_prompt.
    try:
        session._server.cmd("send-keys", "-t", session.name, "/exit", "Enter")
    except Exception:
        pass

    deadline = time.time() + grace_seconds
    while time.time() < deadline:
        if not _session_alive(session):
            return
        time.sleep(0.2)

    # Idempotent hard reap.
    try:
        session._server.cmd("kill-session", "-t", session.name)
    except Exception:
        pass


# --- Internals: paste / send -------------------------------------------------


def _paste_prompt(session: TmuxSession, text: str) -> None:
    """Bracketed paste via load-buffer + paste-buffer -p -d.

    Bracketed paste suppresses slash-command interpretation, so user content
    containing literal "/help" or "/exit" lines is delivered as content.
    The -d flag deletes the paste buffer after consumption (idempotency).
    """
    buffer_name = f"buf-{uuid.uuid4().hex[:8]}"
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as tmp:
        tmp.write(text)
        tmp.flush()
        tmp_path = tmp.name
    try:
        session._server.cmd(
            "load-buffer",
            "-t", session.name,
            "-b", buffer_name,
            tmp_path,
        )
        session._server.cmd(
            "paste-buffer",
            "-t", session.name,
            "-b", buffer_name,
            "-p",  # bracketed paste
            "-d",  # delete buffer after paste
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _send_enter(session: TmuxSession) -> None:
    # Send a bare Enter via the tmux CLI - more portable than libtmux's
    # send_keys("", enter=True) which behaves slightly differently across versions.
    session._server.cmd("send-keys", "-t", session.name, "Enter")


def _first_pane(session: TmuxSession):
    sess = session._libtmux_session
    window = sess.attached_window or sess.windows[0]
    return window.attached_pane or window.panes[0]


# --- Internals: completion ---------------------------------------------------


def _wait_for_completion(
    session: TmuxSession,
    *,
    marker: str,
    timeout: float,
    token_caps: Optional[TokenCaps],
) -> SendResult:
    start = time.time()
    fallback_deadline = start + timeout * 0.8
    hard_deadline = start + timeout
    over_budget_turns = 0
    last_assistant_idx = -1

    while time.time() < hard_deadline:
        # Usage-limit detection: capture-pane is ANSI-noisy but cheap.
        capture = _capture_pane_plain(session)
        for pat in USAGE_LIMIT_PATTERNS:
            if pat.lower() in capture.lower():
                return SendResult(
                    text=read_final_text(session),
                    usage=read_total_usage(session),
                    completed=False,
                    subtype="rate_limited",
                    raw_capture=capture,
                )

        # Primary: marker in JSONL latest assistant row.
        if session.jsonl.exists():
            text = _latest_assistant_text(session.jsonl)
            if text.rstrip().endswith(marker):
                return SendResult(
                    text=_strip_marker(text, marker),
                    usage=read_total_usage(session),
                    completed=True,
                    raw_capture=capture,
                )

            # Token watchdog (replaces --max-turns).
            if token_caps is not None:
                rows = list(_iter_assistant_rows(session.jsonl))
                if len(rows) > last_assistant_idx:
                    last_assistant_idx = len(rows)
                    if _over_budget(rows, token_caps):
                        over_budget_turns += 1
                        if over_budget_turns > token_caps.grace_turns:
                            kill(session)
                            return SendResult(
                                text=read_final_text(session),
                                usage=read_total_usage(session),
                                completed=False,
                                subtype="error_max_turns",
                                raw_capture=capture,
                            )

        # Fallback: idle-pattern after 80% of the timeout has passed.
        if time.time() > fallback_deadline and _is_idle(capture):
            return SendResult(
                text=read_final_text(session),
                usage=read_total_usage(session),
                completed=True,
                subtype="idle_fallback",
                raw_capture=capture,
            )

        time.sleep(0.5)

    # Hard timeout.
    return SendResult(
        text=read_final_text(session),
        usage=read_total_usage(session),
        completed=False,
        subtype="timeout",
        raw_capture=_capture_pane_plain(session),
    )


def _over_budget(rows: list[dict], caps: TokenCaps) -> bool:
    totals = {"in": 0, "out": 0}
    for row in rows:
        usage = row.get("message", {}).get("usage", {}) or {}
        totals["in"] += int(usage.get("input_tokens") or 0)
        totals["out"] += int(usage.get("output_tokens") or 0)
    if caps.max_input_tokens is not None and totals["in"] > caps.max_input_tokens:
        return True
    if caps.max_output_tokens is not None and totals["out"] > caps.max_output_tokens:
        return True
    if caps.max_total_tokens is not None and (totals["in"] + totals["out"]) > caps.max_total_tokens:
        return True
    return False


# --- Internals: capture-pane / idle ------------------------------------------


def _capture_pane_plain(session: TmuxSession) -> str:
    """Return the visible pane content (no scrollback). ANSI is preserved."""
    pane = _first_pane(session)
    lines = pane.capture_pane()
    return "\n".join(lines)


def _is_idle(capture_output: str) -> bool:
    text = ANSI_RE.sub("", capture_output)
    if not EMPTY_PROMPT_RE.search(text):
        return False
    if len(RULE_RE.findall(text)) < 2:
        return False
    return bool(FOOTER_RE.search(text))


def _wait_for_boot(session: TmuxSession, *, boot_timeout: float) -> None:
    deadline = time.time() + boot_timeout
    while time.time() < deadline:
        if _is_idle(_capture_pane_plain(session)):
            return
        time.sleep(0.25)
    raise TimeoutError(
        f"claude session {session.name} did not reach idle within {boot_timeout}s. "
        f"Likely causes: workspace trust dialog (run `claude` once by hand in {session.cwd}), "
        f"or claude binary not found / failing to authenticate."
    )


def _session_alive(session: TmuxSession) -> bool:
    try:
        out = session._server.cmd("has-session", "-t", session.name)
    except Exception:
        return False
    return out.returncode == 0


# --- Internals: JSONL --------------------------------------------------------


def _jsonl_path(cwd: Path, session_id: str) -> Path:
    # `cwd` is expected to already be resolved (symlinks expanded) to match
    # claude's getcwd-based slug. On macOS /tmp -> /private/tmp; without
    # resolve() the slug would not match where claude actually writes.
    slug = str(cwd).replace("/", "-")
    return Path.home() / ".claude" / "projects" / slug / f"{session_id}.jsonl"


def _iter_assistant_rows(jsonl: Path):
    with jsonl.open() as f:
        for line in f:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("type") == "assistant":
                yield row


def _latest_assistant_text(jsonl: Path) -> str:
    last = ""
    for row in _iter_assistant_rows(jsonl):
        content = row.get("message", {}).get("content", [])
        parts = [b.get("text", "") for b in content if b.get("type") == "text"]
        if parts:
            last = "".join(parts)
    return last


# --- Internals: misc helpers -------------------------------------------------


def _shquote(s: str) -> str:
    if not s:
        return "''"
    if all(c.isalnum() or c in "-_./" for c in s):
        return s
    return "'" + s.replace("'", "'\\''") + "'"


def _strip_marker(text: str, marker: str) -> str:
    stripped = text.rstrip()
    if stripped.endswith(marker):
        stripped = stripped[: -len(marker)].rstrip()
    return stripped


_KNOWN_MARKER_RE = re.compile(r"<<DONE-[0-9a-f]{12}>>\s*$")


def _strip_known_markers(text: str) -> str:
    """Best-effort marker strip when we don't know which marker was used."""
    return _KNOWN_MARKER_RE.sub("", text.rstrip()).rstrip()


# --- Smoke test --------------------------------------------------------------


def _smoke_test() -> int:
    print("Booting tmux session...")
    sess = new_session(cwd=os.getcwd())
    print(f"  name={sess.name} jsonl={sess.jsonl}")
    try:
        print("Sending trivial prompt...")
        result = send_prompt(
            sess,
            "Reply with the single word 'pong'.",
            timeout=180.0,
        )
        print(f"  completed={result.completed} subtype={result.subtype}")
        print(f"  text={result.text!r}")
        print(f"  usage={result.usage}")
        ok = result.completed and "pong" in result.text.lower()
        print(f"  result: {'OK' if ok else 'FAIL'}")
        return 0 if ok else 1
    finally:
        print("Killing session...")
        kill(sess)


if __name__ == "__main__":
    import sys

    if os.environ.get("CLAUDE_TMUX_LIVE_TEST") != "1":
        print(
            "Live smoke test not enabled. Re-run with CLAUDE_TMUX_LIVE_TEST=1 "
            "to actually launch claude (will consume a few tokens).",
            file=sys.stderr,
        )
        sys.exit(0)
    sys.exit(_smoke_test())
