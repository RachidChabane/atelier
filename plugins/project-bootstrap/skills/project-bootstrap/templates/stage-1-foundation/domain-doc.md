# Template: `docs/<domain-concern>.md`

Structural guide for project-specific docs that don't fit the standard slate (vision / roadmap / requirements / architecture-options / open-questions / decisions).

## When to write

Ask the user: *"What domain concerns deserve their own document?"* Examples that have warranted their own doc on past projects:

- `arabic-considerations.md` — diacritics, OCR pitfalls, polymorphic citations, bidi UI
- `ingestion-strategy.md` — vendor benchmark plan, line-bbox capture, atomic correction workflow
- `regulatory-considerations.md` — GDPR, financial compliance, accessibility requirements
- `methodology.md` — statistical methodology for a research project; experimental design
- `ux-proposals.md` — committed UX modes with scoping rationale
- `integration-strategy.md` — third-party APIs, auth flows, rate limit handling

The pattern: a domain concern is heavy enough to **constrain other docs** and benefits from being read as a coherent whole rather than scattered across vision / roadmap / requirements.

**Don't pre-name domain docs.** Let the user identify which concerns warrant separate treatment for *their* project.

## Required structure

Each domain doc has its own internal structure based on the topic. The shared envelope:

### Header

```markdown
**Purpose:** <one sentence — what this doc is, what it constrains>.
**Status:** draft.
```

### Section 1 — Why this doc exists

One paragraph naming why this concern is heavy enough to need its own doc — usually because it constrains every other doc, or because it has implementation-level detail that wouldn't fit in roadmap/requirements.

### Section 2..N — Topical sections

Authored to the topic. No fixed shape. Common patterns:

- **For constraint-naming docs** (like `arabic-considerations.md`): one section per constraint, each with subsections explaining the constraint, the failure mode if violated, and where in the architecture/UX it surfaces.
- **For strategy docs** (like `ingestion-strategy.md`): pipeline stages with inputs/outputs/failure modes per stage.
- **For proposal docs** (like `ux-proposals.md`): N options with scope + rationale + decision (committed / parked / rejected).

### Section N+1 — Cross-references

End with a brief "Where this surfaces in the rest of `/docs`" pointing to the FRs, M items, or architecture-options sections that depend on this domain doc:

```markdown
## Where this surfaces

- `vision.md` § Top three risks — risks 1 and 3 derive from this doc's §<X> and §<Y>.
- `roadmap.md` § Must — `M-9` (genre-aware chunker), `M-22b` (verifier loop) operationalize this doc's recommendations.
- `architecture-options.md` § Option B — the cluster retrieval section explicitly cites §6 of this doc.
```

This block makes the doc *load-bearing* — readers of `roadmap.md` see why an item exists by chasing the cross-reference back here.

## Conventions specific to domain docs

- **Heavier numbering than other docs.** Domain docs often have section numbers (`§1, §2, §3, …`) so other docs can cite specific sub-claims (`per §6 of arabic-considerations.md`).
- **Examples carry weight.** Domain docs benefit from concrete examples (a real Arabic citation, a real financial ledger entry, a real CSV row). Generic examples drain authority.
- **Recommendations are committed.** When the doc says "we ship X," that's a commitment that should also appear in `roadmap.md` as an `M-N` item. If a recommendation lives only in the domain doc, it's not real.

## Anti-patterns

- **Catch-all "miscellaneous" doc.** If `notes.md` accumulates everything that didn't fit elsewhere, split it into properly-named domain docs.
- **Domain doc with no cross-references.** If no other doc cites it, it's not load-bearing — fold it into the doc that *should* be load-bearing (vision / requirements / architecture).
- **Domain doc that contradicts vision/roadmap.** Domain docs *constrain* the others; they shouldn't *contradict*. When inconsistencies surface, reconcile inline (and update the affected doc).

## Example header for `arabic-considerations.md`

```markdown
**Purpose:** The constraints classical Arabic imposes on every layer of the system — diacritics, OCR pitfalls, polymorphic citations, line granularity, editions, bidi UI, recursion-on-Arabic risks. Constrains every other doc; read second after `vision.md`.
**Status:** draft — last revised 25-04-2026.

## Why this doc exists

Generic-NLP intuitions break on classical Arabic in load-bearing ways. The diacritics fork (display vs retrieval), the polymorphic citation kinds (page+line, hadith #, *bayt* #, folio recto/verso), the bidi UI pitfalls — each has a default that's wrong for this product, and the wrong default surfaces as a class of bugs the rest of the team hasn't seen. This doc is the up-front statement of those defaults so they aren't re-derived at every decision.
```
