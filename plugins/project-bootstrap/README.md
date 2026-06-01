# project-bootstrap

Drive a fresh or partially-planned project through opinionated Stage-1 planning artifacts (vision, roadmap, user requirements, open questions, architecture options, decisions, plus domain-specific docs) under `docs/`, and prepare hand-offs for design system + pitch deck (Stage 2), information architecture (Stage 3), screen design (Stage 4), and implementation slate (Stage 5).

Stage 2 is two ordered phases: **create and Publish a design system first** via Claude Design's **"Set up your design system" form** (a worksheet of copy-paste field values, not a chat prompt — works whether or not the project already has a brand), **then generate a pitch deck as a project that inherits it** — matching Claude Design's form-based, publish-and-inherit model. Stage 4 screens inherit the same published design system, and can bridge into the build via Claude Design's "Handoff to Claude Code" export.

## What ships

- Skill: **`project-bootstrap`** — drives the conversation that produces the Stage-1 slate. Resumes from whatever artifacts already exist in `docs/`.

## How to use

In a project directory, describe the task in any words — *"bootstrap this project"*, *"set up the docs folder"*, *"scaffold vision and roadmap for this repo"* — and Claude will trigger the skill from the description match. Or invoke it directly by name:

```text
/project-bootstrap
```

The skill will:

1. List `docs/` and detect what already exists.
2. Ask three intake questions (one sentence on what the project is; whether it's atop existing code; currency + date conventions).
3. Drive the conversation through each Stage-1 artifact, following the templates and conventions bundled with the skill.
4. Drop hand-off scaffolds for Stages 2–5 if you want them.

Re-invoking on the same repo picks up where the previous run left off — by reading the `**Status:** draft | for review | approved` header line of each artifact.

## What you get

A `docs/` folder containing:

- `README.md` — the docs index
- `vision.md` — measurable signals at MVP / 6 months / 18 months
- `roadmap.md` — MoSCoW with stable IDs (`M-1`, `S-1`, `C-1`) and explicit Won't list
- `user-requirements.md` — personas + numbered FRs (`FR-A1`, `FR-D5`, …) with acceptance criteria
- `open-questions.md` — live OQ log (`OQ-1`, `OQ-2`, …) cross-referenced from inline `**Assumption:**` markers
- `architecture-options.md` — option comparison + recommendation (only when there's a real fork)
- `decisions/D-NNN-<slug>.md` — short decision records that survive doc rewrites
- 0–N domain-specific docs (named in conversation; e.g., `<topic>-considerations.md`, `<topic>-strategy.md`)
- `existing-code-survey.md` — only when scaffolding atop existing code

Plus optional Stage 2–5 hand-off scaffolds (`design-system-setup.md` + `claude-design-prompt.md`, `app-ia.md`, `app-design-prompt.md`, `persona.md`, etc.) when you want them.

## What this skill does NOT do

- Does not invent project content. The user articulates substance; the skill drives structure.
- Does not auto-build the pitch deck, IA, screens, or implementation. It scaffolds and points at the right downstream tool (Claude Design, separate skills, `claude-plan-execute`).
- Does not pre-name domain docs. Asks what the project actually needs.

## Changelog

### 0.2.1

- **Stage 2 font-upload fix.** Clarified that Claude Design does **not** fetch fonts by name — when the design system pins specific typefaces, the actual font **files must be uploaded** via *"Add fonts, logos and assets"*, or Claude renders substitute web fonts and shows a *"Missing brand fonts"* warning. Updated `design-system-setup.md` (attach checklist), `_deck-bundle-readme.md` (non-skippable upload step + `01-design-system-sources/fonts/` tree with full/variable files + license + troubleshooting entry), and `stage-handoffs.md` (distinct required step). Guidance: upload the canonical **full/variable `.ttf`/`.otf`** (complete weight axis + charset), not the subsetted `.woff2` fragments a build pipeline emits.

### 0.2.0

- **Stage 2 rebuilt around how Claude Design actually works — design-system-first, form-based.** Split Stage 2 into two ordered phases: **Phase 2a** creates and **Publishes** a Claude Design *design system* through the **"Set up your design system" form** (color palette, typography, components, layout patterns); **Phase 2b** generates a pitch deck as a project, created conversationally, that **inherits** the published system automatically.
- **Phase 2a is a form worksheet, not a chat prompt.** Added `templates/stage-2-brand-and-deck/design-system-setup.md` — copy-paste blocks mapped to the form's fields (*Company name and blurb*, *Any other notes?*, the optional examples attach checklist) plus the **review → Publish (→ Remix to edit later)** loop. `=== PROMPT ===` sentinels are now reserved for chat prompts only (deck, screens). Works whether or not the project already has a brand: every project fills the same form; the only branch is which optional sources it attaches.
- **Deck prompt inherits, doesn't redefine, and assumes no project-type picker.** `claude-design-prompt.md` points at the published design system and describes deck creation conversationally; export options corrected to the real menu (zip · PDF · PPTX · Canva · standalone HTML · Handoff to Claude Code).
- **`_deck-bundle/README.md` reordered** to: open the org picker → fill the setup form & **Publish** → create the deck project that inherits it → iterate via **Chat + inline comments** → export. Removed unverified UI affordances (no "Slide deck"/"High fidelity" picker, "adjustment knobs", or "direct text edit").
- **Stage 4 inherits the same published design system**, and the Stage 4 → 5 bridge now uses Claude Design's native **"Handoff to Claude Code"** export.
- Renamed template dir `stage-2-pitch-deck/` → `stage-2-brand-and-deck/`.

### 0.1.0

- Initial release: Stage-1 foundation slate (vision, roadmap, requirements, open questions, architecture options, decisions, domain docs) + hand-off scaffolds for Stages 2–5.

## See also

- The skill itself: [`skills/project-bootstrap/SKILL.md`](skills/project-bootstrap/SKILL.md)
- Conventions reference: [`skills/project-bootstrap/references/conventions.md`](skills/project-bootstrap/references/conventions.md)
- Stage hand-offs reference: [`skills/project-bootstrap/references/stage-handoffs.md`](skills/project-bootstrap/references/stage-handoffs.md)
- Annotated example from a real project: [`skills/project-bootstrap/references/example-walkthrough.md`](skills/project-bootstrap/references/example-walkthrough.md)
- Marketplace root: [`../../README.md`](../../README.md)
