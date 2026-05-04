# Example: how the Stage-1 conventions land in practice

Annotated tour of a real Stage-1 application. The reference project — anonymized as `<project>` below — is a French-shelled platform built on the same opinionated planning sequence this skill drives. Use this when the user asks "what does this look like in practice?" or when you need to ground an explanation in concrete shape.

The reference project's `docs/` folder is the canonical example. The summaries below are paraphrased for brevity; the patterns are exact.

## `docs/README.md` — the index

Two-line header (`**Purpose:**` + `**Status:**`), then a "How `/docs` is organized" section that names the audience (owner-only) and the project model in one sentence. Then a "Reading order" table:

```
| # | File | One-line synopsis |
|---|---|---|
| 1 | vision.md | What "good" looks like at MVP, 6 months, 18 months — measured against a hand-built gold set, not vibes. |
| 2 | <domain-doc-1>.md | The centerpiece. Constrains every other doc. |
| 3 | user-requirements.md | Three personas and numbered user stories with acceptance criteria. |
| ... | ... | ... |
```

Then a "Conventions" section naming inline assumption markers, header pattern, currency formatting. Then a "What's still open" section listing the top three blocking questions from `open-questions.md`.

**Pattern to take away.** The README is structural, not narrative. Anyone reading `docs/` for the first time should be able to (a) understand the project model in 30 seconds and (b) know which doc to open next.

## `docs/vision.md` — what "good" looks like

Header → "What this product is, in one sentence" (single sentence, unhedged) → "Why 'good' looks different here" (one paragraph naming asymmetries that shape downstream decisions) → "What '<core-quality-directive>' implies for the targets below" (when there's a load-bearing constraint that shapes everything) → 6-month definition of good (signal | target | how measured table) → 18-month definition (same shape) → "What this product is *not* trying to be" (anti-scope, one bullet each) → "What 'shipped' means at MVP" (clarification of the MVP boundary) → "Top three risks to good" (each with mitigation).

**Pattern to take away.** Every signal in the 6-month and 18-month tables has a measurement protocol. "≥ 95% citation@1 correctness on the seed KB" is testable. "Better citation accuracy" is not.

The risks block names *three* risks (sometimes four if domain-specific risks demand it), each with a one-paragraph mitigation that points to a specific FR or M item.

## `docs/roadmap.md` — MoSCoW with stable IDs

Header → "Prioritization principle" (one paragraph naming the binding constraint that decides what ships) → "Must (MVP, ~N months)" with sub-tables grouped by area (Core data, Ingestion, Retrieval, Synthesis, UX, Eval+ops), each row carrying `M-N | Feature | Effort | Why`. → "Should (post-MVP)" ordered by value-to-cost ratio, each row carrying `S-N | Feature | Effort | Why it matters | Trigger`. → "Could (longer horizon)" lighter touch. → "Won't (out of scope, named so they don't drift)" in plain prose. → "Parking lot" for ideas not committed. → "How features map to risks (sanity check)" — every top risk in vision.md mapped to its mitigating M or S item.

**Pattern to take away.**

- Sub-letters appear when a top-level item gets sub-tasked (`M-22a, M-22b, M-22c, …, M-22j`). The sub-letters arrived after the original `M-22` had been numbered; they're cleaner than renumbering the rest.
- The "Won't" list is named in *plain* language: "No multi-tenant SaaS (no Stripe, no plans, no usage caps). The product is a tool for ten people, not a business." Not bureaucratic; not euphemistic.
- The risk-to-feature map is the gap-check. Anything in vision.md's risks that doesn't appear here is either not a real risk or a roadmap gap.

## `docs/user-requirements.md` — personas + numbered FRs

Header → "Personas" with internal-only labels (`P1 — The Researcher`, `P2 — The Curator`, `P3 — The Casual Learner`), 1–2 paragraphs each naming who they are and what they care about, plus an explicit "Implication on prioritization" block resolving conflicts (when P1 and P3 conflict, default to P1). → "Functional requirements (numbered stories)" grouped by letter:

- **Group A — Authentication and account** (FR-A1, FR-A2, FR-A3, …)
- **Group B — Knowledge bases** (FR-B1 … FR-B7)
- **Group C — Works, editions, ingestion** (FR-C1 … FR-C9)
- **Group D — Question-answering** (FR-D1 … FR-D11)
- **Group E — Conversation history** (FR-E1, FR-E2)
- **Group G — Personal preferences and memory** (FR-G1 … FR-G8)
- **Group F — Owner-only utilities** (FR-F1, FR-F2)

Each FR has the form: `**FR-X<n>** — As a <persona>, I can <action> so that <outcome>. *Acceptance.* <testable criteria>.`

→ "Non-functional requirements" grouped by Performance / Correctness / Security / I18n / Operations, each carrying `NFR-N` with a measurable bar.

→ "Non-requirements (named so they don't drift in)" — explicit list.

**Pattern to take away.** Group letters are assigned to actual surface areas, not arbitrarily. The reference project skipped `Group F` letter ordering because Group F (owner utilities) was authored after Groups A–E and G — the letters don't have to be sequential. Just stable.

## `docs/architecture-options.md` — when there's a real fork

Header → "How the options differ — the discriminating axes" (4 axes named explicitly) → Option A (one-line summary, data model, retrieval, recursion, sharing, cost+complexity envelope, recommendation with the *single* tradeoff that drives it) → Option B (same shape) → Option C (same shape) → "Side-by-side summary" table → "Final recommendation" → "What to do if cost becomes a binding constraint later" → "Where each option lands on the existing codebase" file-by-file.

**Pattern to take away.**

- The discriminating axes are named *first*. Not the options. The options are coherent answers to the question "what is good enough at MVP, and what defers cleanly?" — phrased in terms of those axes.
- The recommendation is **revisable**. The reference project's `architecture-options.md` originally recommended Option A, then was revised to Option B after a directive change ("revised 25-04-2026 after owner's quality-max directive"). The doc retains the revision history inline.
- The "what to do if cost becomes a binding constraint later" section names *which levers* to pull in *what order*. It's a contingency plan, not a hand-wave.

## `docs/open-questions.md` — live log

Header → "How to use this file" (entry format) → "Open" entries (`### [OQ-N] <question>` with `Why it matters / Options / Resolution path / Needed from`). → "Resolved" entries (with date and decision).

**Pattern to take away.**

- New OQs get appended; resolved OQs move to a "Resolved" section at the bottom but **keep their original number**. `[OQ-1]`, `[OQ-2]`, `[OQ-4]` were resolved-by-reframe early; `[OQ-3]`, `[OQ-5]`, `[OQ-6]`, `[OQ-7]`, `[OQ-8]` are still open. The numbering survives.
- Resolved OQs document *why* they collapsed — "Resolved by reframe" or "Decided: option (a)" with the date.

## `docs/decisions/` — the record

Each decision is its own file. `D-001-architecture-option-b.md`, `D-002-sonnet-46-default-no-opus.md`, …, `D-007-five-ux-modes-mvp-only-ux1.md`.

Each file is ~150 words: Decision / Why / Consequences / What we did NOT pick.

**Pattern to take away.** Decision records are the project's *audit trail*. When `vision.md` or `roadmap.md` get rewritten, the decisions that justified the original shape stay in `decisions/`. New work starts by reading the decisions, not by re-deriving them.

## Domain-specific docs

The reference project has three:

- **`<arabic-considerations>.md`** — the centerpiece. Diacritics, OCR pitfalls, polymorphic citations, line granularity, editions, bidi UI, recursion-on-Arabic risks. Constrains every other doc.
- **`<ingestion-strategy>.md`** — OCR vendor benchmark plan, line-bbox capture, genre-aware chunker, atomic correction workflow.
- **`<ux-proposals>.md`** — the project's five committed UX modes, scoped at MVP / post-MVP, with decision rationale.

These were *not pre-named* by any template. They emerged from the project's nature: the reference project is a classical Arabic platform, so Arabic considerations dominate every decision. Other projects will need different domain docs (a fintech project needs `regulatory-considerations.md`; a research project needs `methodology.md`).

**Pattern to take away.** Ask the user what domain concerns deserve their own document; don't pre-name them.

## What changes from project to project

- **Letters in FR groups** — depend on what surface areas exist.
- **Sub-letter use in M-N / S-N** — depends on how much sub-tasking happens.
- **Number of architecture options** — sometimes there isn't a real fork, and `architecture-options.md` doesn't ship.
- **Domain-specific docs** — wholly project-determined.
- **Stage 2–5 hand-offs** — some projects skip the deck (internal tooling); some skip the IA (libraries / CLI); some won't use plan-execute.

## What stays the same

- The header pattern (`**Purpose:** + **Status:**`).
- Stable IDs and the never-renumber rule.
- MoSCoW with explicit MVP cut and named anti-scope.
- Risk-to-feature mapping in the roadmap.
- Inline `**Assumption:** … [OQ-N]` markers cross-referenced into open-questions.
- Decision records as standalone files in `docs/decisions/`.
- Sentinels for external-tool prompts.
