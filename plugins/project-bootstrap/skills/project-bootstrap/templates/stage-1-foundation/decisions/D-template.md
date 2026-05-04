# Template: `docs/decisions/D-NNN-<slug>.md`

Structural guide for short decision records. Each accepted decision is its own file; ~150 words.

## When to write

When a non-trivial decision crystallizes:

- Architecture pick (Option A / B / C)
- Model selection (which LLM, which embedder, which OCR vendor)
- Scope cut (what defers to post-MVP, what won't ship at all)
- Posture choice (multi-tenant vs single-tenant, public vs private, etc.)

Don't write decision records for trivial choices ("which logger library"). The bar is *non-trivial*: a choice that survives doc rewrites and that someone reading the project later needs to understand why.

## Naming convention

`D-NNN-<slug>.md` where:

- `NNN` is zero-padded (`001`, `002`, …, `099`, `100`).
- `<slug>` is kebab-case, ≤ 5 words, naming the decision: `architecture-option-b`, `sonnet-46-default-no-opus`, `polymorphic-citation-shape`, `cluster-default-and-only`.

Numbering is strictly sequential by *acceptance date*, not by topic. A late decision about a long-settled topic still gets the next available number.

## Required structure

### Title

```markdown
# D-NNN — <one-line decision title in declarative form>
```

Examples:

- `# D-001 — Architecture: Option B (hybrid retrieval + verifier-loop recursion + cluster retrieval)`
- `# D-002 — Default synthesis model: Claude Sonnet 4.6 (owner-set ceiling, no Opus)`
- `# D-007 — Five UX modes committed; only UX-1 in MVP`

### Status line

```markdown
**Status.** Accepted <YYYY-MM-DD>. Source: `<doc-name>.md` § <section heading>.
```

The "Source" pointer names the doc and section where the decision was originally argued out (usually `vision.md`, `roadmap.md`, or `architecture-options.md`).

When a decision is later reversed, append a status line: `**Reversed <YYYY-MM-DD>.** Superseded by `D-NNN-<new-slug>.md`.` — and write the new decision record. Don't delete the original.

### Section: Decision

3–6 short bullets stating exactly what was decided. Be specific.

```markdown
## Decision

- <commitment 1>
- <commitment 2>
- <commitment 3>
```

Examples (real, slightly paraphrased):

```markdown
## Decision

- Hybrid retrieval (BM25 + vector + cross-encoder rerank) from day one.
- Verifier-loop recursion, hard depth-cap = 3, default-on, Sonnet 4.6 verifier.
- Cluster-shaped retrieval (matn ↔ sharḥ) as the default and only retrieval mode.
- Polymorphic citations as a first-class entity (`citation_kind` + `citation_data` JSONB).
- Curator-marked commentary alignment in MVP; auto-detection deferred to S-18 post-MVP.
```

### Section: Why

2–4 sentences naming the binding constraint or directive that drove the choice. Reference the source doc:

```markdown
## Why

The owner's quality-max directive — *"<directive verbatim>"* — flips the standard cost calculus. The strongest single precision lever for <thing> is the <stack>. Deferring it means shipping an MVP that cannot meet the <bar from vision.md>. <Second-strongest lever> is the <other thing> and ships in MVP for the same reason.
```

### Section: Consequences

3–6 bullets on what this commits the project to — build time, cost, scope, schedule, posture:

```markdown
## Consequences

- MVP build extends from ~3 months (Option A) to ~4 months. Accepted.
- Monthly burn at platform default (Sonnet 4.6 ceiling): ~€129. Per-user tier override (FR-G7) lets cost-sensitive users drop to ~€59/mo. Both costs accepted under the directive.
- Separate <component X> added to the stack.
- <Component Y> added.
```

### Section: What we did NOT pick

1–3 short blocks describing the rejected alternatives and why each was rejected:

```markdown
## What we did NOT pick

- **Option A** (vector-only single-shot). Would not meet the <bar>.
- **Option C** (multi-edition with cross-edition retrieval). Cross-edition is a 12+ month feature; deferred. The schema is multi-edition-ready.
```

When alternatives weren't seriously considered (e.g., "we didn't consider building a custom embedder"), say so explicitly: that's also useful audit-trail.

## Conventions specific to decision records

- **Length: ~150 words.** Each decision record is short on purpose. The discussion that produced the decision lives in `vision.md` / `roadmap.md` / `architecture-options.md`; this is the *outcome*.
- **Date format:** the records use `YYYY-MM-DD` (ISO) in the Status line for easy sorting, even when the rest of the project uses `DD-MM-YYYY` in prose. The decisions/ folder needs sortable timestamps.
- **No revision history.** When a decision changes, write a new D-NNN that supersedes the old one. The old record stays.

## Anti-patterns

- **Long records.** > 300 words means the discussion has leaked in. Move discussion to `vision.md` or `architecture-options.md`; keep the record terse.
- **Records for trivial decisions.** "Use kebab-case for filenames" is a convention, not a decision. Conventions live in `references/conventions.md`.
- **Records that contradict the source doc.** When the source `roadmap.md` was updated and the decision record is now stale, write a new D-NNN that supersedes it. Don't silently rewrite the original.

## Example record (full, abbreviated from a real one)

```markdown
# D-001 — Architecture: Option B (hybrid retrieval + verifier-loop recursion + cluster retrieval)

**Status.** Accepted 2026-04-25. Source: `architecture-options.md` § Final recommendation.

## Decision

Build the MVP on Option B from `architecture-options.md`:

- Hybrid retrieval (BM25 + vector + cross-encoder rerank) from day one.
- Verifier-loop recursion, hard depth-cap = 3, default-on, Sonnet 4.6 verifier.
- Cluster-shaped retrieval (matn ↔ sharḥ) as the default and only retrieval mode.
- Polymorphic citations as a first-class entity.
- Curator-marked commentary alignment in MVP; auto-detection deferred to S-18 post-MVP.

## Why

The owner's quality-max directive — *"il est impératif d'avoir la solution la plus performante sur l'arabe"* — flips the standard cost calculus. The strongest single precision lever for Arabic retrieval is the BM25 + cross-encoder rerank stack. Deferring it means shipping an MVP that cannot meet the 95% Citation@1 bar (vision.md). Recursion is the second-strongest lever for hard cross-document questions and ships in MVP for the same reason.

## Consequences

- MVP build extends from ~3 months (Option A) to ~4 months. Accepted.
- Monthly burn at platform default (Sonnet 4.6 ceiling): ~€129. Per-user tier override (FR-G7) lets cost-sensitive users drop to ~€59/mo. Both costs accepted.
- Separate Postgres GIN + Arabic stemmer (or Tantivy sidecar) added.
- Cross-encoder reranker added.

## What we did NOT pick

- **Option A** (vector-only single-shot). Would not meet the 95% Citation@1 bar.
- **Option C** (multi-edition with cross-edition retrieval). Cross-edition is a 12+ month feature; deferred. The schema is multi-edition-ready.
```
