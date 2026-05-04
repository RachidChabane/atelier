# Template: `docs/roadmap.md`

Structural guide for the MoSCoW roadmap with stable IDs and explicit MVP / Won't cuts.

## When to write

Always. The roadmap is the project's prioritization tool — even small projects benefit from named cuts.

## Authoring discipline

Three failure modes to push back on during the conversation:

1. **Implicit MVP.** "We'll ship the basics." → Force named items with IDs in the Must section.
2. **Implicit Won't.** "We probably won't do X." → Force a named bullet under Won't.
3. **Unmitigated risk.** "Performance might be a problem." → Either name a Must / Should item that mitigates it, or move it to `vision.md` as a top risk and link.

## Required structure

### Header

```markdown
**Purpose:** MoSCoW prioritization with stable IDs, explicit MVP cut, named Won't list, and risk-to-feature mapping.
**Status:** draft.
```

### Section 1 — Prioritization principle

One paragraph naming the binding constraint that drives the cut. Examples:

```markdown
## Prioritization principle

Citation correctness is the binding constraint. A feature ships if and only if it (a) is required for the user to trust a citation, or (b) is required for at least one persona to do their job. Everything else is a "should" or "could."
```

Then name the **effort tags** used in the tables:

```markdown
Effort tags: **S** = ≤ 3 days, **M** = 1–2 weeks, **L** = 3–4 weeks, **XL** = 5+ weeks.
```

### Section 2 — Must (MVP, ~N months)

The MVP cut. Group items by area when there are more than ~10 (Core data / Ingestion / Retrieval / Synthesis / UX / Eval+ops / etc. — let the project's surface areas dictate). Use sub-tables per area:

```markdown
## Must (MVP, ~N months)

Aim: <one-sentence MVP goal>. Bar: <one-sentence pass criterion>.

### <Area 1>

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-1 | <feature> | M | <one-sentence justification> |
| M-2 | <feature> | S | <one-sentence justification> |

### <Area 2>

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-N | <feature> | L | <one-sentence justification> |

**MVP total:** ~<N> weeks of effort. **Critical path:** <ordered list of M-N IDs>.
```

**Sub-letters.** When a Must item gets sub-tasked after the fact, use sub-letters (`M-22a, M-22b, M-22c`) rather than renumbering. Keeps later cross-references intact.

### Section 3 — Should (post-MVP, months N+)

Order roughly by value-to-cost ratio. Each row carries a **Trigger** (the condition under which the item gets pulled in):

```markdown
## Should (post-MVP, months N+)

Order roughly by value-to-cost ratio.

| ID | Feature | Effort | Why it matters | Trigger |
|---|---|---|---|---|
| S-1 | <feature> | M | <impact> | <when this gets pulled in — e.g., "if MVP eval shows <x> below <bar>"> |
| S-2 | <feature> | S | <impact> | <trigger condition> |
```

Triggers are the single most-skipped column. Don't skip them — without a trigger, a Should item rots into "we'll get to it eventually."

### Section 4 — Could (longer horizon)

Lighter touch. One-line items, no per-row table:

```markdown
## Could (months N+ to N+12)

Things that would be nice but require either more users, more corpus, or a different product posture.

- **C-1.** <one-line description>.
- **C-2.** <one-line description>.
```

These are not commitments; they're a parking lot for ideas that survived initial triage.

### Section 5 — Won't (out of scope, named so they don't drift)

In **plain language** so the cuts don't drift back. One-line bullets, each unambiguous:

```markdown
## Won't (out of scope, named so they don't drift)

- No <thing 1>. <one-sentence why-not>.
- No <thing 2>. <one-sentence why-not>.
- No <thing 3>. <one-sentence why-not>.
```

The vocabulary matters. "No multi-tenant SaaS (no Stripe, no plans, no usage caps)" is unambiguous. "Limited multi-tenancy support" is drift.

### Section 6 — Parking lot

"Good ideas, not a fit yet." Captured so they don't get lost; nothing here is committed.

```markdown
## Parking lot ("good ideas, not a fit yet")

Captured here so they don't get lost; nothing in this list is committed.

- <idea 1>.
- <idea 2>.
```

### Section 7 — How features map to risks (sanity check)

The gap-check. Every top risk from `vision.md` must be mitigated by a Must or Should item:

```markdown
## How features map to risks (sanity check)

The top risks from `vision.md` should each have a feature in Must or Should that mitigates them:

| Risk | Mitigating feature(s) |
|---|---|
| <Risk 1 name from vision.md> | M-7, M-8, M-13 (correction UI), S-4 (bulk) |
| <Risk 2 name> | M-1, M-18 (refuse edition-less citations) |
| <Risk 3 name> | M-22b (verifier loop) |

If a risk is not mitigated by a Must or Should item, either it's not really a top risk or the roadmap has a gap. The mapping above is the gap check.
```

When this section turns up a gap, fix one of: (a) add a Must/Should item, (b) move the risk out of "top three" in `vision.md`, or (c) accept the gap with a recorded justification (rare).

## Conventions specific to this doc

- IDs are **never reused**. If `M-5` is dropped, `M-5` stays retired (note the drop in a "Dropped" subsection if useful; don't recycle the ID).
- IDs may be sub-lettered (`M-22a`, `M-22b`) when a parent task is sub-tasked after the fact.
- Effort tags are not estimates — they're complexity bins. Don't try to be precise; the bins are coarse on purpose.
- Cross-references to `vision.md` (top risks) and `user-requirements.md` (FR-* items) use IDs.

## Anti-patterns

- **Padded Must list.** If everything is Must, nothing is. The Must list is the MVP cut; if it's > ~30 items, the MVP needs renegotiating.
- **Implicit Won't.** Anti-scope drifts when it isn't named. Force the conversation onto the Won't list.
- **Missing risk mapping.** The risk-to-feature table is the gap-check; skipping it lets unmitigated risks slip into MVP.
- **Effort tags on Could items.** Could items don't have effort tags — they're ideas, not committed work.

## Example excerpt (minimal Must table)

```markdown
## Must (MVP, ~6 weeks)

Aim: a working CLI for one canonical CSV → SQL conversion. Bar: 100% cast correctness on the 12-table fixture (per `vision.md`).

### Core conversion

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-1 | CSV parser handling RFC-4180 + common-deviation cases | M | Real-world CSVs deviate; need to handle gracefully. |
| M-2 | Type inference engine: per-column type from first 1000 rows | M | Drives cast operator selection. |
| M-3 | Schema introspection from `psql -c \\d` output | S | Target schema is the source of truth for cast direction. |

### Output

| ID | Feature | Effort | Why |
|---|---|---|---|
| M-4 | Parameterized INSERT emitter (no string interpolation) | S | Safety + perf. |
| M-5 | Per-row error handling: row → stderr, no abort | S | Long jobs must survive single-row errors. |

**MVP total:** ~3 weeks. **Critical path:** M-3 → M-2 → M-1 → M-4.
```
