---
name: project-bootstrap
description: This skill should be used when the user asks to "bootstrap a project", "set up planning docs", "scaffold vision and roadmap", "kick off a new project", "lay the foundation for a project", "set up the docs folder", or invokes the skill in a repository where docs/ is empty, partial, or otherwise needs the foundation slate. It drives a conversation that produces an opinionated, cross-referenced set of Stage-1 planning artifacts (vision, roadmap, user requirements, open questions, architecture options, decisions, plus domain-specific docs) under docs/, then prepares hand-offs for pitch deck (Stage 2), information architecture (Stage 3), screen design (Stage 4), and implementation slate (Stage 5). Resumes intelligently from whatever artifacts already exist.
---

# project-bootstrap

Drive a project through five planning stages. Stage 1 (foundation docs) is the bulk of this skill. Stages 2–5 (deck, IA, screen design, implementation slate) are prepared — the skill leaves prompt skeletons and hand-off notes for the user to drive each subsequent stage with the appropriate tool.

The skill is opinionated about **structure** (file names, section headings, cross-document IDs, conventions) and lets the **content** itself emerge from conversation. It does not invent project content; it drives the user to articulate it in a coherent shape.

## What "good" looks like at the end of Stage 1

The repository has a `docs/` folder containing:

- `README.md` — index of every doc in reading order with a one-line synopsis
- `vision.md` — what "good" looks like at MVP, 6 months, and 18 months as measurable signals
- `roadmap.md` — MoSCoW prioritization with stable IDs and explicit MVP / anti-scope cuts
- `user-requirements.md` — personas + numbered functional requirements with acceptance criteria
- `open-questions.md` — live log of unresolved decisions with stable IDs
- `architecture-options.md` — option A vs B vs C tradeoffs with explicit recommendation (only when there is a real architectural fork)
- `decisions/D-NNN-slug.md` — one short file per accepted decision (the "why we chose B" record that survives doc rewrites)
- 0–N domain-specific docs (whatever the project's nature demands — naming decided in conversation)
- `existing-code-survey.md` — only if scaffolding atop an existing codebase

Plus, if the user wants to continue beyond Stage 1, prompt skeletons under `docs/` for Stages 2–4 and a hand-off note for Stage 5.

## Resume detection — always do this first

Before doing anything else, list `docs/` and read the `**Status:**` header line of every existing artifact. Status values are `draft | for review | approved`.

Decide the next action:

1. **`docs/` does not exist or is empty** → start at the top of "Step-by-step procedure" below.
2. **Some artifacts exist as `draft`** → ask the user which to resume; default to the lowest-numbered missing or earliest-status doc in the canonical order (README → vision → roadmap → user-requirements → architecture-options → open-questions → domain docs → decisions).
3. **All Stage-1 artifacts exist as `approved`** → offer to move into Stage 2 hand-off (pitch deck) or Stage 3 (information architecture).
4. **A `PLAN.md`, draft, or paste-in exists at repo root** → ingest it into the structured artifacts rather than starting over. Cite specific passages of the source when proposing each section.

Never overwrite existing content silently. When iterating on a `draft` doc, propose changes inline and let the user approve before writing.

## Step-by-step procedure

Drive the conversation through these steps. Each step is a *conversation*, not a fill-in-the-blank — ask the questions the templates flag as required, propose phrasings, push back when an answer is vague, and only write the file when the user has committed to the substance.

### Step 0 — Brief intake (one short message)

Ask the user three questions in a single message, each one-line:

1. **One sentence: what is this project?** (Used as the seed of `vision.md`.)
2. **Are you scaffolding from scratch, or atop an existing codebase?** (Determines whether `existing-code-survey.md` ships in Stage 1.)
3. **Currency + date format conventions?** (Default `€` and `DD-MM-YYYY`; confirm or override.)

Capture answers. Pick the date the conversation begins; every doc header carries it.

### Step 1 — `docs/README.md` (the index)

Write `docs/README.md` first as a placeholder index. It evolves as artifacts land; revisit at the end of Stage 1 to make sure every doc has a one-line synopsis and the reading order is right. Use `templates/stage-1-foundation/readme.md` as the structural reference.

### Step 2 — `docs/vision.md`

Drive the user to articulate:

- **What this product is, in one sentence.** Push back on hedged or compound sentences.
- **Why "good" looks different here than in the generic case** (one paragraph naming the asymmetries that shape every other decision).
- **6-month definition of "good"** as a table of measurable signals with targets and "how measured."
- **18-month definition** in the same table shape.
- **What this product is *not* trying to be** (anti-scope; named so it doesn't drift).
- **Top three risks to "good"** with mitigations.

Use `templates/stage-1-foundation/vision.md` as the section guide. Header pattern: `**Purpose:** …` + `**Status:** draft`. All target metrics must be measurable — push back on "we'll know it when we see it."

### Step 3 — `docs/roadmap.md`

Drive MoSCoW prioritization with stable IDs:

- **Must** items get IDs `M-1, M-2, …` (these are the MVP cut)
- **Should** items get IDs `S-1, S-2, …` (post-MVP, ordered by value-to-cost)
- **Could** items get IDs `C-1, C-2, …` (longer horizon)
- **Won't** items are named explicitly (one paragraph each), so they don't drift back in
- Plus a **parking lot** for "good ideas, not a fit yet"

Each Must/Should item carries: `ID | Feature | Effort (S/M/L/XL) | Why`. Effort tags: `S` ≤ 3 days, `M` 1–2 weeks, `L` 3–4 weeks, `XL` 5+ weeks.

End with a **risk-to-feature mapping** — every top risk from `vision.md` must have a Must or Should item that mitigates it. If a risk has no mitigation, the roadmap has a gap; surface it.

Use `templates/stage-1-foundation/roadmap.md` as the structural reference.

### Step 4 — `docs/user-requirements.md`

Drive:

- **Personas** — numbered (P1, P2, P3, …), internal-only labels (never surfaced in UI). Two paragraphs each: who they are, what they care about. Plus an explicit "**Implication on prioritization**" block when personas conflict.
- **Functional requirements** numbered as `FR-X<n>` where X is the group letter (A = auth, B = core entity, C = ingestion / curation, D = the core surface, E = secondary surfaces, F = owner-only utilities, G = preferences/memory, etc.) — letter assignment decided in conversation based on the project's actual surface areas.
- Each FR has: a one-sentence story (`As a … I can … so that …`) and explicit **acceptance criteria** that are testable.
- **Non-functional requirements** numbered as `NFR-1, NFR-2, …` grouped by Performance / Correctness / Security / I18n / Operations as applicable.
- **Non-requirements** named so they don't drift in.

Use `templates/stage-1-foundation/user-requirements.md` as the structural reference.

### Step 5 — `docs/architecture-options.md` (only when there is a real fork)

Skip this doc when the architecture is uncontested. Write it when the project has a meaningful fork: e.g., monolith vs services, vector-only vs hybrid retrieval, single-tenant vs multi-tenant, native vs web. The doc compares 2–3 coherent options across **the discriminating axes** — name them up front — and ends with an explicit recommendation plus the *single* tradeoff that drives the choice.

Each option block carries: data model (if relevant), retrieval/processing/synthesis shape, sharing/integration model, **cost+complexity envelope** (one-time + recurring), and **where it can go wrong**. End with a side-by-side summary table.

Use `templates/stage-1-foundation/architecture-options.md` as the structural reference.

### Step 6 — `docs/open-questions.md`

Open this file as soon as the conversation surfaces any unresolved decision and update it continuously — not just at the end. Each entry follows: `**[OQ-N] Question →** why it matters → options → resolution path → who answers`. Resolved entries move to a "Resolved" section at the bottom with date and decision. Cross-reference every `OQ-N` from inline `**Assumption:** …` markers in other docs.

Use `templates/stage-1-foundation/open-questions.md` as the structural reference.

### Step 7 — Domain-specific docs (decided in conversation)

Ask the user: *"What domain concerns deserve their own document?"* Examples from prior projects: ingestion strategy, payment-flow specifics, accessibility considerations, internationalization considerations, regulatory constraints, scientific methodology. Scaffold a doc per concern under `docs/<concern-slug>.md` using `templates/stage-1-foundation/domain-doc.md`. Don't pre-name them.

### Step 8 — `docs/existing-code-survey.md` (only when scaffolding atop existing code)

When the project is replacing or extending an existing codebase, walk the repo file-by-file and produce a disposition table: `path | role today | disposition (keep / refactor / discard) | why`. Use `templates/stage-1-foundation/existing-code-survey.md` as the structural reference.

### Step 9 — `docs/decisions/D-NNN-slug.md`

When a non-trivial decision crystallizes (architecture pick, model selection, scope cut), write a short decision record under `docs/decisions/D-NNN-<slug>.md` (NNN is zero-padded, e.g., `D-001-architecture-option-b.md`). Format: Decision / Why / Consequences / What we did NOT pick. ~150 words each — these survive when other docs get rewritten.

Use `templates/stage-1-foundation/decisions/D-template.md` as the structural reference.

### Step 10 — Re-read `docs/README.md`

After Stage 1 lands, revisit `docs/README.md`: every doc gets a one-line synopsis, the reading order is right, and the "what's still open" section names the top 3 blocking questions from `open-questions.md`.

### Step 11 — Hand-offs for Stages 2–5

Drop these scaffolds (only the ones the user wants now):

- `docs/claude-design-prompt.md` — Stage 2: pitch-deck prompt with `=== PROMPT ===` / `=== END PROMPT ===` sentinels and a "How to use this file" preamble. See `templates/stage-2-pitch-deck/claude-design-prompt.md`.
- `docs/_deck-bundle/README.md` — Stage 2: brand-bundle assembly notes for Claude Design upload. See `templates/stage-2-pitch-deck/_deck-bundle-readme.md`.
- `docs/app-ia.md` — Stage 3: information architecture skeleton (vocabulary mapping, persona model, route map, screen inventory, data domain model, core flows, API surface, cross-screen invariants, implementation order). See `templates/stage-3-information-architecture/app-ia.md`.
- `docs/app-design-prompt.md` — Stage 4: per-screen design prompt with same sentinel structure as the deck prompt; inherits the brand bundle. See `templates/stage-4-screen-design/app-design-prompt.md`.
- `docs/persona.md` + `docs/tasks.yaml` skeleton — Stage 5: implementation slate. See `templates/stage-5-implementation-slate/`.

The skill **does not author** Stages 2–5 in v1. It scaffolds them and points at the appropriate downstream tool (Claude Design, claude-plan-execute).

## Conventions enforced (load `references/conventions.md` for the full reference)

Lock these as the conversation produces files. They are non-negotiable; they make cross-references survive doc rewrites.

- **Stable IDs.** `M-N` (Must), `S-N` (Should), `C-N` (Could), `W-N` (Won't); `FR-X<n>` (Functional Requirement, group X); `NFR-N`; `OQ-N`; `D-NNN`. Once assigned, never renumber — append.
- **MoSCoW.** Explicit MVP cut. Anti-scope ("Won't") named in plain language so it doesn't drift back in.
- **Doc headers.** Every doc starts with `**Purpose:** …` + `**Status:** draft | for review | approved`.
- **Inline assumptions.** `**Assumption:** …` markers inline are also indexed in `open-questions.md` with an `[OQ-N]` tag.
- **Cross-document references.** Use the IDs (`M-22b`, `FR-D5`, `OQ-3`, `D-001`); don't paraphrase.
- **Sentinels.** Claude Design / external-tool prompts use `=== PROMPT ===` … `=== END PROMPT ===` so the bare prompt body is `awk`-extractable.
- **Filenames.** kebab-case ASCII, lowercase.
- **Currency, dates, units.** Confirmed at intake (Step 0); recorded in `docs/README.md`'s "Conventions" section.

See `references/conventions.md` for the full convention list with examples.

## Templates

Each artifact has a structural template under `templates/`:

- `templates/stage-1-foundation/readme.md`
- `templates/stage-1-foundation/vision.md`
- `templates/stage-1-foundation/roadmap.md`
- `templates/stage-1-foundation/user-requirements.md`
- `templates/stage-1-foundation/open-questions.md`
- `templates/stage-1-foundation/architecture-options.md`
- `templates/stage-1-foundation/domain-doc.md`
- `templates/stage-1-foundation/existing-code-survey.md`
- `templates/stage-1-foundation/decisions/D-template.md`
- `templates/stage-2-pitch-deck/claude-design-prompt.md`
- `templates/stage-2-pitch-deck/_deck-bundle-readme.md`
- `templates/stage-3-information-architecture/app-ia.md`
- `templates/stage-4-screen-design/app-design-prompt.md`
- `templates/stage-5-implementation-slate/persona.md`
- `templates/stage-5-implementation-slate/tasks-yaml-handoff.md`

Templates are **structural guides** (section headings + per-section authoring instructions + tiny illustrative excerpts), not literal-copy skeletons. Use them as the conversation's spine; produce the file with the *user's* content in that shape.

## Reference files

Detail and supporting context for the procedure above:

- `references/conventions.md` — full convention reference with examples
- `references/stage-handoffs.md` — what comes after Stage 1 and how each Stage 2–5 hand-off works
- `references/example-from-bayan.md` — annotated tour of a real Stage-1 application (the reference project) showing how the conventions land in practice

Load each only when needed: `conventions.md` whenever you're about to write a file with cross-references; `stage-handoffs.md` when transitioning out of Stage 1; `example-from-bayan.md` when the user asks "what does this look like in practice?"

## What this skill does NOT do

- **Does not invent project content.** All substance comes from the user. The skill drives the conversation that surfaces it.
- **Does not auto-build the pitch deck, IA, or screens.** It scaffolds prompts and hand-off notes; the actual deck/IA/screens are produced by the appropriate downstream tool (Claude Design, separate skills, or claude-plan-execute).
- **Does not pre-name domain docs.** It asks what's needed for *this* project.
- **Does not duplicate existing material.** When `PLAN.md` or other source material exists, ingest it into the structured artifacts; cite specifically when proposing sections.
- **Does not silently overwrite.** Every iteration on a `draft` doc is proposed first, written after the user approves.
