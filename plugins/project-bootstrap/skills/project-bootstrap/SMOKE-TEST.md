# SMOKE-TEST.md — `project-bootstrap` skill

Smoke test result for the `project-bootstrap` skill. Documents what was checked and what was *not* checked.

## What this is

A reading-and-walk-through verification, not an end-to-end automated test. The skill is a conversation driver; "passing" means the SKILL.md prompt body is internally consistent, references resolve, conventions are encoded, and the artifacts the skill describes producing match the reference pattern.

## Date and version

- **Date:** 2026-05-04 (re-verified 2026-06-01 for v0.2.0 — Stage-2 rebuilt around Claude Design's form-based, publish-and-inherit model; 2026-06-02 for v0.2.1 — Stage-2 font-files-must-be-uploaded fix)
- **Marketplace:** `atelier` v0.1.0
- **Plugin:** `project-bootstrap` v0.2.1
- **Skill:** `project-bootstrap` v0.2.1
- **Reference project:** the source pattern is a real Stage-1 application the author bootstrapped before encoding the workflow as a skill (annotated in `references/example-walkthrough.md`)

## Mechanical checks (passed)

| Check | Result |
|---|---|
| Every `templates/...` path referenced in `SKILL.md` resolves to an existing file (16 paths) | OK |
| Every `references/...` path referenced in `SKILL.md` resolves to an existing file (3 paths) | OK |
| No orphan templates (every template file is referenced) | OK |
| `marketplace.json` parses as valid JSON (`jq .`) | OK |
| `plugin.json` parses as valid JSON (`jq .`) | OK |
| `SKILL.md` word count in target band (1500–2500) | 2089 words — OK |
| `SKILL.md` frontmatter has `name` and `description` | OK |
| `SKILL.md` description uses third-person ("This skill should be used when…") | OK |
| `SKILL.md` body uses imperative form ("Drive the conversation…", not "You should…") | OK |
| `marketplace.json` lists `project-bootstrap` plugin with `source: "./plugins/project-bootstrap"` | OK |
| `/plugin marketplace add RachidChabane/atelier` syntax — bare `owner/repo` shorthand is the documented form (per `code.claude.com/docs/en/plugin-marketplaces`) | OK |

## Walk-through verification

Pretend invocation against an empty test directory (`/tmp/atelier-smoke-test/`, `docs/` does not exist).

### Trigger match

Trigger phrases in the description (`"bootstrap a project"`, `"set up planning docs"`, `"scaffold vision and roadmap"`, `"kick off a new project"`, `"lay the foundation for a project"`, `"set up the docs folder"`) are concrete and would match common user phrasings. The description also names the resume condition (`docs/` is empty, partial, or otherwise needs the foundation slate) so the skill triggers in re-invocation cases too.

### Step-by-step walk

Walking the procedure in `SKILL.md`:

1. **Resume detection.** SKILL.md instructs to list `docs/` and read each artifact's `**Status:**` header. In the empty-dir case, the procedure routes to "start at the top of the procedure." ✓
2. **Step 0 — Brief intake.** Three intake questions (one-sentence what, fresh-or-existing-code, currency+date). Compact, no over-asking. ✓
3. **Step 1 — `docs/README.md` (placeholder).** Templates → `templates/stage-1-foundation/readme.md` resolves. The template specifies header pattern, "How `/docs` is organized" section, reading-order table, conventions section, "what's still open" section. Matches reference project pattern. ✓
4. **Step 2 — `docs/vision.md`.** Template specifies the section sequence (one-sentence product → why-good-looks-different → quality-directive-implications when applicable → 6-month gates → 18-month gates → anti-scope → MVP cut → top-three-risks). Push-back hooks named (hedged sentences, untestable signals, anti-scope inflation). Matches reference. ✓
5. **Step 3 — `docs/roadmap.md`.** MoSCoW with stable IDs (`M-N`, `S-N`, `C-N`); effort tags (S/M/L/XL) defined; sub-letter rule (`M-22a, M-22b`) documented; risk-to-feature mapping enforced. Matches reference. ✓
6. **Step 4 — `docs/user-requirements.md`.** Personas with internal labels (`P1, P2, P3`); FRs grouped by letter (`A`, `B`, `C`, `D`, `E`, `F`, `G`); each FR has acceptance line; NFRs contiguous-numbered; non-requirements section. Matches reference. ✓
7. **Step 5 — `docs/architecture-options.md` (conditional).** Skip when no real fork; write when there is. Discriminating axes named *first*; each option ends with a single tradeoff; side-by-side summary; recommendation; contingency-plan section. Matches reference. ✓
8. **Step 6 — `docs/open-questions.md`.** Live log with `[OQ-N]` IDs cross-referenced from inline `**Assumption:** …` markers; resolved entries kept with date. Matches reference. ✓
9. **Step 7 — Domain-specific docs.** Asks the user what concerns deserve their own document; doesn't pre-name. Matches reference (the reference project has 3 domain docs that emerged from its specific nature). ✓
10. **Step 8 — `docs/existing-code-survey.md`.** Conditional on scaffolding atop existing code. File-by-file disposition table with vocabulary `Keep / Keep + extend / Refactor / Discard` + cited justification. Matches reference. ✓
11. **Step 9 — `docs/decisions/D-NNN-<slug>.md`.** ~150-word records with Decision / Why / Consequences / What we did NOT pick. Matches reference's 7 decision records (`D-001`…`D-007`). ✓
12. **Step 10 — Re-read `docs/README.md`.** Revisit synopsis-per-doc, reading order, top blocking questions. Matches reference. ✓
13. **Step 11 — Hand-offs for Stages 2–5.** Conditional drops only what the user wants. Templates exist for: Stage 2 — design-system-first, two ordered phases (`design-system-setup.md` for Phase 2a + `claude-design-prompt.md` for Phase 2b + `_deck-bundle/README.md`), Stage 3 (`app-ia.md`), Stage 4 (`app-design-prompt.md`), Stage 5 (`persona.md` + `tasks-yaml-handoff.md`). The **chat-prompt** templates (deck, screens) use the `=== PROMPT ===` / `=== END PROMPT ===` shape (one extractable block per file); the Phase-2a `design-system-setup.md` is a **form worksheet** (labeled copy blocks, no sentinels) because Claude Design's design system is created via a setup form, not a chat prompt. Matches reference. ✓

### Conventions encoded

The conventions enforced by the skill (per SKILL.md § "Conventions enforced" + `references/conventions.md`):

- Stable IDs with the never-renumber rule, sub-letter rule, group-letter assignment ✓
- MoSCoW with explicit MVP cut and named Won't list ✓
- Doc headers (`**Purpose:** …` + `**Status:** …`) ✓
- Inline `**Assumption:** … [OQ-N]` markers ✓
- Cross-document references by ID, not paraphrase ✓
- Sentinels (`=== PROMPT ===`) for external-tool prompts ✓
- Filenames: kebab-case ASCII lowercase ✓
- Currency / dates / units confirmed at intake and recorded in `docs/README.md` ✓
- Decision records as standalone files in `docs/decisions/` ✓

### Coverage match against the reference pattern

The reference project's `docs/` slate (per `references/example-walkthrough.md`):

| Reference artifact | Skill produces it? |
|---|---|
| `docs/README.md` | Yes (Step 1, Step 10) |
| `docs/vision.md` | Yes (Step 2) |
| `docs/roadmap.md` | Yes (Step 3) |
| `docs/user-requirements.md` | Yes (Step 4) |
| `docs/architecture-options.md` | Yes when there's a fork (Step 5) |
| `docs/open-questions.md` | Yes (Step 6) |
| `docs/<domain-doc>.md` × N | Yes (Step 7) — emerges from conversation, not pre-named |
| `docs/existing-code-survey.md` | Yes when atop existing code (Step 8) |
| `docs/decisions/D-NNN-*.md` | Yes (Step 9) |
| `docs/design-system-setup.md` (Stage 2, Phase 2a) | Yes as hand-off scaffold (Step 11) |
| `docs/claude-design-prompt.md` (Stage 2, Phase 2b) | Yes as hand-off scaffold (Step 11) |
| `docs/_deck-bundle/README.md` (Stage 2) | Yes as hand-off scaffold (Step 11) |
| `docs/app-ia.md` (Stage 3) | Yes as hand-off scaffold (Step 11) |
| `docs/app-design-prompt.md` (Stage 4) | Yes as hand-off scaffold (Step 11) |
| `docs/persona.md` (Stage 5) | Yes as hand-off scaffold (Step 11) |

## What this smoke test did NOT verify

Listed honestly:

1. **No live invocation.** The skill has not been installed and run against a real test repository. The first real-machine invocation is the *actual* smoke test; this document is a reading verification.
2. **Conversation quality not measured.** Whether the conversation Claude drives produces *good* foundation docs depends on Claude's behavior at runtime. The skill encodes structure and pushes back on common failure modes, but the substance comes from the user.
3. **`/plugin marketplace add RachidChabane/atelier` not test-installed.** The bare `owner/repo` syntax is documented as supported, but the actual install flow hasn't been exercised in this session. Run on first real-machine use.
4. **Resume detection on a partially-populated `docs/`** not test-walked. The procedure documents the decision tree (empty → start at top; some drafts → ask which to resume; all approved → offer Stage 2; PLAN.md exists → ingest). The decision tree is internally consistent; behavior on edge cases (e.g., `docs/` exists but every artifact's status is missing or malformed) will surface in real use.
5. **Stage 2–5 hand-off completeness.** The templates exist and the conventions match the reference project, but the Stage 2–5 scaffolds haven't been driven end-to-end (because the skill doesn't drive them — it scaffolds and points at the downstream tool). True validation comes from running each subsequent stage's tool against the scaffold this skill drops.

## Sign-off

Mechanical checks pass. Walk-through verification confirms the skill structure, conventions, and artifact coverage match the reference pattern. First real-machine invocation will surface anything else.
