# Template: `docs/open-questions.md`

Structural guide for the live log of unresolved decisions, risks, and assumptions.

## When to write

Open this file as soon as the conversation surfaces any unresolved decision. Update it continuously, not just at the end of Stage 1. The file's value is *currency* — a stale OQ list is worse than no list.

## Required structure

### Header

```markdown
**Purpose:** Live log of unresolved questions, risks, and assumptions. Owned by the project owner. Update continuously, not just at the end.
**Status:** draft — last updated <DD-MM-YYYY>.
```

### Section 1 — How to use this file

```markdown
## How to use this file

Each entry follows: **question/risk → why it matters → options → resolution path → who answers**. Resolved entries move to the bottom with date and decision (DD-MM-YYYY).

`**Assumption:**` markers and `[OQ-N]` tags inline in other docs all point back here.
```

### Section 2 — Open

Each open OQ is a level-3 heading:

```markdown
## Open

### [OQ-N] <one-line question>
**Why it matters.** <one paragraph naming the impact and what the question blocks>.
**Options.**
- (a) <option a>.
- (b) <option b>.
- (c) <option c>.
**Resolution path.** <how this gets settled — owner action, benchmark, prototype, etc.>.
**Needed from.** <whose action unblocks this>.
```

For OQs that are explicit decisions (not open questions), use a `**Decision.**` line instead of options:

```markdown
### [OQ-N] <topic>
**Why it matters.** <impact>.
**Decision.** **<chosen approach>**, per <reasoning or doc reference>. <Implication>.
```

This is the pattern for OQs that *were* open but now have a settled answer — they keep their original number and stay in the Open section if there are dependencies; move to Resolved (Section 3) when the work that depended on them is done.

### Section 3 — Resolved

Entries that no longer block work. Keep their original ID; do not renumber. Format:

```markdown
## Resolved

**[OQ-1] <DD-MM-YYYY>** — <one-line restatement of the question> — **<resolution>**. <one-sentence rationale or pointer to a decision record>.

**[OQ-2] <DD-MM-YYYY>** — <one-line restatement> — **Resolved by reframe.** <what changed about the project that made the question moot>.

**[OQ-4] <DD-MM-YYYY>** — <one-line restatement> — <chosen option>.
```

## Conventions specific to this doc

- **OQ IDs are never reused.** A retired OQ keeps its ID forever.
- **OQ IDs are referenced from inline `**Assumption:** …` markers in other docs.** When an OQ resolves, audit the docs that reference it and update them (the assumption may be stale or the resolution may invalidate downstream content).
- **Resolved entries stay in the file.** They're the audit trail. Don't delete; just move to the Resolved section with the date.

## When to escalate an OQ to a decision record

When an OQ resolves with a non-trivial decision (architecture pick, model selection, scope cut), in addition to moving the OQ to Resolved, write a short decision record under `docs/decisions/D-NNN-<slug>.md`. The decision record is the load-bearing form; the resolved-OQ entry is the lighter audit-trail form.

Rule of thumb: if the resolution changes downstream work, write a decision record. If the resolution just settles a small fork (which library, which threshold), updating the OQ to Resolved is enough.

## Anti-patterns

- **Empty / forgotten OQ list.** If `open-questions.md` has been untouched for a week of active work, it's drifting.
- **OQs as TODOs.** "TODO: implement X" is a task, not an open question. Keep OQs scoped to *decisions* and *assumptions*, not implementation work.
- **Resolved entries deleted.** The audit trail is the value; deleting resolved entries throws it away.
- **Renumbering after resolution.** `OQ-1` resolves; `OQ-2` does *not* become `OQ-1`. The numbering is stable.

## Example excerpt

```markdown
**Purpose:** Live log of unresolved questions for the CSV → SQL CLI.
**Status:** draft — last updated 12-03-2026.

## How to use this file

Each entry follows: question/risk → why it matters → options → resolution path → who answers. Resolved entries move to the bottom with date and decision.

## Open

### [OQ-1] How do we handle CSVs with non-RFC-4180 quoting?
**Why it matters.** Real-world CSVs from Excel, BigQuery exports, and SAP exports use different escaping rules. Strict RFC-4180 parsing rejects ~30% of CSVs in the wild.
**Options.**
- (a) Strict RFC-4180 only; reject non-conforming CSVs with a clear error.
- (b) Best-effort parser with `--strict` flag for RFC-4180 mode.
- (c) Per-source preset (`--source excel`, `--source bigquery`).
**Resolution path.** Owner picks based on intended audience. Default proposal: (b).
**Needed from.** Owner direction.

### [OQ-2] Do we support CSVs with header inference (no header row)?
**Why it matters.** Some upstream systems emit headerless CSVs. Without inference, we'd require the user to pre-process.
**Decision.** **No** — require a header row. <One-sentence rationale: keeps the type-inference engine bounded; users with headerless CSVs run a one-line `awk` preprocessor.>

## Resolved

**[OQ-3] 12-03-2026** — *Should we connect to live Postgres for schema introspection?* — **Yes, via `--schema-from-psql`.** Avoids users having to dump schema first; they need a live connection anyway to load the SQL.
```
