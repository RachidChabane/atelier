# Template: `docs/README.md`

Structural guide for the docs index. Write this first as a placeholder; revisit at the end of Stage 1 to make sure every doc has a one-line synopsis and the reading order is right.

## When to write

Always — the docs index is the entry point for any reader (the owner returning later, a collaborator joining, future-Claude resuming). Ship a placeholder version after Step 1 of the procedure; iterate as more docs land.

## Required structure

### Header

Two lines:

```markdown
**Purpose:** Index of every document in `/docs`, in reading order with a one-line synopsis. Start here.
**Status:** draft — last revised <DD-MM-YYYY>.
```

### Section 1 — How `/docs` is organized

One short paragraph naming:

- The audience (typically owner-only; client-facing artifacts called out separately).
- The project model in **one sentence** (paraphrase from `vision.md`).
- The conventions used (currency, date format, filename pattern).

Example shape:

```markdown
## How `/docs` is organized

This folder is **owner-only**. Clients never see it. Everything here is planning material for the project owner to make decisions against. The single client-facing artifact is the deck described in `claude-design-prompt.md`, which the owner generates separately via Claude Design when planning is settled.

**Project model in one line:** <one sentence describing what the project is and who it's for>.

All monetary values: **€ (EUR)**. All dates: **DD-MM-YYYY**. All filenames: kebab-case ASCII.
```

### Section 2 — Reading order

A pipe table with `# | File | One-line synopsis`:

```markdown
| # | File | One-line synopsis |
|---|---|---|
| 1 | [`vision.md`](vision.md) | What "good" looks like at MVP, 6 months, 18 months — measured signals. |
| 2 | [`<domain-doc>.md`](<domain-doc>.md) | The constraint that overrides every generic instinct. Read second. |
| 3 | [`user-requirements.md`](user-requirements.md) | Personas + numbered FRs with acceptance criteria. |
| 4 | [`roadmap.md`](roadmap.md) | MoSCoW with explicit MVP cut and named Won't list. |
| 5 | [`architecture-options.md`](architecture-options.md) | Option comparison + recommendation. (Skip when no real fork.) |
| 6 | [`open-questions.md`](open-questions.md) | Live log of unresolved decisions. |
| 7 | [`decisions/`](decisions/) | One file per accepted decision (`D-001-…`, `D-002-…`). |
```

Order docs by the order someone reading them cold should encounter them. Vision usually comes first; the dominant domain doc usually comes second (it constrains everything); requirements + roadmap come together; architecture-options when relevant; open-questions and decisions toward the end.

### Section 3 — Conventions

Bullet list pointing to the cross-cutting rules. Examples:

```markdown
## Conventions

- **Inline assumption markers.** Anywhere you see `**Assumption:** …` in a doc, the same assumption is also indexed in `open-questions.md` with an `[OQ-N]` tag.
- **Stable IDs.** `M-N` (Must), `S-N` (Should), `FR-X<n>` (Functional Requirement), `OQ-N` (Open Question), `D-NNN` (Decision). Never reused, never renumbered.
- **Doc headers.** Each doc starts with `**Purpose:** …` + `**Status:** draft | for review | approved`.
- **Currency.** `€1,234.56` (symbol prefix). Never USD.
- **Dates.** DD-MM-YYYY. Always absolute.
```

### Section 4 — What's still open (top of mind)

Three bullets pointing to the highest-impact entries from `open-questions.md`. Update as the OQ list shifts. This section is the elevator-pitch of "what's blocking the project right now."

```markdown
## What's still open

The blocking decisions before MVP work begins are tracked in `open-questions.md`. The top three at draft time:

1. **[OQ-3]** <one-sentence summary of the question>.
2. **[OQ-13]** <one-sentence summary>.
3. **[OQ-14]** <one-sentence summary>.

Recent resolutions:
- **[OQ-1]** <DD-MM-YYYY> — resolved by <decision>.
```

## Anti-patterns

- **Padding.** The README is structural, not narrative. Don't restate what's in `vision.md`.
- **Stale reading order.** Re-read the table at the end of Stage 1; if a domain doc was added partway through, it probably belongs second or third, not last.
- **Missing "what's still open."** The top blocking questions belong on the front page so readers don't have to dig.
