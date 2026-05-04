# Template: `docs/app-ia.md`

Structural guide for the information architecture doc — the reconciled source of truth for the user-facing surface (routes, screens, navigation, state, implementation order). Consumed by Stage 4 (per-screen design) and Stage 5 (implementation slate).

## When to write

After Stage 1 is approved and the project is moving toward implementation. The IA is the *bridge* between Stage 1's planning artifacts and Stage 5's task slate.

## Authoring discipline

Three failure modes to push back on:

1. **IA contradicts Stage 1.** When the IA says one thing and `user-requirements.md` says another, the IA is the reconciled source of truth — but the Stage 1 doc must also be amended. Don't let them drift.
2. **IA invents new entities.** The IA's data model section must reconcile with `architecture-options.md` § "data model" and `user-requirements.md` entities. New entities surfaced by the IA conversation should be back-ported.
3. **Screen inventory without invariants.** Each screen entry must name what it is *not* — the anti-patterns the screen must refuse. Without those, the design conversation drifts.

## Required structure

### Header

```markdown
**Purpose.** Canonical specification of <project>'s user-facing surface: routes, screens, navigation, state, and the order in which screens get implemented. Source of truth for `tasks.yaml` (Stage 5), for the Stage-4 screen-design prompt, and for anyone joining the project.

**Status.** Final, ready to consume. Reconciles <list of Stage 1 docs>. Anchored to <existing codebase commit hash if applicable>. Date: <YYYY-MM-DD>.

**Audience.** The implementation agent (Stage 5). The designer (Stage 4). The owner.
```

### Section 0 — How to read this document

A short orientation block:

```markdown
## 0. How to read this document

Sections 1–4 set the model (vocabulary, users, domain entities). Section 5 is the route map. Section 6 is the navigation shell. Section 7 is the screen inventory — the bulk of the document. Section 8 is core flows. Section 9 is the API surface. Section 10 is the invariants every screen must respect. Section 11 maps the <UX modes / display modes> onto screens. Section 12 is the implementation order — the dependency-ordered task slate to feed Stage 5.

Vocabulary convention: **engineering nouns** (`User`, `KB`, `Work`, `Edition`, `Chunk`, `Cluster`) appear in code, schema, and API. **UI nouns** (lecteur, base, ouvrage, édition) appear in copy on screens. The table at the start of §3 fixes the mapping.
```

### Section 1 — Product summary

One paragraph paraphrased from `vision.md`. Then a short paragraph naming what's in MVP vs post-MVP for the surface (cite `roadmap.md` `M-` and `S-` IDs).

### Section 2 — Personas (internal labels)

A table from `user-requirements.md` § Personas, with an "activity skew" column added (e.g., 70% query / 30% curation). Then a one-paragraph note on how the UI segments by *permission* and *preference*, not by persona label.

### Section 3 — User and permission model

Three subsections:

```markdown
### 3.1 Vocabulary mapping

| UI (<language>) | Engineering (code/schema) | Notes |
|---|---|---|
| <UI noun> | `<EngineeringEntity>` | <one-line note> |

### 3.2 Visibility and permissions

A `<core-entity>` has one of <N> visibilities:
1. <visibility 1>
2. <visibility 2>
...

Permission gates per endpoint (server-side, enforced regardless of UI):

| Action | Required |
|---|---|
| ... | ... |

### 3.3 <Domain-specific permission axis if any>

[e.g., model tier, plan tier, role]
```

### Section 4 — Domain entities

A code-fenced block describing the entities and their relationships. Mermaid ER diagram or plain text:

```markdown
## 4. Domain entities

```
User
 ├── id, email, password_hash, display_name, <other fields>
 ├── created_at, updated_at
 └── owns: <Entity>[]

<CoreEntity>
 ├── id, owner_id, name, slug, description, visibility
 ├── grants: <Grant>[]
 └── ...
```
```

This section is the reconciled view of all data models scattered across `architecture-options.md` and `user-requirements.md` — name fields once, here.

### Section 5 — Route map

A table of routes with auth requirements and the screen each route renders:

```markdown
## 5. Route map

| Route | Auth | Screen | Notes |
|---|---|---|---|
| `/` | none | <landing screen> | <notes> |
| `/login` | none | <login screen> | |
| `/<core-entity>/<id>` | read | <detail screen> | <notes> |
| `/<core-entity>/<id>/<sub>` | read | <sub-screen> | |
| `/settings` | self | <settings screen> | |
```

### Section 6 — Navigation shell

Names the chrome shared by all screens: left rail (sidebar), top bar (masthead + active scope), content area. Per shell element, name the components and the affordances.

### Section 7 — Screen inventory

The bulk of the document. One subsection per screen:

```markdown
### Screen N — <screen name in UI language>

**English clarification:** <translation if not English>.

**Purpose.** <one paragraph: what the user does on this screen>.

**User context.** <one paragraph: how the user arrives, what they have in mind>.

**Data shown.** <list of data items rendered>.

**States.** <enumerated states: empty / loading / partial / refusal / etc., with what the screen looks like in each>.

**Components.** <named sub-components with brief specs; cross-references to shared components>.

**Endpoints.** <API endpoints this screen calls, by name; cross-references to §9>.

**Anti-patterns.** <what this screen must NOT become — Notion-like editor / chat bubble / SaaS dashboard / etc.>.
```

The `Anti-patterns` block is load-bearing for the Stage 4 design conversation. Without it, designs drift toward generic SaaS register.

### Section 8 — Core flows

Numbered flows (`Flow 1: First question`, `Flow 2: Upload + index`, etc.). Each flow is a sequence of screens with the user actions and the system responses. References Stage 1 FRs.

### Section 9 — API surface

Two columns: existing endpoints (carried over from prior code if any) and new endpoints (introduced by this surface). Per endpoint: HTTP verb, path, auth requirement, request shape, response shape, screens it serves.

### Section 10 — Cross-screen invariants

The non-negotiables that apply to every screen. Reference `vision.md` non-negotiables and `decisions/D-NNN-*.md` decision records:

```markdown
## 10. Cross-screen invariants

- <Invariant 1, e.g., "Citations precede prose. A citation chip never appears as decoration of a paragraph; the paragraph appears only on explicit user request and never without chips."> Reference: `vision.md` § Top three risks #2; `D-005-cluster-default-and-only.md`.
- <Invariant 2>
- ...
```

### Section 11 — UX modes / display variants

When the project commits to multiple display modes (`vision.md` §<X> committed N modes), map each to the screens it modifies. Per mode: which screens change, what changes, MVP-or-post-MVP.

### Section 12 — Implementation order

Numbered phases (`Phase A: schema rework`, `Phase B: ingestion`, `Phase C: retrieval`, etc.). Each phase lists the `M-N` items from `roadmap.md` that it covers, in dependency order. This section *is* the source for the Stage 5 task slate (`tasks.yaml`).

```markdown
## 12. Implementation order

### Phase A — Schema rework
- M-1, M-2, M-3, M-4 (in that order; M-2 depends on M-1).
- Acceptance: Alembic migration runs cleanly; ORM models updated; existing tests pass.

### Phase B — Ingestion
- M-5, M-6, M-7, M-8, M-9, M-10 (M-7 and M-8 can parallelize).
- Acceptance: ...

### Phase C — Retrieval
...
```

## Conventions specific to this doc

- **Status: Final** when the doc is approved. Status: draft means the IA is being authored; status: Final means downstream stages can consume it.
- **Vocabulary mapping locked.** Once §3.1 is approved, downstream docs (Stage 4 prompts, Stage 5 tasks) use the mapping and never re-derive.
- **Anti-patterns section per screen** — not optional.
- **Cross-references to Stage 1.** Every screen entry, every invariant, every phase references Stage 1 IDs.

## Anti-patterns

- **IA without §10 invariants.** Without invariants, the design conversation drifts to default SaaS register.
- **Screen inventory as wireframes.** Don't describe pixel layout in the IA; that's Stage 4. Describe purpose, data, states, components, anti-patterns.
- **Implementation order without dependencies.** Just listing M-IDs is not enough; name what depends on what.
