# CLAUDE.md

Work from this directory — it is self-contained. Nothing the AI layer needs lives outside it, so
the surrounding product repository is never touched.

See `AGENTS.md`. Same canon as Cursor and Copilot:

1. `ai/project.md` — project binding
2. `ai/instructions/02-architecture.md` → **Framework contract**
3. `ai/instructions/05-ai-usage.md` — skills catalog

Skills: `.claude/skills/*` → `ai/skills/*` (SSoT). MCP servers: `.mcp.json`, generated from
`ai/mcp/servers.json`. Regenerate both with `npm run sync:ai`; check with `npm run verify`.
