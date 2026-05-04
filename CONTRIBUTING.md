# Contributing — adding a new plugin or skill

Future-self should be able to add a new plugin or skill in under 30 minutes by following this doc. Audience: me (Rachid), or any agent I'm using to extend this marketplace. Not accepting external contributions.

## When to add a new plugin vs a new skill in an existing plugin

- **New plugin** when the new capability is a coherent workflow area distinct from existing plugins (e.g., adding pitch-deck generation when project-bootstrap is the only thing here). Each plugin is independently installable.
- **New skill in an existing plugin** when the capability is closely related to what the plugin already does (e.g., adding a "resume Stage 2" skill to `project-bootstrap`).

When in doubt: prefer separate plugins. They're cheap to add and easier to enable/disable per-project.

## Adding a new plugin (~30 minutes)

### 1. Decide the name (~2 minutes)

Constraints:

- kebab-case, lowercase, ASCII
- Memorable — short enough to type, distinctive enough to remember
- Not too generic — `marketplace`, `helpers`, `tools` collide with everything
- Not too specific — `acme-deck-generator` is project-specific; `pitch-deck` is reusable

Examples that fit:

- `pitch-deck`
- `app-ia`
- `brand-bundle`
- `plan-execute-handoff`
- `commit-flow`

Decide and commit; don't second-guess after writing files.

### 2. Scaffold the directory (~1 minute)

```bash
PLUGIN=<your-plugin-name>
mkdir -p plugins/$PLUGIN/.claude-plugin
mkdir -p plugins/$PLUGIN/skills/$PLUGIN/references
mkdir -p plugins/$PLUGIN/skills/$PLUGIN/templates  # if the skill produces structured artifacts
```

(Adapt for plugins that ship multiple skills — one `skills/<skill-name>/` per skill.)

### 3. Write the plugin manifest (~3 minutes)

`plugins/<plugin>/.claude-plugin/plugin.json`:

```json
{
  "name": "<plugin-name>",
  "version": "0.1.0",
  "description": "<one-sentence description, 50–200 chars>",
  "author": {
    "name": "Rachid Chabane",
    "email": "rachid.chabane59@gmail.com"
  },
  "homepage": "https://github.com/RachidChabane/atelier/tree/main/plugins/<plugin-name>",
  "repository": "https://github.com/RachidChabane/atelier",
  "license": "MIT",
  "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"]
}
```

### 4. Add the plugin to the marketplace manifest (~2 minutes)

Edit `.claude-plugin/marketplace.json` — add an entry to the `plugins` array:

```json
{
  "name": "<plugin-name>",
  "description": "<one-sentence description matching plugin.json>",
  "version": "0.1.0",
  "author": {
    "name": "Rachid Chabane",
    "email": "rachid.chabane59@gmail.com"
  },
  "source": "./plugins/<plugin-name>",
  "category": "<category — see existing plugins for conventions>",
  "keywords": ["<keyword1>", "<keyword2>"]
}
```

### 5. Write the SKILL.md (~15 minutes)

`plugins/<plugin>/skills/<skill>/SKILL.md`:

```markdown
---
name: <skill-name>
description: This skill should be used when the user asks to "<phrase 1>", "<phrase 2>", "<phrase 3>". <One sentence on what the skill produces.> <One sentence on resume / re-invocation behavior if applicable.>
---

# <skill-name>

<One short paragraph on what the skill does and the workflow it encodes.>

## When this skill triggers

<Concrete trigger phrases + situations.>

## Step-by-step procedure

<Imperative-form steps. Each step is a conversation move, not a fill-in-the-blank.>

## Conventions enforced

<The opinionated structure the skill insists on.>

## Templates / references

<Pointers to templates/ and references/.>

## What this skill does NOT do

<Boundaries — what's out of scope.>
```

Discipline:

- **Frontmatter description: third-person, with specific trigger phrases.** "This skill should be used when the user asks to..." — not "Use this skill when..."
- **Body: imperative form.** "Drive the conversation through these steps" — not "You should drive the conversation."
- **Body: lean.** Target ~1500–2500 words. Move detail to `references/`.
- **Reference files explicitly.** "Load `references/conventions.md` when..." — Claude won't load files it doesn't know about.

See `plugins/project-bootstrap/skills/project-bootstrap/SKILL.md` as a working template.

### 6. Add references and templates as needed (~5–60 minutes depending on skill complexity)

- **`references/`** — files Claude loads into context when needed. Examples: convention docs, example walks, schema references.
- **`templates/`** — when the skill produces structured artifacts, write a structural template per artifact (section headings + per-section authoring guidance + tiny illustrative examples + anti-patterns). These are *guides*, not literal-copy skeletons.

Per the official skill docs: each reference file can be 2,000–5,000+ words; SKILL.md should stay under 3,000.

### 7. Write the plugin-level README (~3 minutes)

`plugins/<plugin>/README.md`:

```markdown
# <plugin-name>

<One paragraph describing what the plugin does and when to use it.>

## What ships

- Skill: `<skill-name>` — <one-line summary>
- (more skills if applicable)

## How to use

<One-paragraph operational note: how the user invokes the skill, what to expect, where the artifacts land.>

## See also

- The skill itself: [`skills/<skill-name>/SKILL.md`](skills/<skill-name>/SKILL.md)
- Marketplace root: [`../../README.md`](../../README.md)
```

### 8. Smoke-test (~3 minutes)

Read your own SKILL.md as if you were Claude consuming it. Walk through what you would do on the first invocation against an empty repo (or whatever the entry condition is). Confirm:

- The trigger phrases in the description actually match what a user would say
- The step-by-step procedure produces the artifacts the description promises
- References / templates are pointed at where they exist
- The "what this skill does NOT do" section catches the obvious scope-creep risks

Document the smoke-test result briefly somewhere committable — typically in the PR description or in a `SMOKE-TEST.md` next to the SKILL.md.

### 9. Update the top-level README (~1 minute)

Edit `README.md` — add the plugin to the "What's here" table.

### 10. Commit + push

```bash
git add .
git commit -m "feat(<plugin-name>): scaffold plugin and first skill"
git push
```

Conventional-commit form. One commit per plugin add; subsequent skill iteration uses separate commits.

### 11. Re-install on existing machines

On any machine where the marketplace is already added:

```text
/plugin marketplace update atelier
/plugin install <plugin-name>@atelier
```

## Adding a new skill to an existing plugin (~15 minutes)

```bash
PLUGIN=<existing-plugin-name>
SKILL=<new-skill-name>
mkdir -p plugins/$PLUGIN/skills/$SKILL/references
```

Write `plugins/$PLUGIN/skills/$SKILL/SKILL.md` per the SKILL.md discipline above. Add references/templates as needed. Update the plugin-level README to mention the new skill. Smoke-test. Commit + push.

You don't need to update `marketplace.json` — skills are auto-discovered within their plugin.

## Conventions across the marketplace

These hold for every plugin:

- **kebab-case filenames** throughout. `vision.md`, not `Vision.md` or `vision_doc.md`.
- **`SKILL.md` exactly** — not `README.md`, not `index.md`. Auto-discovery looks for `SKILL.md`.
- **YAML frontmatter** on `SKILL.md`, agent files (`.md` in `agents/`), and command files (`.md` in `commands/`). `name` and `description` are required.
- **Third-person description** in skill frontmatter. Specific trigger phrases the user would actually say.
- **Imperative-form body** in SKILL.md. "Drive the conversation" / "List the docs folder" — not "You should drive..."
- **`${CLAUDE_PLUGIN_ROOT}`** for any intra-plugin path reference in hooks, MCP servers, scripts. Never hardcode paths.
- **Semver in `version` fields.** Bump on changes.
- **MIT license** unless a specific plugin needs otherwise; it's in the LICENSE at repo root.

## Common pitfalls

- **Skill not loading.** Check `SKILL.md` exists (not `Skill.md`, not `skill.md`); check frontmatter is valid YAML; check `name` and `description` are present.
- **Plugin not appearing in marketplace.** Check the entry was added to `.claude-plugin/marketplace.json` (the *marketplace* manifest, not just the *plugin* manifest). Re-run `/plugin marketplace update atelier`.
- **Templates not picked up.** Templates live under the skill's directory (typically `skills/<skill>/templates/`); SKILL.md must reference them by path. Claude doesn't auto-discover template files — the skill must point at them.
- **References too long.** Each reference file can be large, but if a skill has 8 reference files of 5k words each, the agent rarely loads more than 1–2. Prune.

## Resources

- Official Claude Code plugin docs: search "Claude Code plugin marketplace" or look in `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/plugin-dev/skills/` for canonical skill-development / plugin-structure references.
- `frontend-design` plugin in the official Anthropic marketplace is a clean single-skill plugin worth referencing as a shape: `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/frontend-design/`.
