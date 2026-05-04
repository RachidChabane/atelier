# Template: `docs/app-design-prompt.md`

Structural guide for the per-screen design prompt that gets pasted into Claude Design (claude.ai/design). Inherits the brand bundle uploaded for Stage 2 (the deck). Generates static HTML mockups of the load-bearing screens named in `app-ia.md` § 7 (screen inventory).

## When to write

After `app-ia.md` is approved (Stage 3 done) and Stage 2's brand bundle is already uploaded to Claude Design.

## Authoring discipline

Same sentinel structure as the deck prompt (`docs/claude-design-prompt.md`): bracketed by `=== PROMPT ===` / `=== END PROMPT ===` so the bare prompt body is `awk`-extractable. Above the sentinels: a "How to use this file" preamble.

The prompt **does not redefine the brand bundle** — it references the uploaded one. Per-screen specs are derived from `app-ia.md` § 7 entries.

## Required structure of the file

### Header

```markdown
**Purpose:** A self-contained prompt the owner can paste into Claude Design to produce static HTML mockups of <project>'s load-bearing screens. Inherits the brand system, tone, banned vocabulary, typography stack, and palette from `claude-design-prompt.md`.
**Status:** draft.
```

### Section 1 — How to use this file

```markdown
## How to use this file

1. **Confirm the brand bundle from Stage 2 is uploaded** to Claude Design's Design System (uploaded once for the deck; reused here).
2. **Set the canvas** to <desktop primary, e.g., 1920×1200>. Mobile is a separate pass.
3. **Iterate one screen at a time.** Do not paste the entire prompt body and ask for N screens in a single call. Paste the project-context + audience + tone + banned-vocab + visual-direction prelude *once* (these set the system), then paste each screen's per-screen spec individually. Per-screen iteration is the rule; Claude Design produces noticeably better single-screen mockups than multi-screen sets.
4. **Run a Playwright validation pass at the end** when the project ships an actual frontend. The first user sees what Playwright signed off on, not what Claude Design rendered.
5. **Copy everything between the `=== PROMPT ===` markers below** into Claude Design.
```

### Section 2 — The prompt block

```markdown
---

```
=== PROMPT ===

[the paste-ready prompt body]

=== END PROMPT ===
```
```

The prompt body's internal structure:

#### Block A — Project context (one paragraph)

Paraphrased from `vision.md`. One sentence naming the product + one sentence naming what's distinctive about it.

#### Block B — Audience and tone

Same audience as the deck (paraphrased from `claude-design-prompt.md` § Audience). Tone register (editorial vs SaaS; restrained vs maximalist; etc.). Constraints on language (which vocabulary stays intact, which gets paraphrased).

#### Block C — Banned vocabulary in the UI

Same banned vocabulary as the deck (referenced from `claude-design-prompt.md`), augmented with UI-specific banned terms — chrome words like "Loading…", "Click here", "Submit", "Get started", "Welcome back", "Empty state" — replaced with editorial paraphrases.

#### Block D — Visual direction (refer to the uploaded bundle)

Reference the uploaded brand bundle for palette, typography, and mark. Specify per-screen variants (light register default; optional dark register variant per screen). Repeat the anti-patterns list (gradients, generic icons, stock photos, skeuomorphic chrome, card shadows — the same list as the deck).

#### Block E — Output format requirements (apply to all screens)

```markdown
- One standalone HTML file per screen. No JS framework. Vanilla HTML + CSS + design tokens inlined as a `<style>` block at the top of `<head>`. Semantic HTML (`<main>`, `<aside>`, `<nav>`, `<article>`, `<section>`, `<dialog>`).
- Canvas: <px W>×<px H> desktop primary. Mobile is a separate pass.
- Embed fonts via `@import` from Google Fonts.
- <Domain-specific content> lives in `<span dir="<dir>" lang="<lang>">…</span>` blocks. Never inline-mix scripts in a single LTR paragraph.
- No JavaScript except inert event handlers for explicit demo states.
- Filename convention: `<project>-screen-N-<slug>.html`.
```

#### Block F — Per-screen specs

One block per screen named in `app-ia.md` § 7. Each block:

```markdown
---

# Screen N — <UI label>

**English clarification:** <translation if not English>.

**Purpose.** <One paragraph; paraphrased from `app-ia.md` § 7 Screen N "Purpose">.

**User context.** <Paraphrased from `app-ia.md` § 7 Screen N "User context">.

**Content shown — populated example (use this exact data; do not substitute lorem ipsum).** <Real, populated data drawn from the project domain. Specific names, specific numbers, specific text content. Lorem ipsum kills the design conversation; populated examples land it.>

**Layout direction.** <Specify columns, widths in px, content area dimensions, visual hierarchy>.

**Key components (named).** <Each component named, with specs. The names recur across screens for consistency.>

**States to render in the mockup.** <Primary state (the populated case above), plus 1–2 edge states rendered as 320×200 thumbnails in margins of the main canvas. Common edge states: refusal / partial-evidence / empty / loading.>

**Arabic-first / language-X-first treatment.** <If the project has bidirectional or non-Latin content; specify how the script transitions are handled>.

**What this screen must NOT become.** <The anti-patterns block from `app-ia.md` § 7 Screen N. Concrete: not a Notion-like editor, not a PDF viewer chrome, not a chat bubble interface, not a SaaS dashboard. The anti-patterns must be specific to the screen.>
```

Repeat for each screen.

### Section 3 — Iteration tips

Common rejection lines for Claude Design when designs drift:

```markdown
## Notes on iterating

The first pass per screen will need at least 1–2 rounds. Common pushback lines:

### Pushback A — generic SaaS register snuck in

> Screen N is reading as tech-startup, not <intended register>. Specifically: [name the issue — gradients, coloured shadows, generic icons, full-width amber buttons, etc.]. Refer to the *Visual direction* section.

### Pushback B — banned vocabulary appeared

> Screen N has "<banned term>" visible in the UI. Replace per the *Banned vocabulary in the UI* section. Substitute with "<paraphrase>".

### Pushback C — anti-patterns ignored

> Screen N became <anti-pattern: a Notion-like editor / a PDF viewer chrome / a chat bubble interface / a SaaS dashboard>. Refer to the *What this screen must NOT become* block. <Specific instruction to revert.>

### Pushback D — placeholder text instead of populated example

> Screen N is using lorem ipsum or "Sample text 1, Sample text 2." Use the exact populated example data from *Content shown — populated example*. The mockup must read as a real session, not as a wireframe.
```

## Conventions specific to this doc

- **Sentinels.** Same as `claude-design-prompt.md`.
- **Per-screen iteration.** Don't ask Claude Design for all screens in one go.
- **Populated examples.** Use real domain data drawn from `app-ia.md` § 7 — populated mockups are 10× more useful than wireframes for design review.
- **Anti-patterns section per screen** — verbatim from `app-ia.md`. Don't paraphrase or weaken.

## Anti-patterns

- **Asking for all screens at once.** Per-screen iteration produces noticeably better mockups.
- **Lorem ipsum content.** Kills the design conversation; mockups feel generic.
- **Re-deriving palette and typography.** The brand bundle is uploaded once; reference it.
- **Missing edge states.** A screen rendered only in its happy state gives no signal about how empty / refusal / partial states will land.
