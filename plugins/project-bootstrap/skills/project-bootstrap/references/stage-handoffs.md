# Stage hand-offs reference

What comes after Stage 1 and how each subsequent stage is invoked. Load when transitioning out of Stage 1.

The `project-bootstrap` skill drives Stage 1 end-to-end. Stages 2–5 are *prepared* — the skill drops scaffolds under `docs/` and points at the right downstream tool. The user invokes each downstream stage when they're ready.

## Why the split

The five stages produce different *kinds* of artifact under different *workflow* conditions:

- **Stage 1 (foundation docs).** Conversation with the owner; produces structured markdown under `docs/`. This skill's bread and butter.
- **Stage 2 (design system + pitch deck).** Generative tool (Claude Design), in two ordered phases. **Phase 2a** creates and **Publishes** a design system (palette, typography, components, layout patterns) through Claude Design's **"Set up your design system" form** — seeded from a company blurb + brand notes, optionally enriched with attached code/Figma/assets. **Phase 2b** generates the pitch deck as a project, created conversationally, that **inherits** the published design system. No pre-existing brand bundle is assumed.
- **Stage 3 (information architecture).** Conversation that synthesizes Stage 1 docs into a route map and screen inventory. Could be its own skill in v2; for now, the scaffold is enough to drive the conversation.
- **Stage 4 (screen design).** Same generative tool as Stage 2 (Claude Design), per-screen. Inherits the **published design system from Stage 2** automatically — no re-upload.
- **Stage 5 (implementation slate).** Hand-off to `claude-plan-execute` (or equivalent), which converts the IA into a `tasks.yaml` plus per-task config and drives the build.

Each stage's *output* feeds the next stage's *input*. Stage 1's vision/brand decisions feed Stage 2's **design system** (Phase 2a); Stage 1's vision/roadmap/requirements feed Stage 2's **deck** content (Phase 2b). Stage 1's user requirements feed Stage 3's route map. Stage 3's IA feeds Stage 4's per-screen specs. Stage 3's IA feeds Stage 5's task slate. The **published design system from Stage 2 Phase 2a** feeds Stage 4's screens.

## Stage 2 — Design system + pitch deck (Claude Design)

Stage 2 is **two ordered phases**. The design system comes **first** and is **Published**; the deck is generated **second** as a project that inherits it. This matches how Claude Design actually works:

- The design system is created through a **setup form** — *"Set up your design system"* — reached from the **organization picker (lower-left)**; it requires **admin permissions** and is **organization-scoped** (it is *not* a chat prompt). The form's fields are: **"Company name and blurb (or name of design system)"**, an optional **"Provide examples of your design system and products (all optional)"** section (*Link code on GitHub* · *Link code from your computer* · *Upload a .fig file* · *Add fonts, logos and assets*), and **"Any other notes?"**. Claude generates a UI kit (color palette, typography, components, layout patterns) from those inputs.
- The owner **reviews** the kit (validating with a throwaway test project), refines or swaps source assets, then flips the **"Published"** toggle on. Once Published, **every project created from the Claude Design homescreen while in that organization inherits the design system automatically** — no re-upload, no reconfiguration. The system is **editable later via "Remix"** (org settings → "Open" → "Remix" opens a chat to modify it).

(Sources: Claude Design support, "Set up your design system" and "Get started with Claude Design.") **No pre-existing brand bundle is assumed** — every project fills the same form; the only branch is which optional examples it attaches. A from-scratch project seeds the brand from the blurb + notes alone (all examples are optional); when real code or assets exist, attaching ≥1 source materially improves extraction.

**When ready.** Stage 1 is `approved` (or close) and the owner wants either to establish the project's visual identity, to pitch externally, or both. Even a project that skips the deck benefits from Phase 2a if Stage-4 screens are coming.

**What the skill drops.**

- `docs/design-system-setup.md` — **Phase 2a.** A **form worksheet** (copy-paste blocks mapped to the setup-form fields — **not** a `=== PROMPT ===` chat block): the *Company name and blurb* value (from `vision.md`), the *Any other notes?* value (distilled brand direction — notes-length), the optional **attach checklist**, and the **review → Publish (→ Remix to edit later)** loop.
- `docs/claude-design-prompt.md` — **Phase 2b.** The deck **chat prompt** (`=== PROMPT ===` sentinels) that generates the deck as a project, created conversationally, **inheriting the published design system**. Does not redefine palette/type, and assumes no "project type" picker.
- `docs/_deck-bundle/README.md` — the operational step-by-step that sequences both phases through the Claude Design UI (fill the form & Publish the design system → create the deck project that inherits it → iterate → export).
- `docs/_deck-bundle/01-design-system-sources/` — empty directory; **optional** assets (fonts, logos, brand PDF, reference screenshots) to drag into the setup form. Stays empty for from-scratch projects.
- `docs/_deck-bundle/02-deck-attachments/` — empty directory; user populates with cost spreadsheets or other reference data the deck needs.

**What the user does.**

*Phase 2a — create & publish the design system (do this first):*

1. Open Claude Design; from the **organization picker (lower-left)** select/create the org (admin permissions required) and start *"Set up your design system."*
2. Fill the form from `design-system-setup.md`: paste the **Company name and blurb** and **Any other notes?** values; optionally attach code (GitHub link or a dragged frontend subfolder), a `.fig`, or fonts/logos/assets from `01-design-system-sources/`.
3. Review the generated UI kit (validate with a test project; swap assets if extraction is weak), then **flip "Published" on.** Non-optional — an unpublished system is not inherited. (Edit later via **Remix**.)

*Phase 2b — generate the deck (inherits the published system):*

4. Populate `_deck-bundle/02-deck-attachments/` with reference data (spreadsheets, datasets) the deck content references.
5. From the Claude Design homescreen, create a new project in the same organization — creation is **conversational** (describe the deck; no project-type picker), and it **inherits the published design system automatically**. Send the body of `claude-design-prompt.md` (between the sentinels) as the first message; attach the deck attachments; iterate via **Chat** and **inline comments**.
6. Export — **standalone HTML** for an interactive deck, **PDF/PPTX** for a static hand-out.

The `_deck-bundle/README.md` template walks step-by-step through the full two-phase Claude Design UI flow.

**Hand-off note.** The deck prompt should reference Stage 1 IDs explicitly: "Slide N covers `M-22b` from `roadmap.md`," "Slide N's commitment list maps to `FR-D8` and `FR-D9`." This keeps the deck and the planning docs synchronized. The design-system worksheet grounds its *Company name and blurb* and *Any other notes?* values in `vision.md` (§ "what this product is" and § "why good looks different here").

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

**When ready.** `app-ia.md` names the load-bearing screens and the published design system from Stage 2 (Phase 2a) is live in Claude Design.

**What the skill drops.**

- `docs/app-design-prompt.md` — the screen-design prompt with the same sentinel structure as `claude-design-prompt.md`. Body inherits the **published design system from Stage 2** and reads the screen specs from `app-ia.md`.

**What the user does.**

1. Confirm the **published design system from Stage 2 (Phase 2a)** is live in Claude Design — it was Published once and is **inherited automatically**; nothing to re-upload. Stage 4 rides on the *same* published system as the deck.
2. From the homescreen, create a new project in the same organization. Creation is **conversational** (no project-type picker); it inherits the published design system automatically.
3. Send the prelude from `app-design-prompt.md` once (project context + audience + tone + banned-vocab + visual direction) to set the system.
4. For each screen named in `app-ia.md`'s screen inventory: send the per-screen spec individually. Iterate via **Chat** and **inline comments**. Export.

Per-screen iteration is the rule: Claude Design produces noticeably better single-screen mockups than multi-screen sets.

**Hand-off discipline.** The screen specs in `app-design-prompt.md` reference `app-ia.md` screen entries by name (e.g., "Screen 2 — Vue de réponse avec citations vérifiées maps to `app-ia.md` § 7 Screen 2"). When `app-ia.md` is updated, regenerate the corresponding screen.

**Stage 4 → Stage 5 bridge.** Claude Design's Export menu includes **"Handoff to Claude Code"** (sub-options *Send to local coding agent* and *Send to Claude Code Web*). This is the accurate hand-off path from the generated screens into the implementation build — it hands the design over to a coding agent, where Stage 5's `claude-plan-execute` slate can drive the build against it. (For static reference, the same menu also exports standalone HTML / .zip.)

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

If `design-system-setup.md` or `claude-design-prompt.md` already exists from a prior iteration, don't overwrite. Read it; offer to update it against the latest Stage 1 content; let the user approve diffs.

Same for `app-ia.md`, `app-design-prompt.md`, `persona.md`, `tasks.yaml`.
