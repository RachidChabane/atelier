# Conventions reference

Full convention list for the artifacts produced by `project-bootstrap`. Load when writing any file that carries cross-document references.

These conventions exist for one reason: **so that references survive doc rewrites.** A roadmap line that says "blocks `M-22b`" still points to the right thing even after `roadmap.md` has been restructured three times — provided `M-22b` was never reused for something else.

## Stable IDs

Once assigned, an ID is **never reused, never renumbered, never reclaimed.** If a Must item is dropped, its ID stays retired (and a one-line note in the changelog or in `roadmap.md` says so). When you add a new item to a list, you give it the next free number.

| Family | Pattern | Where it lives | Examples |
|---|---|---|---|
| Must | `M-N` (1-indexed) | `roadmap.md` § Must | `M-1`, `M-22b` (sub-letter when sub-tasking) |
| Should | `S-N` | `roadmap.md` § Should | `S-1`, `S-18` |
| Could | `C-N` | `roadmap.md` § Could | `C-1`, `C-13` |
| Won't | `W-N` | `roadmap.md` § Won't | `W-1` (rare; usually inline prose) |
| Functional Requirement | `FR-X<n>` | `user-requirements.md` § Group X | `FR-A1`, `FR-D11` |
| Non-Functional Req | `NFR-N` | `user-requirements.md` § Non-functional | `NFR-1`, `NFR-13` |
| Open Question | `OQ-N` | `open-questions.md` | `OQ-3`, `OQ-25` |
| Decision record | `D-NNN` (zero-padded) | `docs/decisions/D-NNN-slug.md` | `D-001`, `D-007` |
| Persona | `P-N` | `user-requirements.md` § Personas | `P-1`, `P-2`, `P-3` |

**Sub-letters for late-arriving tasks.** When a Must item gets sub-tasked after the fact (e.g., the original `M-22` becomes a parent of more granular work), use `M-22a, M-22b, M-22c` rather than renumbering everything that came after. The `M-22` parent stays as a heading.

**Group letters for FRs.** Common groupings:

- `A` — authentication and account
- `B` — core entity (the project's primary domain object: KB, document, project, conversation, …)
- `C` — ingestion / curation / authoring
- `D` — the core surface (the main user-facing flow)
- `E` — secondary surfaces (history, settings, etc.)
- `F` — owner-only / admin utilities
- `G` — preferences / memory / personalization

Decide letter assignment in conversation based on the project's actual surface areas. Don't force a project into letters it doesn't have.

## Document headers

Every doc in `docs/` starts with a 2-line header:

```markdown
**Purpose:** What this doc is for, in one sentence. Who reads it.
**Status:** draft | for review | approved
```

Status values:

- `draft` — being written or actively iterated; expect breaking changes
- `for review` — author thinks it's ready; awaiting owner sign-off
- `approved` — locked; changes require a new decision record

Update the status line when status changes; carry the date inline if useful (`**Status:** draft — last revised 2026-04-25`).

## Inline assumption markers

When a doc makes a load-bearing assumption that hasn't been validated, mark it inline:

```markdown
**Assumption:** Users are EU-domiciled. [OQ-16]
```

The same assumption is also indexed in `open-questions.md` under `[OQ-16]` with the question, options, and resolution path. Anyone reading the doc can chase the `OQ-16` link to see whether it's been resolved.

## Cross-document references

Use IDs, not paraphrases:

- ✅ "Per `FR-D5` and `M-22b`, recursion ships in MVP."
- ❌ "Per the recursion requirement in user-requirements.md and the corresponding roadmap item, recursion ships in MVP."

The IDs survive rewrites; the paraphrases don't.

## MoSCoW discipline

The roadmap's value is in its **explicit cuts.** Make them sharp:

- **Must (MVP cut).** What ships first. Justify each item's inclusion in one sentence ("Why").
- **Should (post-MVP, ordered by value-to-cost ratio).** Each item names a **trigger** — the condition under which it gets pulled in.
- **Could (longer horizon).** Lighter touch; one line each. These are not commitments.
- **Won't.** Named in plain language so they don't drift back. *"No multi-tenant SaaS. No agentic tool calling. No mobile-native app."* If a feature isn't named in Won't, it's an implicit Could — which is fine, but don't let "implicit Won't" rot into "we should probably do this someday."
- **Parking lot.** "Good ideas, not a fit yet" — captured so they don't get lost; nothing here is committed.

End the roadmap with a **risk-to-feature mapping**: every top risk from `vision.md` should be mitigated by a Must or Should item. If a risk has no mitigation, the roadmap has a gap; surface it.

## Sentinels for external-tool prompts

When a doc carries a prompt destined for an external tool (Claude Design, generic LLM, etc.), bracket the bare prompt body with sentinels so it can be extracted by `awk`:

```markdown
=== PROMPT ===

[the actual prompt body — paste-ready]

=== END PROMPT ===
```

Above the sentinels: a "How to use this file" preamble (which assets to upload first, which checks to run before pasting).

Extraction one-liner (document this near the sentinels):

```bash
awk '/^=== PROMPT ===$/{flag=1; next} /^=== END PROMPT ===$/{flag=0} flag' docs/claude-design-prompt.md
```

## Naming and formatting

- **Filenames.** kebab-case, ASCII, lowercase: `vision.md`, `architecture-options.md`, `D-001-architecture-option-b.md`.
- **Currency.** Symbol-prefixed (`€1,234.56`, `$1,234.56`). Pick one currency at intake; never mix.
- **Dates.** `DD-MM-YYYY` by default; confirm at intake. Always absolute, never relative ("by Q3" → name the quarter end date).
- **Units.** SI by default; name otherwise.
- **Tables.** Pipe tables (`| col | col |`); first row header, second row separator. Right-align numeric columns when it improves scannability.
- **Headings.** `#` reserved for the doc title (often the section title in this skill's templates); start sections at `##`.

## Decision records (`D-NNN`)

When a non-trivial decision crystallizes — architecture pick, model selection, scope cut — write a short record under `docs/decisions/D-NNN-<slug>.md`:

```markdown
# D-001 — <one-line title>

**Status.** Accepted YYYY-MM-DD. Source: `<doc-name>.md` § <section>.

## Decision

[3–6 bullets stating exactly what was decided]

## Why

[2–4 sentences naming the binding constraint or directive that drove the choice]

## Consequences

[3–6 bullets on what this commits the project to — build time, cost, scope, schedule, posture]

## What we did NOT pick

[1–3 short blocks describing the rejected alternatives and why each was rejected]
```

These are ~150 words each. They survive when other docs get rewritten.

## How conventions evolve

These conventions are themselves a living artifact. When the project surfaces a new pattern that recurs (e.g., a new ID family, a new sentinel kind, a new doc shape), add it here. Don't proliferate — if a pattern only fires once, leave it as a one-off.
