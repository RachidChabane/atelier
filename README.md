# atelier

Personal Claude Code plugin marketplace. Opinionated skills, slash commands, agents, and hooks I (Rachid Chabane) reuse across projects. Public under MIT — fork, copy, or install directly; not soliciting external contributions.

## What's here

| Plugin | What it does |
|---|---|
| [`project-bootstrap`](plugins/project-bootstrap/) | Drives a fresh repo through Stage-1 planning artifacts (vision, roadmap, requirements, open questions, architecture options, decisions, plus domain-specific docs) and prepares hand-offs for pitch deck (Claude Design), information architecture, screen design, and implementation slate. Resumes from whatever artifacts already exist in `docs/`. |
| [`migrate-to-interactive-claude`](plugins/migrate-to-interactive-claude/) | Walks a project off `claude -p` (programmatic pool) onto a tmux-driven interactive Claude Code backend (subscription pool), preserving the existing wrapper contract. Built for Anthropic's 2026-06-15 billing split. Ships verbatim reference docs (banned flags, idle-detection regex, JSONL schema, marker injection) plus runnable Python and TypeScript session snippets. |

The marketplace structure is designed to grow — `plugins/` holds one subdirectory per plugin, each independently installable. Adding a new plugin is a ~30-minute mechanical operation; see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Install

### One-time setup

In Claude Code:

```text
/plugin marketplace add RachidChabane/atelier
```

Claude Code clones the repo into `~/.claude/plugins/marketplaces/atelier` and reads the manifest at `.claude-plugin/marketplace.json`.

### Enable the plugins you want

```text
/plugin install project-bootstrap@atelier
/plugin install migrate-to-interactive-claude@atelier
```

Repeat per plugin as more land. To list what's installed:

```text
/plugin list
```

To disable a plugin without uninstalling:

```text
/plugin disable project-bootstrap@atelier
```

### Update

When the marketplace gets new plugins or updates:

```text
/plugin marketplace update atelier
```

Then re-install (or `update`) any specific plugin you want the new version of.

## Repo layout

```
atelier/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace manifest. Lists every plugin.
├── plugins/
│   ├── project-bootstrap/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json       # Per-plugin manifest.
│   │   ├── README.md             # Plugin-level overview.
│   │   └── skills/
│   │       └── project-bootstrap/
│   │           ├── SKILL.md
│   │           ├── references/   # Loaded into context as needed.
│   │           └── templates/    # Structural guides for the artifacts the skill produces.
│   └── migrate-to-interactive-claude/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── README.md
│       └── skills/
│           └── migrate-to-interactive-claude/
│               ├── SKILL.md
│               ├── reference/    # Verbatim quotes / regexes / schema (loaded as needed).
│               └── snippets/     # Runnable Python + TS session-lifecycle starters.
├── README.md                     # ← you are here
├── CONTRIBUTING.md               # How to add the next plugin / skill.
├── LICENSE                       # MIT.
└── .gitignore
```

The conventions are: kebab-case filenames; one plugin per directory under `plugins/`; one skill per directory under `<plugin>/skills/`; `SKILL.md` per skill; `references/` for context-loaded reference material; `templates/` (where applicable) for structural guides the skill drives a conversation against.

## Skill design philosophy

Three rules that shape every skill in this marketplace:

1. **Opinionated about structure, neutral on content.** Skills enforce file names, section headings, and cross-document IDs. They don't invent content; they drive conversations that surface it.
2. **Resume-aware.** Every skill that produces multiple artifacts checks what already exists before doing anything. Re-invocation continues; it never starts over.
3. **Stage-isolated.** When a skill spans multiple workflow stages, the skill drives one stage end-to-end and *prepares* later stages — drops scaffolds and points at the appropriate downstream tool. Each stage can be invoked independently.

These rules come from operating the workflows manually before encoding them, then noticing which discipline survived and which drifted.

## What's planned

Plausible additions (not committed, not on a calendar):

- **`pitch-deck`** — invokes Claude Design with a generated brand bundle and the deck prompt; iterates on the deck content.
- **`app-ia`** — once Stage-1 docs exist, walks through authoring `app-ia.md` based on their content.
- **`plan-execute-handoff`** — converts an existing IA into a `tasks.yaml` and supporting config.
- **`brand-bundle`** — one-shot scaffolds a brand bundle from a few prompts.
- **Gate-script libraries**, **commit / PR workflow commands**, and other small utilities encoding workflows refined in practice.

Each lands as its own plugin under `plugins/` per [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Contact and contributions

This is a personal marketplace shaped around how I work. PRs aren't accepted — fork the repo if you want to adapt anything to your own workflow. Questions or interesting use-cases: open an issue, or email rachid.chabane59@gmail.com.

## License

MIT — see [`LICENSE`](LICENSE).
