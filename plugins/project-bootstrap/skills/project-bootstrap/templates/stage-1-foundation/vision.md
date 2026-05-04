# Template: `docs/vision.md`

Structural guide for the vision doc. The vision doc is the single source of truth for what "good" looks like at MVP, 6 months, and 18 months — as measurable signals, not aspirations.

## When to write

Always. Even tiny projects need a vision doc; the discipline of naming "good" at three time horizons surfaces ambiguities early.

## Authoring discipline

Push back on three failure modes during the conversation:

1. **Hedged or compound "what is this product" sentences.** ("It's a platform for X *and* Y.") Force the user to commit to one sentence.
2. **Aspirational "what good looks like" criteria.** ("Better Arabic search.") Force a measurable signal with a measurement protocol.
3. **Anti-scope inflation.** ("It's not a Y." — long enough to lock; short enough to remember.)

## Required structure

### Header

```markdown
**Purpose:** Define what "good" looks like at <horizons> as measurable signals.
**Status:** draft.
```

### Section 1 — What this product is, in one sentence

Force a single sentence. Reject hedged compounds. The sentence is the seed of every downstream artifact (deck, IA, tasks).

Example shape:

```markdown
## What this product is, in one sentence

A platform where <users> <do thing> and receive <output property> grounded in <constraint>.
```

If a load-bearing directive shapes the whole project (e.g., "best-possible Arabic performance is a hard, non-negotiable requirement"), name it in the second paragraph and reference it from every downstream section that depends on it.

### Section 2 — Why "good" looks different here

One paragraph naming the asymmetries that shape every other decision. This is not a marketing block; it's the explanation of why the generic playbook doesn't apply.

Pattern: 3 short bulleted asymmetries, each phrased as a comparison between *this* product and the generic case.

```markdown
## Why "good" looks different from generic <category>

A generic <X> is judged on <metric>. This product is judged on **<binding constraint>**, where every detail counts:

- <Asymmetry 1: e.g., "A correct paragraph with a wrong page reference is worse than no answer.">
- <Asymmetry 2>
- <Asymmetry 3>

These asymmetries shape every other decision: <schema/architecture/UX/eval implications>.
```

### Section 3 — What "<load-bearing directive>" implies (when applicable)

If Section 1 named a load-bearing directive, this section names its structural consequences — usually 3 bullets pointing at architecture, model selection, and a feature category. Skip when there is no such directive.

### Section 4 — N-month definition of "good"

A table per time horizon. Common pattern: 6-month and 18-month. (For very small projects, MVP and 6-month is enough.)

```markdown
## 6-month definition of "good"

By **<DD-MM-YYYY>** (six months from current date <DD-MM-YYYY>), the project passes these gates:

| Signal | Target | How measured |
|---|---|---|
| **<signal name>** | **≥ <number>%** | <measurement protocol> |
| **<signal name>** | <number> | <measurement protocol> |
| ... | ... | ... |

If <pass condition>, we <next action>.
```

Every signal must be **measurable** (a number with units) and have a **measurement protocol** (how to verify). Push back on:

- Signals like "improved performance" without a number.
- Targets like "much better" without a baseline.
- "How measured" cells that say "owner judgment" without naming the rubric or fixture.

### Section 5 — What this product is *not* trying to be

Anti-scope, named so it doesn't drift. One bullet per non-goal, in plain prose.

```markdown
## What this product is *not* trying to be

- **Not a generic <X>.** <one-sentence clarification>.
- **Not a <Y>.** <one-sentence clarification>.
- **Not a <Z>.** <one-sentence clarification>.
```

The Won't list in `roadmap.md` is the *feature-level* version of this section. The vision-level version is *posture-level*.

### Section 6 — What "shipped" means at MVP

Optional but valuable when the MVP boundary is contentious. List the MVP cut as concrete deliverables (5–10 bullets). Reference roadmap IDs (`M-N`) when they exist.

### Section 7 — Top three risks to "good"

Exactly three risks (sometimes four if domain-specific risks demand it). Each carries one paragraph: the risk, why it's risky, and the mitigation pointing at a specific FR / M item.

```markdown
## Top three risks to "good"

1. **<Risk 1 name>.** <one-paragraph explanation, including why it's a top risk>.
   *Mitigation.* <pointer to FR-X<n> / M-N item or to a downstream doc>.

2. **<Risk 2 name>.** ...

3. **<Risk 3 name>.** ...
```

When the project model surfaces *additional* risks not in the top three (e.g., risks specific to a feature or to a deployment posture), append them as "A <ordinal> risk specific to <thing>: <explanation>." rather than padding the top three.

## Conventions specific to this doc

- Numbers in tables: right-aligned for readability when units are uniform.
- Dates: **always absolute** in the time-horizon section. "By six months" → name the date.
- Currency, when used, is symbol-prefixed (`€1,234`).
- Cross-references to `roadmap.md` and `user-requirements.md` use IDs, not paraphrases.

## Anti-patterns

- **Marketing voice.** "Empower users to seamlessly..." — strike. Plain declarative prose only.
- **Untestable signals.** "Better quality." → reject. Force a number + protocol.
- **Unbounded MVP.** If "what shipped means at MVP" lists 30 bullets, the MVP isn't an MVP.
- **Silent revision.** When the vision is reframed (e.g., scope shifts, directive changes), record the date inline (`**Status:** draft — reframed <DD-MM-YYYY> for <reason>.`) and amend the affected sections explicitly. Don't silently rewrite history.

## Example excerpt (minimal vision)

```markdown
**Purpose:** Define what "good" looks like at MVP and 6 months for a CLI tool that converts CSVs to type-safe SQL inserts.
**Status:** draft — last revised 12-03-2026.

## What this product is, in one sentence

A command-line tool that ingests a CSV with header row and emits a stream of type-safe parameterized SQL INSERT statements ready for `psql` or `pg_executor` consumption.

## Why "good" looks different here

A generic CSV-to-SQL converter is judged on speed. This tool is judged on **type safety** — every emitted statement must parse against the live target schema, with explicit cast operators where the CSV column type and the target column type differ. A 10× speedup at the cost of one wrong cast per 10k rows is a regression, not a win.

## 6-month definition of "good"

By **12-09-2026**:

| Signal | Target | How measured |
|---|---|---|
| Cast correctness | 100% on the canonical 12-table fixture | Generated SQL parses against target schema; no implicit casts. |
| Throughput | ≥ 50,000 rows/sec on a 1M-row CSV | Bench fixture, single-threaded, M2 Pro local. |
| ... | ... | ... |

## What this product is *not* trying to be

- **Not a CSV validator.** Out-of-spec CSVs (mismatched column counts, encoding errors) abort with a clear error; we don't try to recover.
- **Not a database client.** No connection management; we emit text to stdout.

## Top three risks

1. **Numeric casts diverge silently between CSV (string) and target (numeric).** ...
2. **NULL handling differs across PG versions.** ...
3. **CSV files in the wild use non-RFC-4180 quoting.** ...
```
