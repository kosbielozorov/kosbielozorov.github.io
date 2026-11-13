# `ai/` — AI layer of this test package

Everything an AI tool needs lives here. To seed a new project, copy the whole test package and run
`npm run sync:ai`.

Not hidden on purpose — a dot-directory is skipped by `rg` and by most agent search paths, and the
framework contract is a team engineering standard, not tooling config.

## Contents

| Path            | What it is                                           | Who edits it            |
| --------------- | ---------------------------------------------------- | ----------------------- |
| `project.md`    | **Project binding** — paths, fixtures, facade, tags  | every project, on setup |
| `instructions/` | Canon. `02-architecture.md` = **Framework contract** | maintainers             |
| `skills/`       | **SSoT** for skills — mirrored to tools via symlinks | maintainers             |
| `mcp/`          | **SSoT** for MCP servers → generated host configs    | maintainers             |
| `templates/`    | Starters: binding template, feature handoff template | maintainers             |

## Authority order

1. `ai/project.md` — project facts
2. `ai/instructions/02-architecture.md` → **Framework contract** — normative rules
3. `ai/instructions/03-writing-tests.md`, `06-examples.md` — how to write

Entry point for every tool: `AGENTS.md` at the package root (fixed name, must stay there).

## Loaders (generated — do not treat as sources)

All of them live **inside this package** — the surrounding repository is never written to.
Regenerate with `npm run sync:ai`.

| Location           | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `.claude/skills/*` | Claude Code skills — symlinks into `ai/skills/` |
| `.cursor/skills/*` | Cursor skills — symlinks into `ai/skills/`      |
| `.cursor/rules/*`  | Cursor rules                                    |
| `.mcp.json`        | MCP servers for Claude Code — generated         |
| `.cursor/mcp.json` | MCP servers for Cursor — generated              |
| `.vscode/mcp.json` | MCP servers for VS Code / Copilot — generated   |

All skill locations are **symlinks** into `ai/skills/`. Never edit a skill through a symlink path in
docs — edit `ai/skills/<name>/SKILL.md`.

### Vendored skills

`playwright-cli` is **not hand-written**: it is rendered by `npm run sync:ai` from the copy shipped
inside `playwright-core`, so it always matches the installed Playwright version. Editing it directly
is reported as drift by `verify:ai` and overwritten on the next sync.

| To change                                  | Edit                                    |
| ------------------------------------------ | --------------------------------------- |
| Local additions (Golden Rules, repo notes) | `scripts/lib/playwright-cli.overlay.md` |
| Anything else                              | upstream — or stop vendoring it         |

It is excluded from Prettier (`.prettierignore`): reformatting upstream text would register as drift.
After upgrading Playwright, run `npm run sync:ai` and review the diff — that is how a renamed CLI
command becomes visible instead of silently rotting in the docs.

The three MCP configs are **rendered files, not symlinks** — hosts disagree on format, so they
cannot share one file. Edit `ai/mcp/servers.json` and run `npm run sync:ai`; hand edits are
reported as drift by `verify:ai`. Usage guide: `ai/mcp/README.md`.

## Health check

```bash
npm run verify:ai
```

Checks symlink integrity (including Windows checkouts where symlinks degrade to text files), skill
frontmatter, generated-file drift, and dead cross-references.
