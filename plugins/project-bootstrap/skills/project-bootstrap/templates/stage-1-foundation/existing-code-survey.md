# Template: `docs/existing-code-survey.md`

Structural guide for surveying an existing codebase when scaffolding atop it.

## When to write

Only when the project is replacing or extending an existing codebase. Skip when scaffolding a fresh repo. The survey's purpose: name what exists, what we're keeping, and what we're rewriting — so the implementation slate (Stage 5) doesn't accidentally re-create something we already have or accidentally preserve something incompatible with the new spec.

## Authoring discipline

The survey is **file-by-file**, not paragraph-by-paragraph. The scannable disposition table is the value.

Push back on:

1. **Vague disposition.** "Refactor" without naming what — reject. Say "Replace `extract_text` with `extract_text_with_bbox`" or "Add `kb_id` column."
2. **Unjustified discards.** Every discard names *why* (incompatible with new spec, dead code, replaced by new component).
3. **Survey of new code.** Only existing files belong here. New files appear in `architecture-options.md` § "Where each option lands on the existing codebase" or in the implementation slate.

## Required structure

### Header

```markdown
**Purpose:** File-by-file disposition (keep / refactor / discard) of the existing codebase under the new spec.
**Status:** draft.
```

### Section 1 — Survey scope

One short paragraph naming what was surveyed (which directories, which commit hash, which date) and what was excluded:

```markdown
## Survey scope

Surveyed at commit `<hash>` (date <DD-MM-YYYY>). Scope: `app/`, `frontend/src/`, `migrations/`. Excluded: `node_modules/`, `tests/` (covered separately in test-strategy survey), config files (`.env.example`, `Caddyfile`).
```

### Section 2 — Disposition table

Per-file rows, grouped by area:

```markdown
## Backend

| Path | Role today | Disposition | Why |
|---|---|---|---|
| `app/auth/models.py` | User auth tables | **Refactor** — add `display_name` column | FR-A3. |
| `app/auth/router.py` | Login / register / refresh endpoints | **Keep as-is** | Phase 2 work; correct shape. |
| `app/documents/models.py` | Document + Chunk tables | **Refactor** — add `kb_id`; replace `page_number int` with `citation_kind enum + citation_data jsonb`; add `text_original` / `text_normalized` / `bbox` / `ocr_confidence` / `version` | M-2, M-3, M-4. |
| `app/rag/chunkers/recursive.py` | Langchain recursive chunker | **Discard** | Wrong granularity for Arabic citations; replaced by genre-dispatching chunker (M-9). |
| `app/rag/embedders/openai_compat.py` | Embedder wrapper | **Refactor** — add diacritics normalization at input boundary | M-10. |
```

```markdown
## Frontend

| Path | Role today | Disposition | Why |
|---|---|---|---|
| `frontend/src/components/Chat/MessageList.tsx` | Conversation thread renderer | **Keep + extend** — add cluster-card sub-component | M-38. |
| `frontend/src/components/Chat/CitationChip.tsx` | Citation chip | **Refactor** — make polymorphic (5 kinds) | M-23. |
```

### Section 3 — Carryover (intact)

Components that survive untouched. One paragraph naming them, so the implementation slate doesn't accidentally rewrite them:

```markdown
## Carryover (intact)

The following components survive intact (no changes needed under the new spec):

- Auth flow (`app/auth/`) — Phase 2 work; correct shape.
- Conversation model (`app/conversations/`) — generic enough; reused as-is.
- OpenRouter LLM wrapper (`app/llm/openrouter.py`) — the per-user tier preference (FR-G7) plugs into this directly.
- Existing UI shell, routing, theme — frontend stays.
```

### Section 4 — New components (out of scope for this survey)

A pointer to where new components are tracked:

```markdown
## New components

New modules / files needed under the new spec are tracked in `roadmap.md` § Must (M-N items name the module they create) and in `architecture-options.md` § "Where each option lands on the existing codebase."
```

## Conventions specific to this doc

- **Disposition vocabulary is fixed:** `Keep as-is` / `Keep + extend` / `Refactor — <named change>` / `Discard`.
- **Every Refactor and Discard cites a roadmap ID** (`M-N` or `S-N`) — the survey's value is connecting *what exists* to *what changes*.
- **Migration windows.** When a discard happens in stages (e.g., legacy endpoints stay during migration; deleted after Phase F), name the window inline.

## Anti-patterns

- **Survey paragraphs instead of table rows.** The table is what gets scanned; the prose form gets skipped.
- **Disposition without justification.** "Discard `X.py`" without naming what replaces it leaves the implementation slate guessing.
- **Survey of new code.** Resist; new code goes elsewhere.
- **Stale survey.** A survey at commit `<hash>` is point-in-time. When the codebase shifts, re-survey or note the staleness inline.

## Example header for a real survey

```markdown
**Purpose:** File-by-file disposition (keep / refactor / discard) of the existing single-user RAG codebase under the new platform spec.
**Status:** draft — surveyed at commit `9771022` on 26-04-2026.

## Survey scope

Surveyed `backend/app/`, `frontend/src/`, `backend/migrations/`. Excluded `tests/` (covered in `test-strategy.md`), `node_modules/`, lock files, build outputs.
```
