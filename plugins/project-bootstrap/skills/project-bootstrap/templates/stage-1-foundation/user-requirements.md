# Template: `docs/user-requirements.md`

Structural guide for personas + numbered functional requirements with acceptance criteria.

## When to write

Always when the project has a user-facing surface (UI, API, CLI). Skip the personas block (but keep numbered FRs) when the project is internal infrastructure with no human users.

## Authoring discipline

Push back on three failure modes:

1. **Persona-as-marketing-segment.** Personas are *priorisation filters*, not customer segments. Two paragraphs each, naming who they are and what they care about — no demographic packaging.
2. **FRs without acceptance criteria.** Every FR has a testable acceptance line. "Works correctly" is not testable.
3. **Implicit non-requirements.** Capabilities the project deliberately doesn't have go in a "Non-requirements" section so they don't drift in.

## Required structure

### Header

```markdown
**Purpose:** Personas and numbered user stories with acceptance criteria. Source of truth for what the system does.
**Status:** draft.
```

### Section 1 — Personas

Numbered (`P1, P2, P3, …`), internal-only labels (never surfaced in UI). Two paragraphs each: who they are, what they care about. Plus an explicit "**Implication on prioritization**" block when personas conflict.

```markdown
## Personas

The audience is <description of the audience scope>. They split into <N> personas — usually one person crosses two of them. Use these as filters when prioritizing trade-offs, not as user-base segments.

### P1 — <Label>
<Two paragraphs naming who they are and what they care about. Include their query/usage patterns and what would disqualify the product for them.>

### P2 — <Label>
<Two paragraphs.>

### P3 — <Label>
<Two paragraphs.>

**Implication on prioritization.** When P1 and P3 conflict (<axis of conflict>), default to <persona>. When P2 and P1 conflict (<axis of conflict>), default to <persona>'s downstream needs — but acknowledge that <other persona> is the bottleneck on <thing> and underinvesting will starve the system.
```

When personas don't conflict, skip the prioritization block. When they do, name the conflict and the resolution explicitly.

### Section 2 — Functional requirements (numbered stories)

Group by letter (`A`, `B`, `C`, `D`, …). Letter assignment is project-dependent — common groupings:

- `A` — authentication and account
- `B` — core entity (project's primary domain object)
- `C` — ingestion / curation / authoring
- `D` — the core surface (the main user-facing flow)
- `E` — secondary surfaces (history, settings, etc.)
- `F` — owner-only / admin utilities
- `G` — preferences / memory / personalization

Each FR has the form:

```markdown
**FR-X<n>** — As <persona>, I can <action> so that <outcome>.
*Acceptance.* <one or more testable criteria, semicolon-separated>.
```

Example block:

```markdown
### Group A — Authentication and account

**FR-A1** — As any user, I can register with an email and password.
*Acceptance.* Email is unique (case-insensitive). Password ≥ 12 chars. Password reset by emailed token.

**FR-A2** — As any user, I can log in and log out. Sessions persist across browser restarts via refresh tokens.
*Acceptance.* Refresh token TTL 30d; access TTL 15min. Logout revokes the refresh token.

**FR-A3** — As any user, I have a public-facing display name (for sharing attribution).
*Acceptance.* Display name is editable in settings. Default = email local-part.
```

**Group letter rules.**

- Letters are **stable**: once `Group D` means "the core surface," it never gets reassigned.
- Letters can be **non-sequential**: if `Group F` is added after `Group G`, that's fine — alphabetic ordering doesn't require dense numbering.
- Letters are **assigned in conversation**, not a-priori. Ask the user what surface areas exist and pick the letters that fit.

### Section 3 — Non-functional requirements

Grouped by category (Performance / Correctness / Security & privacy / Internationalization / Operations). Each item has the form:

```markdown
**NFR-N** — <statement of constraint with measurable bar>.
```

Example:

```markdown
## Non-functional requirements

### Performance

**NFR-1** — Retrieval P50 latency ≤ 4 s, P95 ≤ 8 s (query submit → first citation rendered). P99 ≤ 15 s.
**NFR-2** — Synthesis P50 ≤ 12 s, P95 ≤ 25 s (query submit → final token streamed).

### Correctness

**NFR-5** — Citation chips must always include the edition. A chunk with no `edition_id` is not retrievable. Enforced at the retrieval layer.

### Security & privacy

**NFR-7** — Private content is unreachable without authenticated access from a permitted user. Verified by an integration test that performs a direct API probe as an unrelated user.
```

Numbering is contiguous across NFRs (not per-category) — `NFR-1` … `NFR-13`, not `NFR-perf-1` / `NFR-sec-1`.

### Section 4 — Non-requirements

Capabilities the project deliberately doesn't have. Named so they don't drift in (the FR-level version of `vision.md`'s anti-scope).

```markdown
## Non-requirements (named so they don't drift in)

- No real-time collaboration (no live cursor, no concurrent edit). <one-sentence why>.
- No comment/annotation system on chunks for v1. <one-sentence why>.
- No agent loop with tools (web search, calculator, code execution). <one-sentence why>.
- No mobile-native app. <one-sentence why>.
- No on-device / offline mode. <one-sentence why>.
```

## Conventions specific to this doc

- **FR ID stability.** Once `FR-D5` means a specific story, it never gets reassigned. If the story is dropped, the ID stays retired (note in a "Dropped" subsection if useful).
- **Acceptance line discipline.** The acceptance line is *what a test checks*. "Works correctly" / "user is satisfied" → reject. Numbers, thresholds, schema constraints, error codes.
- **Cross-references.** Use FR IDs (`FR-D5`) not paraphrases.

## Anti-patterns

- **FRs as paragraphs.** "Users can do many things including X, Y, Z and also..." → split into three FRs.
- **Personas as marketing copy.** "Sarah is a 32-year-old product manager who values..." → strike. Personas are filters, not biographies.
- **Acceptance criteria that restate the story.** `FR-X1: User can log in. *Acceptance.* User can log in.` → the acceptance line is the *test*, not the *restatement*.
- **Sequential renumbering after a drop.** If `FR-D3` is removed, don't shift `FR-D4` → `FR-D3`. The IDs are stable; gaps are fine.

## Example excerpt (minimal personas + FRs)

```markdown
**Purpose:** Personas and numbered user stories with acceptance criteria for the CSV → SQL CLI.
**Status:** draft.

## Personas

### P1 — The Data Engineer
Loads bulk data into Postgres weekly from CSV exports of upstream systems. Cares about **type-safe inserts** above all — a wrong cast that silently truncates is the worst-case bug.

### P2 — The Analytics Operator
Loads ad-hoc CSVs into ad-hoc tables to run a one-off query. Cares about **fast iteration** — happy with sensible defaults; will tolerate a clunky CLI for a working tool.

**Implication.** When P1 and P2 conflict (strict-by-default vs convenient-by-default), default to P1 — the harder bug to catch (silent truncation) is worse than the smaller annoyance (one extra flag to enable strict mode).

## Functional requirements

### Group A — Conversion

**FR-A1** — As any user, I can convert a CSV to SQL by piping it: `cat data.csv | csv2sql --table mytable > inserts.sql`.
*Acceptance.* Stdin in, stdout out. Exit code 0 on success, non-zero on parse error. Errors to stderr.

**FR-A2** — As any user, I can specify the target schema by passing `--schema-from-psql 'host=…'` or `--schema-file schema.sql`.
*Acceptance.* `--schema-from-psql` connects, runs `\d <table>`, parses; `--schema-file` reads a `CREATE TABLE` statement. Conflict between CSV column types and target column types triggers a cast operator (or an error if the cast is unsafe).

## Non-functional requirements

**NFR-1** — Throughput ≥ 50,000 rows/sec on a 1M-row CSV, single-threaded, M2 Pro local.
**NFR-2** — No string interpolation in the SQL output; only parameterized statements.
```
