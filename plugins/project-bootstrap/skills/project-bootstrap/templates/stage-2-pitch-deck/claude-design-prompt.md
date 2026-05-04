# Template: `docs/claude-design-prompt.md`

Structural guide for the pitch-deck prompt that will be pasted into Claude Design (claude.ai/design). The deck is the only client-facing artifact in `docs/`; everything else is owner-only.

## When to write

After Stage 1 is approved (or close), and the owner wants to pitch the project externally — to early users, collaborators, prospective contributors. Skip when the project has no external audience.

## Authoring discipline

The prompt is **paste-ready** — bracketed by `=== PROMPT ===` / `=== END PROMPT ===` sentinels so it can be `awk`-extracted. Above the sentinels: a "How to use this file" preamble.

## Required structure of the file

### Header

```markdown
**Purpose:** A self-contained prompt the owner can paste into Claude Design (claude.ai's design generation tool) to produce the client-facing deck. This is the **only** client-facing artifact in the project; everything else in `/docs` is owner-only.
**Status:** draft.
```

### Section 1 — How to use this file

A numbered list of pre-paste checks and the paste flow:

```markdown
## How to use this file

1. Confirm <data file 1, e.g., cost numbers in `costs.xlsx`> is current.
2. Confirm <architecture / scope choice from Stage 1> is still the path you intend to ship.
3. Confirm the deck-facing <product name> is the one you want.
4. Copy everything between the `=== PROMPT ===` markers below into Claude Design.
5. Iterate on the slides. Plan 2–4 revision rounds. The first pass will almost always need a de-jargon round.

The block below is **the prompt itself**, written in <output language> for direct paste. Claude Design will produce a <language> deck.
```

### Section 2 — The prompt block

Bracketed by sentinels:

```markdown
---

```
=== PROMPT ===

[the paste-ready prompt body]

=== END PROMPT ===
```
```

(Use a triple-backtick fenced code block enclosing the sentinels and the body.)

The prompt body itself follows this internal structure:

#### Block A — What the project is, in two sentences

Paraphrase from `vision.md` § "What this product is, in one sentence." Two sentences max, the first naming the product, the second naming what makes it not a generic instance of its category.

#### Block B — Audience

Two paragraphs. First: who the deck is for (the audience the owner is pitching to). Second: what decision the audience must take after reading.

#### Block C — Tone and vocabulary

Banned vocabulary list (terms that must not appear in any slide) + paraphrase substitutions. Pattern from prior projects:

```markdown
**Termes techniques à bannir** (et leurs paraphrases) :
- BM25 → *recherche par mots exacts*
- vecteur / embedding → *recherche par sens*
- LLM → *modèle d'IA*
- API / endpoint → omettre ; au pire *fournisseur de modèles d'IA*
- ...

**Termes <domain> à garder intacts** (le public les connaît) : *<domain term 1>, <domain term 2>, ...*. Italiques systématiques.

**Quand un terme étranger au domaine est inévitable** (ex. "OCR"), l'expliquer une seule fois, en moins de six mots, en note ou entre parenthèses.
```

The banned vocabulary is project-specific — pick what the audience would *not* understand.

#### Block D — Narrative arc

Numbered list of slides (~16-18 total). Each slide has a 1-paragraph spec naming the content, the visual treatment, and any slide-specific constraints. Reference Stage 1 IDs explicitly:

```markdown
1. **Cover.** [content, typography, visual treatment].
2. **The problem.** [content tying back to vision.md § risks].
3. **What "good" looks like.** [content paraphrased from vision.md § "Why good looks different here"].
4. **Why generic <category> fails here.** [a concrete example].
5. **The product, from the user's perspective.** [3 screenshots described in detail; cite app-ia.md screen specs when they exist].
6. **<Quality demonstration slide>.** [side-by-side examples].
7. **<N> commitments.** [the FR-D / FR-G items reframed as commitments].
8. **<Differentiation feature 1>.** [tied to roadmap M-N].
...
N. **Cost slides** (build cost block + recurring cost block per tier).
N+1. **Per-user cost** (usage profile × tier matrix).
N+2. **Roadmap.** [3 horizons: MVP / 6 months / 18 months — paraphrased from vision.md].
N+3. **Risks, named honestly.** [from vision.md § Top three risks].
N+4. **The ask.** [what the audience is asked to commit to].
17. **Q & A.** [optional].
```

#### Block E — Visual direction

Reference the brand bundle uploaded separately; do not redefine palette and typography from scratch. Spell out:

- Palette (colors with hex codes, light/dark register)
- Typography stack (display latin, body latin, body Arabic if applicable, mono — by family + weight + opsz)
- Brand mark treatment (typographic glyph, not a logo)
- Anti-patterns to refuse explicitly (gradients, mesh blobs, generic icon sets, stock photos, skeuomorphic chrome — adapt to the visual register)
- Layout density expectations

#### Block F — Concrete data to surface

A table mapping data points (numbers, dates, names) to the slides where they appear:

```markdown
| Chiffre | Où l'utiliser |
|---|---|
| <data point 1> | Slide N |
| <data point 2> | Slide N |
```

#### Block G — Output format

Tell Claude Design the output format: total slide count, deck language, slide aspect ratio, export format expectations.

### Section 3 — Notes on iterating

Common rejection lines the owner can paste back into chat when Claude Design drifts. Pattern from prior projects:

```markdown
## Notes on iterating

The first pass will need at least 2 rounds. Below are the rejection lines most likely to be useful, in the order Claude Design tends to drift.

### Pushback A — jargon snuck back in (most common)

> Slide N is using technical jargon. Rewrite without "<term 1>", "<term 2>", "<term 3>". Refer to the *Tone and vocabulary* section. The audience is <audience>; every commitment must read as a claim a <persona> can evaluate, not as engineering documentation.

### Pushback B — fonts swapped for system fonts

> You substituted system fonts for <Display Family>, <Arabic family if any>. Restore the specified families. <Family 1> is the display latin (titles, key figures). <Family 2> is body only. ...

### Pushback C — a logo appeared

> Remove the logo. The brand is typographic. Cover slide is <bare wordmark in Display Family> at full size — no graphic element.

### Pushback D — generic SaaS register

> The visual register is reading as tech-startup, not <intended register>. Specifically: [name the issue — gradients, coloured shadows, generic icons, full-width amber buttons, etc.]. Refer to the *Direction visuelle* section.
```

## Conventions specific to this doc

- **Sentinels.** `=== PROMPT ===` / `=== END PROMPT ===` exactly as written, with no surrounding whitespace inside the code block, so `awk '/^=== PROMPT ===$/{flag=1; next} /^=== END PROMPT ===$/{flag=0} flag' docs/claude-design-prompt.md` extracts the bare prompt body.
- **Prompt body language.** Match the deck's intended output language. If the deck is in French, the prompt is in French.
- **Cross-references to Stage 1.** Slide specs reference Stage 1 IDs (`M-N`, `FR-X<n>`) so the deck and the planning docs stay synchronized.

## Anti-patterns

- **Prompt without sentinels.** Hard to extract; users end up copy-pasting the wrong block.
- **Prompt that re-derives palette from scratch.** Redundant with the brand bundle uploaded to Claude Design separately.
- **Slide count > 20.** Padded; cut.
- **Missing "Notes on iterating."** First-pass output always needs pushback; pre-loading rejection lines saves the owner 30 minutes.
