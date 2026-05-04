# Hand-off: from `app-ia.md` § 12 to `tasks.yaml` for `claude-plan-execute`

Structural guide for converting the IA's implementation order into a task slate consumable by `claude-plan-execute` (or equivalent orchestration).

## When to write / use

After `app-ia.md` is approved and `docs/persona.md` is in place. The hand-off doc itself can stay under `docs/` as `tasks-yaml-handoff.md`; the resulting `tasks.yaml` typically lives at `<project-root>/tasks.yaml` (or wherever the orchestration tool reads from).

## What `tasks.yaml` looks like

A typical schema (adapt to the orchestration tool's actual schema):

```yaml
- id: M-1
  title: KB entity, Work entity, Edition entity; ACL grants
  phase: A
  depends_on: []
  context_files:
    - docs/app-ia.md          # § 4 (entities), § 3.2 (permissions)
    - docs/roadmap.md          # § Must § Core data
    - docs/user-requirements.md # FR-B1..FR-B5
    - docs/decisions/D-001-architecture-option-b.md
    - docs/persona.md
  acceptance:
    - Alembic migration creates the KB / Work / Edition / KBGrant tables per docs/app-ia.md § 4.
    - ORM models updated; existing tests pass.
    - Permission gates (read / write / owner) implemented at the router layer per docs/app-ia.md § 3.2.
  estimated_effort: M

- id: M-2
  title: Polymorphic citation — citation_kind enum + citation_data JSONB
  phase: A
  depends_on: [M-1]
  context_files:
    - docs/app-ia.md            # § 4 Chunk entity
    - docs/<dominant-domain-doc>.md  # § <citation kinds section>
    - docs/user-requirements.md  # FR-D1..FR-D11
  acceptance:
    - Chunk model has citation_kind + citation_data fields.
    - Per pagination_scheme in editions, the chunker emits the correct citation_kind.
    - All N citation kinds round-trip through API.
  estimated_effort: M
```

The schema's load-bearing fields:

- **`id`**: matches `M-N` / `S-N` from `roadmap.md`.
- **`depends_on`**: derived from `app-ia.md` § 12 (implementation order); the dependency graph drives execution order.
- **`context_files`**: the list of docs the agent loads before working the task. Always include `docs/persona.md` and `docs/app-ia.md`. Then add the specific `roadmap.md` and `user-requirements.md` sections, plus any `decisions/` records that bear on this task.
- **`acceptance`**: testable criteria. Each line is a check the agent (or a verifier) can run.
- **`estimated_effort`**: from `roadmap.md` (S/M/L/XL).

## Authoring procedure

For each phase in `app-ia.md` § 12:

1. List the `M-N` items in the phase, in dependency order.
2. For each item, name:
   - The roadmap row (one-line "Why" from `roadmap.md`).
   - The dependencies (other `M-N` items that must complete first).
   - The context files (always `persona.md` + `app-ia.md`; add the specific `roadmap.md` row, the specific `FR-*` items, the relevant `decisions/D-*` records, and the dominant domain doc when relevant).
   - The acceptance criteria (rephrased from the FR acceptance lines + any phase-specific gates from `app-ia.md`).

3. Cross-check: every `M-N` in `roadmap.md` § Must should appear in `tasks.yaml`. If one is missing, surface it.

## Conventions specific to this doc

- **Task IDs match roadmap IDs.** Don't introduce new IDs in `tasks.yaml`; the roadmap IDs are stable and cross-referenced.
- **`context_files` always includes `persona.md`.** It carries the non-negotiables.
- **Acceptance criteria are testable.** Each acceptance line is a check the agent or a downstream verifier can run.
- **Phase boundaries match `app-ia.md` § 12.** Don't reshape phases in `tasks.yaml`; the IA is the reconciled source of truth.

## Anti-patterns

- **Tasks without dependencies.** Without `depends_on`, the orchestration tool runs tasks in arbitrary order and the build breaks.
- **Tasks without acceptance criteria.** "Implement M-N" is not a check; the agent will declare done prematurely.
- **Tasks with paragraph-form context.** `context_files` is a list of doc paths, not prose. The agent loads what's listed.
- **Tasks that duplicate `roadmap.md`.** `tasks.yaml` is *additional* (dependencies, context, acceptance); the roadmap is the source of truth for the *what*.

## When the orchestration tool has a different schema

Adapt fields, keep concepts:

- `claude-plan-execute` may use `task_id` / `description` / `dependencies` / `files` / `acceptance_criteria` instead of the names above.
- A different orchestrator may not have `context_files` per task — instead it loads context globally; in that case, list context files in the orchestrator's project config.
- A different orchestrator may use Markdown task descriptions instead of YAML; the same procedure applies.

The core idea: **`tasks.yaml` is a strict transformation of `app-ia.md` § 12 + `roadmap.md` § Must, with dependencies and context files made explicit.**
