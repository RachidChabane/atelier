# Template: `docs/_deck-bundle/README.md`

Structural guide for the brand-bundle assembly notes the user follows before the deck conversation in Claude Design.

## When to write

Alongside `docs/claude-design-prompt.md`. The bundle is the asset payload uploaded to Claude Design *before* the prompt is sent; without the bundle, palette and typography drift to defaults.

## Required structure

### Top of file

A directory tree showing what the bundle contains:

```markdown
# <Project name> deck — step-by-step guide

Everything you need is already packed in this folder. **You only do three uploads** (one folder, one prompt-paste, one folder of attachments) and one export.

```
docs/_deck-bundle/
├── README.md                       ← you are here
├── 01-brand-system-upload/         ← Step 2 uses this whole folder
│   ├── 01-empty-state-light.png    ← <visual register reference>
│   ├── 02-empty-state-dark.png
│   ├── 03-<other-screenshot>.png
│   ├── design-tokens.css           ← canonical CSS tokens
│   ├── brand-spec.md               ← textual spec
│   └── fonts/                      ← all font families, .ttf / .otf
│       ├── <DisplayLatin>.ttf
│       ├── <BodyLatin>.ttf
│       ├── <DisplayArabic>.ttf     ← if applicable
│       ├── <BodyArabic>.ttf        ← if applicable
│       └── <Mono>.ttf
└── 02-deck-attachments/            ← Step 4 uses this whole folder
    ├── PROMPT.md                   ← copy contents into chat
    ├── <data-file-1>.xlsx          ← drives slide N's figures
    └── <data-file-2>.xlsx          ← drives slide N's figures
```

Total time, end-to-end: ~60–90 minutes (most of it in Step 5 iteration).
```

### Step 0 — Prerequisites

Active Claude Pro / Max / Team / Enterprise subscription. Browser. Local copy of the bundle folder.

### Step 1 — Open Claude Design

Navigate to claude.ai/design. Pick / create org. Complete onboarding flow.

### Step 2 — Upload the brand system

The procedure for the design-system upload:

1. Drag screenshots + brand-spec.md to the "fonts, logos, assets" zone.
2. Drag font files (all of them) to the same zone.
3. Drop design-tokens.css into "Link code from your computer."
4. Wait for extraction (2–5 minutes).
5. Review the extracted UI kit.
6. Refine if anything is wrong (palette, typography swaps).
7. Flip "Published" on so future projects inherit the brand.

Document common refinement lines specific to the project's brand:

```markdown
**Refinements you might need:**
- If <Display Family> is missing or replaced by a generic serif: *"The display latin font must be **<Display Family>** [variable axes spec], weights 400 and 600 only. Re-import from Google Fonts."*
- If Arabic fonts are missing: *"Add **<Arabic Display>** as Arabic display font and **<Arabic Body>** as Arabic body font."*
- If a fourth color appeared: *"Strip the palette down to three colors total: `<bg hex>` background, `<fg hex>` foreground, `<accent hex>` accent. No other color — no green, red, or blue."*
```

### Step 3 — Create the deck project

Pick "Slide deck" project type; select the brand system; pick "High fidelity" (not Wireframe).

### Step 4 — Send the prompt

Open `02-deck-attachments/PROMPT.md`, copy contents, paste into the Claude Design chat. Attach the supporting files (spreadsheets, datasets) via the paperclip. Send. First-pass takes 30–90 seconds.

### Step 5 — Iterate

Document the four iteration tools:

```markdown
| Tool | Use it for | How |
|---|---|---|
| Chat (left panel) | Big structural changes — slide rewrite, reorder, add/remove. | Type a sentence and send. |
| Inline comment | Targeted fix on one element. | Click the element, type a comment. |
| Direct text edit | Typo fixes, small wording. | Click into a text element and type. |
| Adjustment knobs | Spacing, color, scale tweaks. | Use sliders, then *"apply across all slides."* |
```

Then list the project-specific pushback lines (drawn from `claude-design-prompt.md` § "Notes on iterating") so the user has them ready to paste.

### Step 6 — Export

Click Export (upper-right corner). Choose PDF for distribution. PPTX or HTML available alternatives.

### Step 7 — Soundness check before sending

Share the PDF with one trusted member of the audience first. Their first reaction catches framing missteps the author can no longer see.

### Troubleshooting

A short list of common issues + fixes:

```markdown
## Troubleshooting

- **"Where's the palette icon in the sidebar?"** It's in the left rail of claude.ai. If missing, your account may not have access yet — confirm subscription and refresh.
- **"Claude generated the deck in <wrong language>."** First-pass language drift. Reply: *"Regenerate the entire deck in <intended language>. Output language is <language> — non-negotiable."*
- **"Speaker notes are missing."** Reply: *"Add speaker notes to every slide. Max 80 words per slide. <Language>. Notes anticipate <audience> pushback, they don't summarize what's already on the slide."*
- **"Export to PDF cuts off the right edge."** Reply: *"Switch to a 16:9 export profile sized for <paper size> landscape, with 8mm margins. Re-export."*
```

## Conventions specific to this doc

- **Step-by-step numbered.** Steps 0–7. Each step's title is action-oriented ("Open Claude Design", "Upload the brand system", not "Setup", "Brand").
- **Plain-language commentary.** This is the most user-facing artifact in `docs/`; tone is operational, not editorial.
- **Refinement lines pre-loaded.** The user shouldn't have to compose pushback during the iteration; the file has it ready.

## Anti-patterns

- **Reference to Stage 1 IDs.** This doc is a how-to-use-Claude-Design guide; cross-references to `M-N` / `FR-X<n>` belong in `claude-design-prompt.md`, not here.
- **Missing troubleshooting.** First-time Claude Design users hit the same handful of issues; pre-loading them saves time.
