# Template: `docs/design-system-setup.md`

Structural guide for the **Phase 2a** worksheet that establishes the project's **design system** in Claude Design (claude.ai/design). The design system in Claude Design is created through a **setup form** — "Set up your design system" — **not** by pasting a chat prompt. So this file is a **form-field worksheet**: copy-paste-ready values mapped one-to-one to the form's fields, plus an attach checklist and the publish loop. It is **owner-only** infrastructure for the client-facing artifacts, not a client-facing artifact itself.

Phase 2a runs **before** the pitch-deck prompt (`docs/claude-design-prompt.md`, Phase 2b) and before any Stage-4 screen work. The design system is set up and **Published once** per organization; every Claude Design project created afterward in that organization **inherits it automatically** — the deck (Phase 2b) and the Stage-4 screens both ride on this one published system.

## When to write

Alongside `docs/claude-design-prompt.md`, at the start of Stage 2. Write it whenever the project will produce *any* generative visual artifact (deck or screens) — which is almost always, since the deck is downstream of it.

## Authoring discipline — this is FORM INPUT, not a chat prompt

**Do not wrap any of these values in `=== PROMPT ===` sentinels.** The `=== PROMPT ===` convention is reserved for chat prompts that get pasted into a Claude Design project's chat (the deck in Phase 2b, the screens in Stage 4). The design system is created by **typing into a form and dragging files into it** — so this worksheet uses clearly-labeled, copy-pasteable blocks, one per form field. A reader copies the **Company name and blurb** block into that field, the **Any other notes?** block into that field, and works the attach checklist.

There is **one form for every project.** The old "brand exists vs brand from scratch" split is gone — both fill the same form. The only branch is the **attach checklist**: a project with frontend code or real brand assets attaches at least one; a from-scratch project skips the code attachments and relies on the blurb + notes (optionally plus inspiration assets).

> **Grounding note.** Claude Design documents the design system as created via the setup form, made the org standard with the **"Published"** toggle, inherited automatically by new in-org projects, and editable later via **"Remix."** Anchor on those documented facts; do not invent other UI labels. Sources:
> - https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design
> - https://support.claude.com/en/articles/14604416-get-started-with-claude-design

## Required structure of the file

### Header

```markdown
**Purpose:** A copy-paste worksheet for Claude Design's "Set up your design system" **form**. The owner pastes each block into the matching form field, works the attach checklist, then reviews the generated UI kit and flips **"Published"** on. Every later Claude Design project in the organization (the pitch deck in Phase 2b, the Stage-4 screens) inherits this published system automatically. This file is **owner-only**.
**Status:** draft.
```

### Section 1 — How to use this file

```markdown
## How to use this file

**This is Phase 2a — establish the design system. Do it before the deck (`claude-design-prompt.md`, Phase 2b) and before any screen work (Stage 4).** The design system is created through Claude Design's **setup form**, not a chat prompt — so you *type/paste into form fields and drag files in*, you don't paste a `=== PROMPT ===` block.

1. **Open the form.** In Claude Design, open the **organization picker (lower-left)**, select or create the organization the deck and screens will live under, and start its design-system onboarding. This requires **admin permissions**; design systems are **organization-scoped**.
2. **Fill the fields** from the blocks below: paste *Company name and blurb* and *Any other notes?* into the matching fields.
3. **Work the attach checklist.** All examples are **optional** — you can seed the brand from the blurb + notes alone — but when real code or assets exist, attaching at least one materially improves what Claude extracts.
4. **Generate, then review.** Claude produces a UI kit (palette, typography, components, layout patterns). Validate it by creating a throwaway test project (a landing page or dashboard). If extraction is weak, add or swap source assets.
5. **Publish.** Flip the **"Published"** toggle on. Every project you create in this organization afterward inherits the system automatically.
6. **Edit later** via **"Remix"** (org settings → "Open" next to the design system → "Remix" opens a chat to modify it). No re-publish dance for tweaks.

This file is a worksheet, not a script — there is nothing to `awk`-extract.
```

### Section 2 — Field: Company name and blurb

A clearly-labeled copy block (plain fenced text, **no sentinels**) giving the exact value to paste. Map it to the form's *"Company name and blurb (or name of design system)"* field. Derive 1–2 sentences from `vision.md` § "What this product is, in one sentence" — what the product is, who it's for, the surfaces it spans (kiosk / mobile / web / etc.).

```markdown
## Field — "Company name and blurb (or name of design system)"

Paste this into the form's first field. One to two sentences, derived from `vision.md`.

> <Product name>: <one-sentence what-it-is and who-it's-for, naming the surfaces it spans — e.g. "fast-casual pasta restaurant with in-store touchscreen kiosk, mobile app and website">.
```

### Section 3 — Field: Any other notes?

The brand-direction field. This is where the owner's *deliberate* brand decisions go — but **notes-length, not an essay.** Distill the Stage-1 brand decisions into a compact paragraph or a short bullet list the form can hold: palette intent, typography intent, voice/tone, motion, and any hard constraints (e.g. a non-figurative avatar, a script requirement, an anti-pattern to refuse).

```markdown
## Field — "Any other notes?"

Paste this into the form's notes field. Keep it notes-length — a few sentences or tight bullets, not a spec. This is the "neutral on content" boundary: the skill gives the *shape* of each decision; you supply the *substance*.

> - **Palette intent:** <e.g. warm, earthy; three colors total — one background, one foreground, one accent; or a hue the brand owns>. Note light **and** dark expectations if both matter.
> - **Typography intent:** <e.g. a serif display + grotesque body; a single variable family; mono-forward>. Name any non-negotiable family.
> - **Voice / tone:** <e.g. playful but professional; restrained-editorial; clinical-precise — 2–3 adjectives and one register to refuse>.
> - **Motion:** <restrained / expressive; any transition to refuse>.
> - **Hard constraints:** <e.g. typographic wordmark, no figurative logo; non-figurative avatar; Latin + Arabic, scripts never inline-mixed; refuse gradients / mesh blobs / generic icon sets / stock photos>.
```

### Section 4 — Attach checklist (the optional "examples")

Map this to the form's *"Provide examples of your design system and products (all optional)"* section. State plainly that every item is **optional**, but ≥1 real source improves extraction when available. Branch only on whether the project has code/assets:

```markdown
## Attach checklist — "Provide examples of your design system and products (all optional)"

All four are **optional**. You only need the blurb + notes to get started; providing sources gives Claude more to anchor on. Attach what genuinely exists — don't fabricate.

**If the project HAS frontend code or real brand assets:**
- [ ] **Link code on GitHub** — paste the repo URL (Claude reads components and styles; React component libraries are supported).
- [ ] **Link code from your computer** — drag a folder. Claude copies *selected* files, not the whole codebase; for a large repo, drag a **frontend-focused subfolder**.
- [ ] **Upload a .fig file** — Figma file (parsed locally in-browser; never uploaded).
- [ ] **Add fonts, logos and assets** — drag font files, logos, brand PDFs/PowerPoints, reference screenshots (Claude extracts colors, type, layout).

**If the project is pre-build / from scratch (no brand yet):**
- [ ] Skip the code attachments.
- [ ] Optionally add fonts, logos, a brand PDF, or inspiration screenshots to the "fonts, logos and assets" zone.
- [ ] Otherwise rely on the **Company name and blurb** + **Any other notes?** fields alone — accept that Claude has less to anchor on, and plan an extra review round.
```

### Section 5 — Review → Publish → (Remix to edit later)

The load-bearing close. The worksheet **must end** by telling the owner what to do with the generated system:

```markdown
## Review → Publish → (Remix later)

1. **Review the generated UI kit:** Claude produces a **color palette** (primary / secondary / accent), **typography** (families, sizes, weights), **components** (buttons, cards, navigation, reusable patterns), and **layout patterns** (spacing, grid, page structures). Check each against the notes you gave.
2. **Validate with a test project** — ask Claude for a simple landing page or dashboard and see whether the brand reads right. If extraction is weak, **add or swap source assets** and regenerate.
3. **Publish:** flip the **"Published"** toggle on. Once published, *any project created from the Claude Design homescreen while in this organization uses your design system instead of the default.* **Do not skip Publish — an unpublished system is not inherited**, and the deck (Phase 2b) silently falls back to Claude Design defaults.
4. **Edit later via Remix:** org settings → **"Open"** next to the design system → **"Remix"** opens a chat interface to modify it. Use this for refinements after publishing; you don't re-run the form.
```

### Section 6 — Notes on refining the extraction

Common refinement lines, framed as **Remix-chat** instructions (not form edits), for when the generated kit drifts:

```markdown
## Notes on refining

If the generated kit drifts, **Remix** it (or swap source assets and regenerate). Common fixes:

- **Palette inflated past intent** → *"Strip the palette to <N> colors: `<bg hex>` background, `<fg hex>` foreground, `<accent hex>` accent. No other hue. Provide dark-register equivalents."*
- **System fonts substituted for the named family** → *"The display family is **<Family>** [axes/weights]; body is **<Family>**. Re-import and restate the full stack, including <script> if multi-script."*
- **Generic-SaaS register** (most common) → *"This reads as tech-startup, not <intended register>. Specifically: [gradients / coloured shadows / generic icons / pill buttons]. Re-derive against the brand notes."*
- **A figurative logo appeared when the mark is typographic** → *"Remove the logo. The mark is typographic — <bare wordmark in Display Family>, no graphic element."*
```

## Conventions specific to this doc

- **No sentinels.** This is form input. `=== PROMPT ===` is reserved for chat prompts (deck, screens). Each field gets a clearly-labeled copy block instead.
- **One form, one branch.** Every project fills the same "Set up your design system" form. The only branch is the attach checklist (has-code/assets vs from-scratch). Don't author two parallel procedures.
- **Examples are optional, accurately.** The form marks all examples optional; say so. Add the documented nuance: ≥1 real source improves extraction when one exists.
- **Notes-length notes.** The *Any other notes?* block is a few sentences / tight bullets, not a spec. Don't transplant a full brand brief into it.
- **Publish is the terminal step; Remix is the edit path.** Both stated explicitly — an unpublished system is not inherited.
- **Opinionated on structure, neutral on content.** The field blocks are fixed shape; the owner supplies palette intent, type personality, register. Don't invent the brand for them.
- **Match the project's output language** in the field values (the system labels surface in the deck and screens).

## Anti-patterns

- **Wrapping the worksheet in `=== PROMPT ===`.** This is a form, not a chat prompt. Sentinels here mislead the reader into pasting form input into the chat.
- **Worksheet without the Publish close.** If it doesn't end at review → Publish (→ Remix to edit), the deck and screens inherit nothing and Phase 2b falls back to defaults.
- **Two parallel procedures.** The form is one path for both brand-exists and from-scratch; only the attach checklist branches.
- **An essay in "Any other notes?".** Keep it notes-length; the form field is not a brand spec.
- **Inventing brand substance.** The skill supplies the decision *shape*; the owner supplies palette intent, type personality, register.
- **Folding the deck into this file.** The deck is Phase 2b (`claude-design-prompt.md`). This file establishes the system only.
- **Inventing UI labels.** Only the documented affordances — the setup-form fields, "Published", automatic inheritance, "Remix" — are real. Don't add others.
