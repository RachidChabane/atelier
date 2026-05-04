# Template: `docs/architecture-options.md`

Structural guide for comparing 2–3 coherent architecture options when there is a real fork.

## When to write

Skip this doc when the architecture is uncontested (a small CLI tool, a library, an obvious-stack web app). Write it when the project has a meaningful fork, e.g.:

- monolith vs microservices
- vector-only retrieval vs hybrid (BM25 + vector + rerank)
- single-tenant vs multi-tenant
- native mobile vs web responsive
- managed services vs self-hosted
- new build vs incremental refactor of existing code

If unsure: ask the user *"Is there a real architecture fork the project needs to choose between, or is the path clear?"* — and skip this doc when they say it's clear.

## Authoring discipline

Three failure modes to push back on:

1. **Feature-list options.** Options aren't "version 1 vs version 2" with feature deltas; they're **coherent answers** to "what is good enough at MVP, and what defers cleanly?"
2. **Option C as filler.** If only A and B exist, write A and B. Don't invent a C for symmetry.
3. **Recommendation by exhaustion.** End each option with the **single tradeoff** that drives the choice. "B has these 9 advantages and 3 disadvantages" → distill to one.

## Required structure

### Header

```markdown
**Purpose:** Compare 2–3 architecture options across the axes that actually decide the system. End each option with the *single* tradeoff that drives the choice. The owner picks one.
**Status:** draft.
```

### Section 1 — How the options differ — the discriminating axes

Name the axes **first**, before the options. The options are coherent answers in terms of those axes.

```markdown
## How the options differ — the <N> discriminating axes

The <non-discriminating axis> choice is *not* a discriminating axis here. <one-sentence why>. The interesting axes are:

1. **<Axis 1>.** <one-sentence framing of what the choice on this axis means>.
2. **<Axis 2>.** <one-sentence framing>.
3. **<Axis 3>.** <one-sentence framing>.
4. **<Axis 4>.** <one-sentence framing>.

The options below are **not** "fast vs slow" or "cheap vs expensive" — they're <N> coherent answers to the question "<question that frames the fork>."
```

### Section 2 — Option A — "<short tagline>"

Each option follows a fixed shape:

```markdown
## Option A — "<one-line tagline>"

**One-line.** <one-sentence summary>.

### Data model
<diagram or schema sketch when relevant. ASCII / mermaid / plain text>.

Notable choices:
- <choice>
- <choice>

### <axis-relevant block 1: e.g., Retrieval / Recursion / Sharing / etc.>
<implementation choice for this axis under this option>.

### <axis-relevant block 2>
...

### Cost+complexity envelope

- **One-time work.** <weeks of effort, broken down>.
- **Monthly cost** (typical scenario): <€X-€Y range>, dominated by <component>.
- **Where it can go wrong.** <one or two failure modes specific to this option>.

### Recommendation, with the single tradeoff

<2–3 sentences>. The single tradeoff: <the *one* thing this option commits us to that's worth naming>. <What we gain or lose by picking it>.
```

Repeat for Options B and C (when C exists).

### Section 3 — Side-by-side summary

A pipe table with the discriminating axes as rows and the options as columns:

```markdown
## Side-by-side summary

| Axis | A — <tagline> | B — <tagline> | C — <tagline> |
|---|---|---|---|
| <Axis 1> | <option A's choice> | <option B's choice> | <option C's choice> |
| <Axis 2> | ... | ... | ... |
| Build time | <weeks> | <weeks> | <weeks> |
| Monthly cost (typical) | <€X> | <€Y> | <€Z> |
| Best for | <when A wins> | <when B wins> | <when C wins> |
```

### Section 4 — Final recommendation

The recommendation paragraph, then a numbered list of what shipping the recommended option commits the project to:

```markdown
## Final recommendation

**Ship Option <X> as MVP.** <One-paragraph rationale tying back to the binding constraint named in `vision.md`.>

Concretely:

- <commitment 1: e.g., data model choices>.
- <commitment 2: e.g., retrieval shape>.
- <commitment 3: e.g., synthesis model default>.
- <commitment N>.

The single tradeoff that drives the recommendation: **<the one thing>**. <consequence>.
```

When the recommendation is revised later (directive change, benchmark result, etc.), record the revision date inline (`**REVISED <DD-MM-YYYY> after <reason>: ship Option <X> as MVP.**`) and amend the rationale. Don't silently rewrite history.

### Section 5 — What to do if <constraint> becomes binding later

A contingency plan naming the **levers** to pull, in order, if the binding constraint shifts (cost gets too high, latency turns out to matter more than expected, etc.). Each lever is one sentence:

```markdown
## What to do if cost becomes a binding constraint later

If at month 6 the platform burn is too high, the levers in order of lowest-quality-impact first:

1. **<Lever 1>.** <one-sentence: what changes, expected savings, quality impact>.
2. **<Lever 2>.** <same shape>.
3. **<Lever 3>.** <same shape>.

We do **not** consider <lever X> as a cost-cutting move. It's quality-load-bearing.
```

This section is the project's *contingency plan*. It survives directive changes — when a new constraint binds, the levers are pre-thought.

### Section 6 — Where each option lands on the existing codebase

Only when scaffolding atop existing code. File-by-file table of what changes per option:

```markdown
## Where each option lands on the existing codebase

The existing <stack> is **a fit for all options**. None requires changing the stack. What changes:

| Existing file/module | Change for A | Additional for B | Additional for C |
|---|---|---|---|
| `app/auth/models.py` | Add `<column>` column to `User` | — | — |
| (new) `app/kb/models.py` | New: `<entities>` tables | — | — |
| `app/rag/retriever.py` | Stays single-shot | New verifier-loop wrapper | — |
```

The `existing-code-survey.md` doc names which files to keep, refactor, and discard; this table cross-references it from the architecture-pick angle.

## Conventions specific to this doc

- **Discriminating axes named first.** The options are answers in terms of axes; without axes named first, the option blocks read as feature lists.
- **Single tradeoff per option.** Each option ends with one named tradeoff, not a balance sheet.
- **Recommendation revisable.** When the project's binding constraint changes (directive, benchmark, scope), the recommendation can flip — record the revision date inline and update Section 4.

## Anti-patterns

- **3 options when only 2 exist.** Don't invent a strawman C for symmetry.
- **Recommendation paragraph that lists everything.** Distill. The reader wants to know *which option* and *the one reason*.
- **Cost+complexity envelopes that are wishlists.** "<N> weeks" needs to mean a calendar-time estimate, not "as long as it takes."

## Example excerpt (option block, abbreviated)

```markdown
## Option B — "Hybrid retrieval + verifier recursion"

**One-line.** Same data model as A plus commentary-linkage entities; ships hybrid retrieval (BM25 + vector + cross-encoder rerank), verifier-loop recursion (depth=3), and linked-citation clusters in MVP.

### What changes from A

Three blocks of changes: hybrid retrieval, verifier-loop recursion, and linked-citation clusters with their commentary-linkage entities.

#### Hybrid retrieval
[3 paragraphs naming the lexical index, RRF, cross-encoder rerank stack]

#### Verifier-loop recursion
[Pseudocode + hard constraints]

#### Commentary linkage
[Schema additions]

### Cost+complexity envelope

- **One-time work.** A's 6 weeks + 2 weeks BM25/rerank + 1 week verifier loop + 2 weeks cluster work = 12 weeks.
- **Monthly cost** (typical): ~€90–€150. Hybrid retrieval +€10/mo. Recursion can 2–4× LLM cost on questions that recurse.
- **Where it can go wrong.** Verifier hallucinates "sufficient" when it isn't. Or reformulator translates to English despite the prompt and recursion drifts.

### Recommendation, with the single tradeoff

Recommended only if A's MVP citation precision falls short of the 6-month bar. The single tradeoff: **+4 weeks of build + ~50% higher monthly cost** in exchange for an estimated ~5–10pp Citation@5 improvement on hard questions. Pay it if MVP eval shows we can't reach the bar without it.
```
