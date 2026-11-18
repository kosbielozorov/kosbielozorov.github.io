# Playwright + AI — test automation boilerplate

Reusable Playwright/TypeScript skeleton with POM + API-controller facades, fixtures, and an AI
layer (skills, MCP servers, framework contract) — universal for both UI and API testing.

**Everything lives in this directory and stays here.** Open or `cd` into it to work — nothing is
written to the surrounding repository, so dropping this package into a product repo does not
touch the developers' setup.

Ships with two **working, swap-out examples** so `npm test` passes out of the box with zero
secrets — a UI example (`tests/ui/login.test.ts` against `the-internet.herokuapp.com`) and an API
example (`tests/api/posts.*.ts` against `jsonplaceholder.typicode.com`). Replace both with your own
app/API when adopting the boilerplate for a real project (see "First project checklist" below).

## Quick start

```bash
cp .env.example .env   # demo defaults work as-is; point at your own app/API later
npm install
npx playwright install # or: npx playwright install chromium (authoring only)
npm test               # chromium — create / debug
npm run verify         # typecheck + contract lint + format + AI-layer integrity
```

## Layout

| Path                                           | Purpose                                               |
| ---------------------------------------------- | ----------------------------------------------------- |
| `app/`                                         | POM / API / fixtures / constants                      |
| `tests/`                                       | `*.test.ts` specs (`tests/ui/`, `tests/api/`)         |
| `specs/`                                       | Planner test plans (`*.md`)                           |
| `ai/`                                          | AI layer — binding, contract, skills, MCP             |
| `scripts/`                                     | `sync:ai` / `verify:ai` / `catalog:generate` / `gaps` |
| `AGENTS.md`                                    | Entry point for every AI tool                         |
| `.claude/`, `.cursor/`, `.vscode/`, `.github/` | Generated loaders — see `ai/README.md`                |

## First project checklist

1. Fill `.env` (`DEV_BASE_APP_URL`, `DEV_API_URL`, API keys, optional `TESTOMATIO` reporter key) —
   replacing the shipped public-demo defaults.
2. Delete or replace both **example sets** with your own — every part is marked **EXAMPLE**, every
   example test is tagged `@example`, and the full file lists are in `ai/project.md` → Examples:
   the UI set (`app/ui/pages/Login.page.ts` and `SecureArea.page.ts`, the plan `specs/login-ui.md`
   and their `PageManager` registrations) and the API set (`app/api/controllers/Posts.controller.ts`, its plan
   `specs/posts-api.md`, its `ControllersManager` registration, plus the colocated
   `app/api/schemas/post.schema.ts` and `app/api/interfaces/post.interface.ts`); add
   more under `app/ui/pages/*.page.ts` → register on `PageManager`, and `app/api/controllers/` →
   register on `ControllersManager`. Reusable components (`app/ui/components/ProgressBar.component.ts`,
   `Toast.component.ts`) are generic, opt-in framework pieces, not app-specific examples — keep
   whichever match UI chrome your app actually has, and delete the rest (e.g. no toast
   notifications in your app → delete `Toast.component.ts`).
3. Replace `tests/ui/login.test.ts` and `tests/api/posts.*.ts` with your own tests in
   `tests/**/*.test.ts`, importing `test` / `expect` from `app/fixtures`.
4. Run `npm run catalog:generate` before adding new pages/controllers to check what already
   exists (`specs/framework-catalog.md`).
5. Read `AGENTS.md` → `ai/project.md` → `ai/instructions/02-architecture.md`.

## AI / MCP

- Skills are generated from `ai/skills/` into `.claude/skills/` and `.cursor/skills/`.
- MCP servers are generated from `ai/mcp/servers.json` into `.mcp.json`, `.cursor/mcp.json`,
  `.vscode/mcp.json`. Export `TESTOMATIO_MCP_TOKEN` and `TESTOMATIO_PROJECT` in your shell; never
  commit tokens. Guide: `ai/mcp/README.md`.
- After editing either source, run `npm run sync:ai`. `npm run verify` fails on drift.
- `npm run handoff -- init|check <feature>` creates / checks `.work/<feature>/handoff.md`, the
  shared state of one feature across steps; `check` compares its gap plan with `npm run gaps`
  (`ai/instructions/08-handoff.md`).
- `npm run gaps [-- <path>]` type-checks tests (default `tests/`, or a draft under `.work/`) and
  lists every fixture / page / controller / method a test calls that does not exist yet — the
  test-first gap list (skill `playwright-test-creator` → Test first, then gaps).
- `npm run catalog:generate` writes `specs/framework-catalog.md` (gitignored) — every concrete
  Page/Component/Modal/Controller with its class summary and public method signatures, read by
  `generate-pom-skeleton` / `generate-controller-skeleton` before creating a new file.

## Conventions (short)

- Import `test`/`expect` from `app/fixtures`, not `@playwright/test`, in `*.test.ts`.
- No raw selectors in tests; no XPath; no `waitForTimeout` (`Component.wait()` is the only
  sanctioned wrapper). These are enforced by `npm run lint:contract`, not just documented.
- Prefer Chrome/`chromium` for creating and debugging; `npm run test:browsers` for cross-browser.
