# Template: `docs/_deck-bundle/README.md`

Structural guide for the operational step-by-step the user follows in Claude Design for **all of Stage 2** — first creating and **Publishing** the design system through the **setup form** (Phase 2a), then generating the pitch deck as a project that **inherits** it (Phase 2b).

## When to write

Alongside `docs/design-system-setup.md` (the Phase-2a form worksheet) and `docs/claude-design-prompt.md` (the Phase-2b deck chat prompt). This README is the operational spine that sequences the two phases; those two files hold, respectively, the copy-paste form values and the paste-ready deck prompt.

## The ordering this file enforces (non-negotiable)

1. **Phase 2a — create & Publish the design system via the setup form.** Open the org picker → fill "Set up your design system" → review the generated UI kit → **flip "Published" on.**
2. **Phase 2b — create the deck project (conversationally) that inherits the published system**, send the deck prompt, attach data, iterate, export.

The single most important thing this file must make unmistakable: **the design system is set up through the form and Published once, before the deck; the deck project then inherits it automatically.** A user who skips Publish gets a deck on Claude Design defaults.

## Required structure

### Top of file

A directory tree showing what the local bundle contains. The **design system is created and published inside Claude Design via the form, not stored in this folder** — the folder holds optional source assets you'll *drag into the form*, and the deck's data attachments:

```markdown
# <Project name> — Stage 2 step-by-step guide (design system, then deck)

Stage 2 has two phases. **Phase 2a** creates your design system through Claude Design's **setup form** and **Publishes** it. **Phase 2b** creates the deck, which inherits that published system automatically. Do them in that order.

```
docs/
├── design-system-setup.md              ← Phase 2a: the FORM worksheet (copy values into the form)
├── claude-design-prompt.md             ← Phase 2b: the deck CHAT prompt (paste into the deck project)
└── _deck-bundle/
    ├── README.md                       ← you are here
    ├── 01-design-system-sources/       ← Phase 2a: assets to drag into the setup form
    │   ├── 01-reference-light.png      ← <visual reference screenshot, if any>
    │   ├── 02-reference-dark.png
    │   ├── brand.pdf                   ← brand PDF / deck, if any
    │   └── fonts/                      ← brand fonts — REQUIRED if the system pins typefaces
    │       ├── <DisplayFamily>-VF.ttf  ← full/variable TTF/OTF: all weights, full charset
    │       ├── <BodyFamily>-VF.ttf     ←   (NOT the build pipeline's subsetted .woff2 fragments)
    │       ├── <Mono>-VF.ttf
    │       └── OFL.txt                 ← license file for any open-source (SIL OFL) font
    └── 02-deck-attachments/            ← Phase 2b: the deck's data files
        ├── <data-file-1>.xlsx          ← drives slide N's figures
        └── <data-file-2>.xlsx          ← drives slide N's figures
```

`design-system-setup.md` and `claude-design-prompt.md` live at the `docs/` top level (siblings of `_deck-bundle/`). The deck prompt's `awk` extractor reads `docs/claude-design-prompt.md`; `design-system-setup.md` is a worksheet — nothing to extract from it.

**Most of `01-design-system-sources/` is optional — fonts are the exception.** The form accepts code links, a Figma `.fig`, and fonts/logos/assets, all *labeled* optional; you can seed the brand from the worksheet's text fields alone, and ≥1 real source improves extraction. **But if your design system pins specific typefaces, the font *files* must be uploaded** — naming a typeface in text does not import it (Claude substitutes web fonts and warns "Missing brand fonts"). A from-scratch project that names no specific family can leave this folder empty.

Total time, end-to-end: ~75–110 minutes (most of it in Phase 2b iteration).
```

### Step 0 — Prerequisites

Active Claude Pro / Max / Team / Enterprise subscription (on Enterprise, Claude Design is admin-enabled and off by default). Browser. **Admin permissions** on the organization (design systems are org-scoped and set up by an admin). The `design-system-setup.md` worksheet and `vision.md` at hand.

### Step 1 — Open Claude Design and the design-system setup

```markdown
1. Go to claude.ai/design.
2. Open the **organization picker in the lower-left corner**. Select or create the organization the deck and screens will live under — the design system is published **per organization**, so this must be the right one.
3. Start that organization's design-system onboarding ("Set up your design system"). This needs **admin permissions**.
```

### Step 2 — Phase 2a: Fill the form, review, and Publish

**This is the load-bearing step. Do not skip Publish.** It is **one form for every project** — the only branch is which optional sources you attach.

```markdown
#### Fill the form (from `design-system-setup.md`)

1. **"Company name and blurb (or name of design system)"** — paste the *Company name and blurb* block from `design-system-setup.md`.
2. **"Provide examples of your design system and products (all optional)"** — work the attach checklist:
   - **Link code on GitHub** — paste the repo URL. *(optional)*
   - **Link code from your computer** — drag a folder, a frontend subfolder for a large repo. *(optional)*
   - **Upload a .fig file** — drag a Figma file. *(optional)*
   - **Add fonts, logos and assets** — drag logos, brand PDF, and reference screenshots *(optional)* **— and the brand font files, which are NOT optional when the system pins typefaces.** Upload the **full/variable `.ttf`/`.otf`** from `01-design-system-sources/fonts/` (all weights, full charset). Do not upload the build pipeline's subsetted `.woff2` fragments — they're incomplete.
   If the project is from scratch and names no specific typeface, skip the code attachments and rely on the text fields (optionally add inspiration assets).
3. **"Any other notes?"** — paste the *Any other notes?* block from `design-system-setup.md`.
4. **Upload the brand fonts — do NOT skip this when you pinned typefaces.** In the "Add fonts, logos and assets" zone, upload the **full/variable `.ttf`/`.otf`** binaries (not the build pipeline's subsetted `.woff2` fragments). Naming the family in the notes field is not enough — without the binaries Claude renders substitutes and shows a **"Missing brand fonts"** warning. If you see that warning, use its **"Upload fonts"** button and confirm the typography renders in the real faces before moving on.
5. Submit. Claude generates a UI kit: **color palette** (primary/secondary/accent), **typography** (families/sizes/weights), **components** (buttons, cards, navigation), **layout patterns** (spacing, grid, page structures).

#### Review, refine, Publish

6. **Review** the generated kit against your notes — including that the typography is rendering in your actual fonts, not substitutes.
7. **Validate** with a throwaway test project (ask Claude for a landing page or dashboard) to see the brand in use. If extraction is weak, **add or swap source assets** and regenerate.
8. **Flip "Published" on.** This makes it the organization's design system; every project you create afterward inherits it automatically.
9. **To edit later:** org settings → **"Open"** next to the design system → **"Remix"** opens a chat to modify it. You don't re-run the form for tweaks.
```

Document common refinement lines specific to the project's brand (these go into **Remix chat** after publishing, or into the form's notes before):

```markdown
**Refinements you might need:**
- If <Display Family> is missing or replaced by a generic serif: **upload the font file** — don't ask Claude to "re-import" it. It can't fetch fonts by name; upload the full/variable `<Display Family>.ttf` (weights 400 & 600 at minimum) via *Add fonts, logos and assets* / the "Upload fonts" button, then in chat: *"Use the uploaded **<Display Family>** for display; weights 400 and 600 only."*
- If <script> fonts are missing: **upload them** — drag the `<Script Display>` and `<Script Body>` font files, then in chat: *"Use uploaded **<Script Display>** as <script> display and **<Script Body>** as <script> body."* (A named-but-not-uploaded script font is the usual cause of missing diacritics.)
- If a fourth color appeared: *"Strip the palette to three colors total: `<bg hex>` background, `<fg hex>` foreground, `<accent hex>` accent. No other color. Provide the dark-register equivalents."*
```

### Step 3 — Phase 2b: Create the deck project (it inherits the published system)

```markdown
From the Claude Design homescreen, **create a new project inside the same organization**. Project creation is **conversational — there is no "project type" picker.** You describe the deck in chat; the prompt in `claude-design-prompt.md` is that description. Because the design system is Published, the new project **inherits the palette, fonts, and components automatically — you do not re-upload brand assets.** If the inherited brand isn't showing once you start, the system isn't Published — go back to Step 2.
```

### Step 4 — Send the deck prompt

Open `docs/claude-design-prompt.md` (one level up from this README), copy the body between the `=== PROMPT ===` markers, and send it as the new project's first message. Attach the supporting files from `02-deck-attachments/` (spreadsheets, datasets) alongside it. First pass takes 30–90 seconds.

### Step 5 — Iterate

Document the **two** official iteration tools (do not invent others):

```markdown
| Tool | Use it for | How |
|---|---|---|
| Chat (left panel) | Broad changes affecting the overall design — slide rewrite, reorder, add/remove, palette/typography corrections. | Type a sentence and send. |
| Inline comments | A targeted change on one specific element on the canvas. | Click the element, request the change. |
```

Then list the project-specific pushback lines (drawn from `claude-design-prompt.md` § "Notes on iterating") so the user has them ready. If the deck's palette or fonts drift, the fix points back at the published system: *"Use the published design system's palette and typography — don't substitute."*

### Step 6 — Export

```markdown
Open the **Export** menu. Options: **Download as .zip · Export as PDF · Export as PPTX · Send to Canva · Export as standalone HTML · Handoff to Claude Code**.
- **Interactive deck** → **standalone HTML** preserves interactivity best.
- **Static hand-out** → **PDF** (or **PPTX** to keep editing in PowerPoint / Canva).
```

### Step 7 — Soundness check before sending

Share the export with one trusted member of the audience first. Their first reaction catches framing missteps the author can no longer see.

### Troubleshooting

```markdown
## Troubleshooting

- **"The deck isn't using my brand."** The design system isn't Published, or the deck project was created outside the org that owns it. Confirm "Published" is on (Step 2) and create the deck from the homescreen of the same organization (Step 3).
- **"'Missing brand fonts' / typography looks like substitute web fonts."** The font binaries were never uploaded — naming the font in text does not import it. Use **"Add fonts, logos and assets"** (or the warning's **"Upload fonts"** button) to upload the actual **full/variable `.ttf`/`.otf`** files; do not use build-pipeline subsetted `.woff2` fragments (incomplete weights/glyphs). Then re-check the typography.
- **"I can't find the design-system setup."** It's reached from the **organization picker in the lower-left**. Setup needs **admin permissions**; if you don't see it, you may not be an org admin (or, on Enterprise, Claude Design may not be enabled for your org yet).
- **"Claude generated the deck in <wrong language>."** First-pass language drift. Reply in chat: *"Regenerate the entire deck in <intended language>. Output language is <language> — non-negotiable."*
- **"Speaker notes are missing."** Reply: *"Add speaker notes to every slide. Max 80 words per slide. <Language>. Notes anticipate <audience> pushback; they don't summarize the slide."*
- **"Export to PDF cuts off the right edge."** Reply: *"Switch to a 16:9 export profile sized for <paper size> landscape, with 8mm margins. Re-export."*
```

## Conventions specific to this doc

- **Phase order is the spine.** Phase 2a (create + Publish design system via the form) strictly before Phase 2b (deck). Every step title is action-oriented.
- **Form, not prompt, in Phase 2a.** The design system is created by filling a form and dragging files, not by pasting a `=== PROMPT ===` block. Say so; the only `=== PROMPT ===` paste in Stage 2 is the deck (Phase 2b).
- **Publish is non-optional; Remix is the edit path.** Step 2 ends on Publish for the single form path; Step 3 tells the user to verify inheritance before sending the deck prompt.
- **Two iteration tools only.** Chat and Inline comments are the documented tools — don't assert direct-text-edit, adjustment knobs, or other editors.
- **Plain-language commentary.** This is the most user-facing artifact in `docs/`; tone is operational, not editorial.

## Anti-patterns

- **Deck-first ordering.** If the deck is created before the design system is Published, it renders on defaults. Phase 2a always precedes Phase 2b.
- **Treating Phase 2a as a chat prompt.** It's a form. The optional sources are *dragged into the form*, not pasted into chat.
- **Treating the brand sources as mandatory — except fonts.** Code, `.fig`, logos, and screenshots are optional; a from-scratch project seeds from the text fields. But when the brand pins specific typefaces, the **font files are required** (naming them in text triggers substitution + a "Missing brand fonts" warning). Don't force the optional uploads; don't let the font upload be skipped.
- **Pointing at build-pipeline font subsets.** Subsetted, content-hashed, per-unicode-range single-weight `.woff2` files are incomplete. Upload the canonical full/variable `.ttf`/`.otf`.
- **Asserting unverified UI affordances.** Only the documented ones — the setup-form fields, "Published", automatic inheritance, "Remix", Chat + Inline comments, the Export menu options — are real. No "High fidelity" picker, no "adjustment knobs", no "direct text edit".
- **Reference to Stage 1 IDs.** This doc is a how-to-use-Claude-Design guide; cross-references to `M-N` / `FR-X<n>` belong in the prompt files, not here.
- **Missing troubleshooting.** First-time Claude Design users hit the same handful of issues; pre-loading them saves time.
