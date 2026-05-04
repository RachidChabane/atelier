# Template: `docs/persona.md` (or `<project-root>/persona.md`)

Structural guide for the implementation-agent persona doc. Loaded as system context by the tool that drives the build (`claude-plan-execute` or equivalent), or by Claude Code itself in the project root.

## When to write

After Stage 1 is approved and the project is moving toward implementation. The persona doc is the *first thing* the implementation agent reads on every task — it carries the non-negotiables that shape every implementation choice.

## Authoring discipline

Three failure modes to push back on:

1. **Persona as project pitch.** This doc is read before every implementation task; it must be terse and operational, not narrative. No marketing voice.
2. **Persona without non-negotiables.** The most load-bearing section is the *non-negotiables* list — the things that must never break. Without these, the agent will reasonably make wrong choices.
3. **Persona that contradicts `app-ia.md`.** When the persona and the IA disagree, fix the persona; the IA is the reconciled source of truth.

## Required structure

### Title

```markdown
# Persona — <project> implementation agent
```

### Section 1 — What this product is

Two paragraphs paraphrased from `vision.md` § "What this product is, in one sentence" and `roadmap.md` § "Must (MVP)".

```markdown
You are extending **<product name>** — a <one-line description>. The repo and code identifiers stay `<repo name>`; only the user-facing name is <product name> (when these differ).

## What this product is

A <description of the product>. <One-paragraph context — phase of the build, existing codebase, what's shipped vs what's coming>.

The single source of truth for what to build is `docs/`. Read in this order on every task: `app-ia.md` (routes, screens, invariants — start here), `roadmap.md` (the `M-N` IDs each task references), `<dominant-domain-doc>.md` (the constraints that override every generic instinct), `existing-code-survey.md` (file-by-file disposition: keep / refactor / discard), `user-requirements.md` (FR-A through FR-G acceptance criteria).
```

### Section 2 — The non-negotiables

The load-bearing section. Each non-negotiable is one paragraph: the rule + the failure mode if violated.

```markdown
## The non-negotiables — break any of these and the work is wrong

- **<Non-negotiable 1, e.g., "Citation correctness is the binding constraint.">** <Failure mode + consequence.>
- **<Non-negotiable 2, e.g., "Citations precede prose.">** <Failure mode + consequence.>
- **<Non-negotiable 3>**
- **<Non-negotiable 4>**
- **<Non-negotiable 5>**
- **<Non-negotiable 6>**
- **<Non-negotiable 7>**
```

These derive from `vision.md` § "What this product is *not* trying to be" + `vision.md` § "Top three risks" + the cross-screen invariants section of `app-ia.md` + the `decisions/` records.

### Section 3 — Language / chrome conventions (when applicable)

If the project has multiple languages (UI in language X, content in language Y), document the rules:

```markdown
## <Chrome language> chrome, <content language> content

- UI labels, navigation, and chrome are in <language X>. <persona role> in UI, `<EngineeringNoun>` in code.
- <Content language Y> content lives inside `<span dir="<dir>" lang="<lang>">…</span>`. Never inline-mix scripts in a single LTR paragraph.
- Fonts: **<Display X>** for <usage>, **<Body X>** for <usage>, ...
- The product name **<Name>** appears in chrome with <typographic treatment>. Never as a wordmark.
- Banned vocabulary in user-facing strings: <list>. Substitute with <paraphrase rule>.
- <Special string 1, e.g., verification badge wording>: exact text. Do not paraphrase.
- Refusal language: <exact text>. No hedged "I'm sorry" / "I cannot."
```

### Section 4 — Editorial tone

One paragraph naming the visual register the design must hold:

```markdown
## Editorial tone — "<one-line tagline, e.g., scholastic, not startup-tech>"

The visual register is <register>: closer to <reference, e.g., "a university press"> than <anti-reference, e.g., "a B2B SaaS">. Phrases are <style — short, S-V-C, language>. The tone is <adjective list>. No marketing voice. No exclamation marks. No motivational copy.

Anti-patterns to refuse explicitly: <list — gradients, glow, coloured drop shadows, generic icon sets, etc., adapted to the project's register>.
```

### Section 5 — Architecture summary

One short paragraph paraphrased from `architecture-options.md` § Final recommendation:

```markdown
## Architecture — <Option X> from `architecture-options.md`

- **<Architectural choice 1>**: <one-sentence summary>.
- **<Architectural choice 2>**: <one-sentence summary>.
- **<Architectural choice 3>**: <one-sentence summary>.
- **<Architectural choice 4>**: <one-sentence summary>.
```

### Section 6 — Codebase conventions

Stack-level conventions:

```markdown
## Codebase conventions

- Backend: <stack>. <language>. Tests under `<path>`. Lint with <tool>; types with <tool>.
- Frontend: <stack>. Tests via <tool>.
- Auth surfaces are intact (<phase>). The <hardening detail, when relevant> is exactly the right shape — keep it.
- <Migration window note when applicable: e.g., legacy endpoints stay during migration; route them through a default-X shim until <phase> lands; delete after.>
```

### Section 7 — Working style

Operational rules per task:

```markdown
## Working style

- One commit per task, message in conventional-commit form (`feat:`, `fix:`, `chore:`, `docs:`).
- For schema tasks: write the migration, run it against the live <db>, update the ORM models in the same task. Test gate verifies the post-migration state.
- For UI tasks: end with the <validation step, e.g., Playwright design-fidelity gate> at <viewports> against the running dev server. The "UI redesign must end with <validation>" rule from prior cycles is non-negotiable.
- Don't add features beyond the task description. Don't write defensive validation for inputs that can't reach the function. Don't write multi-paragraph docstrings. Default to no comments. No backwards-compatibility shims unless the task description names a migration window.
- When in doubt about a contradicting reading of `docs/`, follow `app-ia.md` (it is the reconciled source of truth as of <YYYY-MM-DD>).
```

## Conventions specific to this doc

- **Read on every task.** Keep terse — the persona doc is loaded into every implementation context. Bloat costs tokens on every task.
- **Non-negotiables are load-bearing.** This is the section the agent must internalize; format them so they're scannable and memorable.
- **Source-of-truth pointer.** The persona always names which doc is the reconciled source of truth (`app-ia.md`) so the agent knows where to go when docs disagree.

## Anti-patterns

- **Persona as marketing pitch.** "<Product> is an exciting new platform that empowers..." → strike. Operational tone only.
- **Persona without non-negotiables.** The agent will make reasonable defaults that are wrong-for-this-project.
- **Persona that re-explains everything in `docs/`.** Pointers, not duplication. The persona references the docs; the docs carry detail.
