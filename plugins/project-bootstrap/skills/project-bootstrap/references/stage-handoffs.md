# Stage hand-offs reference

What comes after Stage 1 and how each subsequent stage is invoked. Load when transitioning out of Stage 1.

The `project-bootstrap` skill drives Stage 1 end-to-end. Stages 2–5 are *prepared* — the skill drops scaffolds under `docs/` and points at the right downstream tool. The user invokes each downstream stage when they're ready.

## Why the split

The five stages produce different *kinds* of artifact under different *workflow* conditions:

- **Stage 1 (foundation docs).** Conversation with the owner; produces structured markdown under `docs/`. This skill's bread and butter.
- **Stage 2 (pitch deck).** Generative tool (Claude Design); produces slides. Requires a brand bundle prepared from Stage 1 + design tokens.
- **Stage 3 (information architecture).** Conversation that synthesizes Stage 1 docs into a route map and screen inventory. Could be its own skill in v2; for now, the scaffold is enough to drive the conversation.
- **Stage 4 (screen design).** Same generative tool as Stage 2 (Claude Design), per-screen. Inherits Stage 2's brand bundle.
- **Stage 5 (implementation slate).** Hand-off to `claude-plan-execute` (or equivalent), which converts the IA into a `tasks.yaml` plus per-task config and drives the build.

Each stage's *output* feeds the next stage's *input*. Stage 1's vision/roadmap/requirements feeds Stage 2's deck content. Stage 1's user requirements feed Stage 3's route map. Stage 3's IA feeds Stage 4's per-screen specs. Stage 3's IA feeds Stage 5's task slate.

## Stage 2 — Pitch deck (Claude Design)

**When ready.** Stage 1 is `approved` (or close) and the owner wants to pitch the project externally — to early users, collaborators, prospective contributors.

**What the skill drops.**

- `docs/claude-design-prompt.md` — the deck prompt with `=== PROMPT ===` sentinels and a "How to use this file" preamble.
- `docs/_deck-bundle/README.md` — assembly guide for the brand bundle the user uploads to Claude Design first (typography, tokens, reference screenshots).
- `docs/_deck-bundle/01-brand-system-upload/` — empty directory; user populates with brand assets.
- `docs/_deck-bundle/02-deck-attachments/` — empty directory; user populates with cost spreadsheets or other reference data the deck needs.

**What the user does.**

1. Populate `_deck-bundle/01-brand-system-upload/` with brand assets (design tokens CSS, brand spec, reference screenshots, font files).
2. Populate `_deck-bundle/02-deck-attachments/` with reference data (spreadsheets, datasets) the deck content references.
3. Open Claude Design (claude.ai/design); upload the brand bundle to the Design System; flip "Published" on.
4. Create a new "Slide deck" project; paste the body of `claude-design-prompt.md` (between the sentinels); attach the deck attachments; iterate.
5. Export PDF.

The `_deck-bundle/README.md` template walks step-by-step through the Claude Design UI flow.

**Hand-off note in `claude-design-prompt.md` body.** The prompt should reference Stage 1 IDs explicitly: "Slide N covers `M-22b` from `roadmap.md`," "Slide N's commitment list maps to `FR-D8` and `FR-D9`." This keeps the deck and the planning docs synchronized.

## Stage 3 — Information architecture

**When ready.** Stage 1 is `approved` and the project is moving toward implementation. Before the build can start, someone needs to map the user-requirements onto a concrete user-facing surface.

**What the skill drops.**

- `docs/app-ia.md` — IA skeleton with sections: vocabulary mapping (UI noun → engineering noun), persona model, route map, screen inventory (one entry per screen with purpose, data, states, components, endpoints, anti-patterns), data domain model, core flows, API surface, cross-screen invariants, implementation order.

**What the user does.**

Drive the conversation through each section, using `templates/stage-3-information-architecture/app-ia.md` as the spine. Reference Stage 1 artifacts continuously:

- Vocabulary mapping references `user-requirements.md` personas and `architecture-options.md` data model.
- Route map references `FR-*` IDs from `user-requirements.md`.
- Screen inventory references `M-*` and `S-*` IDs from `roadmap.md` to indicate MVP vs post-MVP screens.
- Cross-screen invariants reference `D-*` decision records and `vision.md` non-negotiables.

The IA is the **reconciled source of truth** once it lands — if Stage 1 docs say one thing and the IA says another, the IA wins (and the Stage 1 docs get amended).

**Future v2.** A separate `app-ia` skill could automate this conversation. For now, the template + this hand-off note is enough.

## Stage 4 — Screen design (Claude Design, per-screen)

**When ready.** `app-ia.md` names the load-bearing screens and Stage 2's brand bundle is uploaded to Claude Design.

**What the skill drops.**

- `docs/app-design-prompt.md` — the screen-design prompt with the same sentinel structure as `claude-design-prompt.md`. Body inherits the brand bundle from Stage 2 and reads the screen specs from `app-ia.md`.

**What the user does.**

1. Confirm Stage 2's brand bundle is uploaded to Claude Design (already done in Stage 2 — re-use).
2. Create a new "Prototype" project in Claude Design (not "Slide deck").
3. Paste the prelude from `app-design-prompt.md` once (project context + audience + tone + banned-vocab + visual direction) to set the system.
4. For each screen named in `app-ia.md`'s screen inventory: paste the per-screen spec individually. Iterate. Export.

Per-screen iteration is the rule: Claude Design produces noticeably better single-screen mockups than multi-screen sets.

**Hand-off discipline.** The screen specs in `app-design-prompt.md` reference `app-ia.md` screen entries by name (e.g., "Screen 2 — Vue de réponse avec citations vérifiées maps to `app-ia.md` § 7 Screen 2"). When `app-ia.md` is updated, regenerate the corresponding screen.

## Stage 5 — Implementation slate (claude-plan-execute)

**When ready.** `app-ia.md` is approved, the brand and screens are settled, the owner is ready to drive the build.

**What the skill drops.**

- `docs/persona.md` — the implementation-agent persona doc that goes into the project root (or wherever the implementation tool reads from). Names the project, the non-negotiables, the architecture, the codebase conventions.
- `docs/tasks-yaml-handoff.md` — instructions for converting `app-ia.md` § 12 (implementation order) into a `tasks.yaml` consumable by `claude-plan-execute`.

**What the user does.**

1. Copy / adapt `docs/persona.md` to the location the implementation tool expects.
2. Walk through `app-ia.md` § 12 implementation order; for each phase, draft a `tasks.yaml` task with its dependencies, context files, and acceptance criteria. The hand-off doc has the schema.
3. Invoke `claude-plan-execute` (or equivalent) against the resulting `tasks.yaml`.

**Future v2.** A separate `plan-execute-handoff` skill could automate the IA-to-tasks-yaml conversion. For now, the template + this hand-off note is enough.

## When user wants to skip stages

Some projects don't need a deck (internal tooling). Some don't need an IA (CLI tools, library code). Some won't use `claude-plan-execute` (the owner builds solo without orchestration).

**Rule.** Don't drop scaffolds the user doesn't want. Ask at the end of Stage 1: *"Which of Stages 2–5 should I prepare scaffolds for?"* — and only drop the ones they say yes to.

## When user already has Stage 2/3/4 artifacts

If `claude-design-prompt.md` already exists from a prior iteration, don't overwrite. Read it; offer to update it against the latest Stage 1 content; let the user approve diffs.

Same for `app-ia.md`, `app-design-prompt.md`, `persona.md`, `tasks.yaml`.
