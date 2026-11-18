# AGENTS.md — Boilerplate of Test automation solution (Playwright/TypeScript + AI)

Single entry point for AI tools (Cursor, Claude, Copilot, Codex, etc.) working in this package.
This file is a **thin pointer** — do **not** restate the framework contract here.

## Read first (in order)

1. **Project binding** — `ai/project.md` (paths under `app/`, `PageManager` / `ControllersManager`, fixtures, tags, placement).
2. **Framework contract (authoritative)** — `ai/instructions/02-architecture.md` → **Framework contract** (imports, selectors, waits, JSDoc, healing).
3. **Writing tests** — `ai/instructions/03-writing-tests.md` (structure, tags, data).
4. **Examples** — `ai/instructions/06-examples.md` when generating or reviewing code.
5. **AI usage (universal)** — `ai/instructions/05-ai-usage.md` (prompts, skills catalog, tool notes).
6. **Fundamental principles** — `ai/instructions/01-fundamental-principles.md` as needed, when reasoning about class design or scope tradeoffs (KISS/YAGNI/DRY/SOLID rationale behind the contract).
7. **Best practices** — `ai/instructions/04-best-practices.md` as needed, for debugging/assertion style, DRY helpers, and naming conventions not already in the contract.

## Full index

- Fundamental principles (KISS/YAGNI/DRY/SOLID): `ai/instructions/01-fundamental-principles.md`
- Architecture & framework contract: `ai/instructions/02-architecture.md`
- Writing tests: `ai/instructions/03-writing-tests.md`
- Best practices: `ai/instructions/04-best-practices.md`
- AI usage (Cursor / Claude / Copilot): `ai/instructions/05-ai-usage.md`
- Examples: `ai/instructions/06-examples.md`
- Playwright AI agents / CLI → MCP: `ai/instructions/07-playwright-ai-agents.md`
- Handoff — shared state of one feature across steps: `ai/instructions/08-handoff.md`
- Legacy app without requirements: skill `characterize-feature` (contract → **Characterization scaffolding**)
- Mutation catalog — wrong-app probes for the adversarial subagents: `ai/instructions/09-mutation-catalog.md`

## Tooling (parity)

- **Self-contained package.** Everything the AI layer needs is inside this directory — open or `cd` here. Nothing is written outside it, so the surrounding repository stays untouched.
- **Canon is identical** for every tool. Loaders differ; rules and skills do not.
- **Skills SSoT:** `ai/skills/` — mirrored via symlinks into `.claude/skills/` and `.cursor/skills/` by `npm run sync:ai`. Catalog: `05-ai-usage.md`.
- **MCP servers:** `ai/mcp/servers.json` → generated `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`. Guide: `ai/mcp/README.md`.
- Copilot entry: `.github/copilot-instructions.md` (same canon).
- **playwright-cli (primary) → Playwright MCP (fallback):** required for UI inspection when available — `07-playwright-ai-agents.md`. Do not debug UI from screenshots/memory alone.
- **Testomatio MCP:** TMS only — real `@S`/`@T` (skill `testomatio-mcp`). **Never** for selectors/locators/DOM. Do not invent ids.
- Scratch files like repo-root `note*.md` are **not** guidance — ignore them; use `ai/instructions/` + binding.
