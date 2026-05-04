# project-bootstrap

Drive a fresh or partially-planned project through opinionated Stage-1 planning artifacts (vision, roadmap, user requirements, open questions, architecture options, decisions, plus domain-specific docs) under `docs/`, and prepare hand-offs for pitch deck (Stage 2), information architecture (Stage 3), screen design (Stage 4), and implementation slate (Stage 5).

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

Plus optional Stage 2–5 hand-off scaffolds (`claude-design-prompt.md`, `app-ia.md`, `app-design-prompt.md`, `persona.md`, etc.) when you want them.

## What this skill does NOT do

- Does not invent project content. The user articulates substance; the skill drives structure.
- Does not auto-build the pitch deck, IA, screens, or implementation. It scaffolds and points at the right downstream tool (Claude Design, separate skills, `claude-plan-execute`).
- Does not pre-name domain docs. Asks what the project actually needs.

## See also

- The skill itself: [`skills/project-bootstrap/SKILL.md`](skills/project-bootstrap/SKILL.md)
- Conventions reference: [`skills/project-bootstrap/references/conventions.md`](skills/project-bootstrap/references/conventions.md)
- Stage hand-offs reference: [`skills/project-bootstrap/references/stage-handoffs.md`](skills/project-bootstrap/references/stage-handoffs.md)
- Annotated example from a real project: [`skills/project-bootstrap/references/example-from-bayan.md`](skills/project-bootstrap/references/example-from-bayan.md)
- Marketplace root: [`../../README.md`](../../README.md)
