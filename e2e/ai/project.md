# Playwright Test Creator — project binding

This file describes the structure of this test package for AI skills and agents. The package is self-contained: open or `cd` into it, and nothing outside it is written to.

**Authority split:**

- **Project facts** (this file) — paths, fixtures, facade, tags, placement.
- **Framework contract** — `ai/instructions/02-architecture.md` (imports, selectors, waits, JSDoc, healing). Do not duplicate the contract here.

## Project identity

| Field              | Value                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Project label**  | E2E tests of the portfolio site kosbielozorov.github.io (React + Vite, en / uk), Playwright + AI                |
| **Language**       | TypeScript (ESM, `"type": "module"`)                                                                            |
| **Test runner**    | `@playwright/test` with custom extended `test` (`app/fixtures/index.ts` extends `test` and re-exports `expect`) |
| **App layer root** | `app/` (not `framework/`)                                                                                       |

## Architecture

| Concept                      | Value                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page facade class**        | `PageManager`                                                                                                                                                                    |
| **Facade module**            | `app/ui/pages/PageManager.ts` — register pages as `public myPage = new MyPage(this.page)`                                                                                        |
| **Base class chain (pages)** | `PageHolder` → `Component` → `BasePage` → concrete `*.page.ts` (under `app/ui/pages/`)                                                                                           |
| **PageHolder**               | `app/ui/pages/PageHolder.ts` — root abstract base; holds Playwright `page`                                                                                                       |
| **Components base**          | `Component` (`app/ui/components/Base.component.ts`) — minimal: `mainTitle`, `isLoaded`, `wait`, `reload`                                                                         |
| **Opt-in components**        | `ProgressBarComponent`, `ToastComponent` — compose into a page only if the app has that chrome; never on the base                                                                |
| **Pages base**               | `BasePage` (`app/ui/pages/BasePage.ts`) extends `Component` — `pagePath`, `open()`, page helpers                                                                                 |
| **Modals base**              | `BaseModal` (`app/ui/modals/Base.modal.ts`) extends `Component`                                                                                                                  |
| **API controllers facade**   | `ControllersManager` (`app/api/controllers/ControllersManager.ts`)                                                                                                               |
| **Base class chain (API)**   | `BaseController` → concrete `*.controller.ts` (under `app/api/controllers/`), composed into `ControllersManager`                                                                 |
| **API controllers base**     | `BaseController` (`app/api/controllers/Base.controller.ts`) — `getReq`/`postReq` (auth'd requests, shared `ApiKey`), `expectResponseStatusCode`, `expectResponseErrorMessage(s)` |

```
PageHolder (app/ui/pages/PageHolder.ts)
└── Component (app/ui/components/Base.component.ts)
    ├── BasePage (app/ui/pages/BasePage.ts)
    │   └── concrete `*.page.ts`
    └── BaseModal (app/ui/modals/Base.modal.ts)
        └── concrete `*.modal.ts`
```

```
BaseController (app/api/controllers/Base.controller.ts)
├── ControllersManager (app/api/controllers/ControllersManager.ts) — facade
└── concrete `*.controller.ts` (e.g. `PostsController`)
    — composed into ControllersManager as `public xController = new XController(this.request)`
```

**Keep this table in sync.** Adding or changing a **base or facade class** (a new abstract base
under `app/ui/*` / `app/api/*`, or a new facade alongside `PageManager` / `ControllersManager`) —
update the matching row(s) and chain diagram above in the same change. Concrete `*.page.ts` /
`*.component.ts` / `*.modal.ts` / `*.controller.ts` classes do **not** need a row here — those are
covered by the generated `specs/framework-catalog.md` (`npm run catalog:generate`).

## Fixtures

| Field                    | Value                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary fixture file** | `app/fixtures/index.ts`                                                                                                                                                                                                   |
| **Test import rule**     | In `tests/**/*.test.ts`, import `test` / `expect` from `@fixtures` (alias, not a relative path — see Import path rules), **not** from `@playwright/test`. Exception: `tests/ui/auth.setup.ts` may use `@playwright/test`. |

### Built-in fixtures (current)

| Fixture              | Type                 | Starts on / notes                                                                                                                                                                           |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pageManager`        | `PageManager`        | No automatic login; uses provided `page`.                                                                                                                                                   |
| `controllersManager` | `ControllersManager` | API layer; uses Playwright `request`.                                                                                                                                                       |
| `openedHomePage`     | `HomePage`           | Opens `/` first. For a test that sets something up before the load (`watchProblems`, `fixClockAt`, `storeLanguageBeforeLoad`) or opens another path, use `pageManager.homePage` + `open()`. |
| `openedResumePage`   | `ResumePage`         | Opens `/my-resume` first — same rule.                                                                                                                                                       |
| `openedNotFoundPage` | `NotFoundPage`       | Opens an unknown path first — same rule.                                                                                                                                                    |

Prefer `pageManager` for UI and `controllersManager` for API. Destructure Page Objects from `PageManager` once pages are registered (e.g. `pageManager: { homePage }`). Additional fixtures — add in `app/fixtures/index.ts` and document them here. `opened<Page>` (a page already opened) is added only once three or more tests start by opening that page (Framework contract → Imports and fixtures); `contract/opened-page-fixture` then keeps tests on it.

## Import path rules

Path aliases (`tsconfig.json` → `compilerOptions.paths`), resolved by both `tsc` and Playwright's
own transform at any file depth — no relative `../` counting, and moving a file into a feature
subfolder never breaks these imports:

| Alias            | Resolves to             | Use for                                                                                                                                        |
| ---------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `@fixtures`      | `app/fixtures`          | `import { test, expect } from '@fixtures';` in every `tests/**/*.test.ts` — **never** `@playwright/test` (exception: `tests/ui/auth.setup.ts`) |
| `@constants`     | `app/constants`         | Shared constants (`DEV_BASE_URL`, `API_URL`, ...) from any test or `app/**` file                                                               |
| `@constants/*`   | `app/constants/*`       | A specific shared file, e.g. `import { headerSelectors } from '@constants/header.selectors';`                                                  |
| `@pages/*`       | `app/ui/pages/*`        | A concrete `*.page.ts` importing `BasePage`: `import { BasePage } from '@pages/BasePage';`                                                     |
| `@components/*`  | `app/ui/components/*`   | A concrete `*.component.ts` importing `Component`: `import { Component } from '@components/Base.component';`                                   |
| `@modals/*`      | `app/ui/modals/*`       | A concrete `*.modal.ts` importing `BaseModal`                                                                                                  |
| `@controllers/*` | `app/api/controllers/*` | A concrete `*.controller.ts` importing `BaseController`: `import { BaseController } from '@controllers/Base.controller';`                      |
| `@schemas/*`     | `app/api/schemas/*`     | A `*.schema.test.ts` importing its schema: `import { postSchema } from '@schemas/post.schema';`                                                |
| `@interfaces/*`  | `app/api/interfaces/*`  | A `*.controller.ts` importing its response type: `import { Post } from '@interfaces/post.interface';`                                          |

**Scope — only the imports whose relative depth actually varies.** These aliases exist for a
concrete leaf file (which may later move into a feature subfolder, e.g. `app/ui/pages/auth/`) that
imports its **Base class at a fixed location** (`BasePage`, `Base.component`, `Base.modal`,
`Base.controller`), and for tests reaching `@fixtures`/`@constants`/`@schemas` from any nesting
depth under `tests/`.

**Do not alias the other direction.** A facade importing a concrete class it composes
(`PageManager` → `./Login.page`, `ControllersManager` → `./Posts.controller`) and a base class
importing a sibling base class (`Base.component.ts` → `../pages/PageHolder`, `BasePage.ts` →
`../components/Base.component`) both stay **plain relative imports** — neither side of those moves
independently, so there is no depth to get wrong. Adding aliases there would be premature (YAGNI).

Types from `@playwright/test` (e.g. `Locator`, `APIResponse`) remain a normal, allowed import in
`app/ui/**` and `app/api/**` — only `test`/`expect` in `*.test.ts` is restricted.

## File placement

| Artifact                     | Directory                                | Filename pattern                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI e2e tests                 | `tests/ui/` (or `tests/ui/<feature>/`)   | `*.test.ts` (`playwright.config.ts` → `testMatch: **/*.test.ts`)                                                                                                                                                                                                                                               |
| API e2e / functional tests   | `tests/api/` (or `tests/api/<feature>/`) | `*.test.ts` — status codes, errors, pagination/sorting/filtering; **not** schema assertions                                                                                                                                                                                                                    |
| API schema / contract tests  | `tests/api/`                             | `<feature>.schema.test.ts` — one dedicated file per schema/feature (e.g. `product.schema.test.ts`), or a single `schema.test.ts` if the set is small; never mixed into functional `*.test.ts`                                                                                                                  |
| Seed (Planner / agents)      | `tests/`                                 | `seed.spec.ts` (when introduced)                                                                                                                                                                                                                                                                               |
| Auth / setup                 | `tests/ui/`                              | `auth.setup.ts` (when introduced) — UI session state only; API auth is per-request `ApiKey` header, no setup file                                                                                                                                                                                              |
| Test plans (Planner)         | `specs/`                                 | `*.md` (when introduced); generated: `framework-catalog.md` (`npm run catalog:generate`, gitignored)                                                                                                                                                                                                           |
| Page objects                 | `app/ui/pages/`                          | `*.page.ts` (bases: `PageHolder.ts`, `BasePage.ts`; facade `PageManager.ts`)                                                                                                                                                                                                                                   |
| Components                   | `app/ui/components/`                     | `*.component.ts` (extend `Component` from `Base.component.ts`; composed into pages)                                                                                                                                                                                                                            |
| Modals                       | `app/ui/modals/`                         | `*.modal.ts` (extend `BaseModal` from `Base.modal.ts`; **not** under `components/`)                                                                                                                                                                                                                            |
| API controllers              | `app/api/controllers/`                   | `*.controller.ts`; facade `ControllersManager`                                                                                                                                                                                                                                                                 |
| API response/body schemas    | `app/api/schemas/`                       | `*.schema.ts` (`Joi`) — one per `components.schemas` type; colocated with `app/api/controllers/` as its contract, not a POM/Controller class itself                                                                                                                                                            |
| API response/body interfaces | `app/api/interfaces/`                    | `*.interface.ts` (TS `interface`) — typed shape for a controller's response, colocated with `app/api/controllers/`; add when a response is non-trivial or reused, not for every one-field response                                                                                                             |
| Selector & env constants     | `app/constants/`                         | `*.constants.ts` for **shared** only; barrel `index.ts` (`env.constants.ts` → `DEV_BASE_URL`, API vars)                                                                                                                                                                                                        |
| Test data builders / cases   | `data/`                                  | `*.ts` (create when needed)                                                                                                                                                                                                                                                                                    |
| Upload fixtures              | `uploads/`                               | per feature (create when needed)                                                                                                                                                                                                                                                                               |
| Helpers                      | `helpers/`                               | `*.ts` (reusable non-POM logic; create when needed)                                                                                                                                                                                                                                                            |
| Utils                        | `utils/`                                 | `*.ts`                                                                                                                                                                                                                                                                                                         |
| Shared utilities / reporters | `lib/`                                   | `*.ts` (e.g. `slowStepReporter.ts`; wired in `playwright.config.ts`)                                                                                                                                                                                                                                           |
| AI layer (canon, skills)     | `ai/`                                    | `project.md`, `instructions/*.md`, `skills/*/SKILL.md`, `templates/*.md` — see `ai/README.md`                                                                                                                                                                                                                  |
| Characterization scaffolding | `tests/characterization/`                | `<feature>.test.ts` — legacy zones only, `@characterization`, nightly (`npm run test:characterization`, `playwright.characterization.config.ts`); pages opened through the generic `pageManager.anyPage`; snapshots next to it; deleted once the zone is covered (contract → **Characterization scaffolding**) |
| Known defects                | `specs/known-defects/`                   | `<BUG-ID>-<slug>.md` — one brief per known product defect (`ai/templates/known-defect.template.md`), linked from the spec's **Known defects**; deleted with the pin when fixed                                                                                                                                 |
| App map (legacy)             | `specs/`                                 | `app-map.md` — zones of a legacy app (`ai/templates/app-map.template.md`, skill `characterize-feature`); observations, never an oracle                                                                                                                                                                         |
| Feature working files        | `.work/<feature>/`                       | `handoff.md` (`npm run handoff -- init <feature>`, format `ai/instructions/08-handoff.md`) and `*.test.ts` drafts for `npm run gaps -- .work/<feature>/` — gitignored, excluded from typecheck / lint / format; move drafts to `tests/` once the gap list is closed                                            |
| Repo tooling scripts         | `scripts/`                               | `*.mjs` (`sync-ai.mjs`, `verify-ai.mjs`, `gaps.mjs`, `handoff.mjs`, `characterization.mjs`) — not test code                                                                                                                                                                                                    |
| App config                   | `app/config/`                            | `*.ts` (create when needed)                                                                                                                                                                                                                                                                                    |
| Saved auth state             | `.auth/`                                 | `*.json` (do not commit secrets)                                                                                                                                                                                                                                                                               |

## Legacy sources (characterization flow)

Optional — fill in only for a legacy app covered with skill `characterize-feature`. Every source
here gives **observations**, never requirements.

| Source                | Value                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **App source code**   | `../src` (React components, routes in `../src/App.jsx`, texts in `../src/info/`, `../src/locales/`) — read-only                          |
| **OpenAPI / Swagger** | none (static site, no API)                                                                                                               |
| **Old docs / TMS**    | none                                                                                                                                     |
| **Exploration env**   | local Vite dev server `http://localhost:5173` (`DEV_BASE_APP_URL`), started by `playwright.config.ts` → `webServer`; never the live site |
| **Signed-in access**  | none — the site has no sign-in                                                                                                           |

## Test management / tags

| Field             | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID scheme**     | Testomatio, written as Testomatio prints them — no brackets (`@S1a2b3c4d`, `@T8acca9cb`): `@S<suiteId>` on `test.describe`, `@T<testId>` on `test` — or `@unlinked` on `test` while no TMS case exists; categories: `@smoke`, `@sanity`, `@regression`, `@critical`, `@a11y`, `@quarantine`, `@slow`, `@example` (shipped swap-out example — see Examples), `@characterization` (legacy scaffolding under `tests/characterization/` only), `@keyboard` (Tab-order tests — left out of the webkit project, which does not move Tab focus to links and buttons), etc. |
| **Tag placement** | In the **title** string **and** in the **`tag: []`** option; `@unlinked` and `@bug-<id>` only in `tag: []`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Ids source**    | Real ids via Testomatio MCP / `testomatio-mcp` — do not invent `@S` / `@T`; use `@unlinked` instead. **Not** for UI selectors/locators                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Examples (swap-out — not project code)

The package shipped two **example sets** — UI and API; only the API set is kept. Each shows the full chain (plan → Page Object
/ controller → test) and keeps `npm test` green with zero secrets. They are **not** a model of the
product under test.

**UI example set:** removed on adoption — the portfolio site replaced it.

**API example set** (jsonplaceholder.typicode.com):

| Part                 | File                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Plan (oracle)        | `specs/posts-api.md`                                                                       |
| Controller           | `app/api/controllers/Posts.controller.ts`                                                  |
| Facade registration  | `postsController` field in `app/api/controllers/ControllersManager.ts`                     |
| Schema / interface   | `app/api/schemas/post.schema.ts`, `app/api/interfaces/post.interface.ts`                   |
| Tests                | `tests/api/posts.test.ts`, `tests/api/posts.schema.test.ts` — every test tagged `@example` |
| Environment defaults | `DEV_API_URL` in `.env.example` (demo API URL)                                             |

Every part carries an **EXAMPLE** marker (file header / JSDoc / banner). Rules for AI and humans:

- Use the sets as a **pattern reference** only. Do not extend `LoginPage` / `PostsController` or add
  methods to them for a real feature, and do not count their tests as product coverage (the
  coverage reviewers report each set on its own line, outside the verdict).
- On adoption, replace or delete **each set as a whole** in one change, plus its `.env` URL. Leaving
  half of a set behind breaks the chain the example exists to show.
- Exclude examples from a product run with `npx playwright test --grep-invert @example`.

## Rules (project-specific flags)

Full wording: **Framework contract** in `ai/instructions/02-architecture.md`. Flags only:

| Rule                                               | Enforced                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| XPath                                              | forbidden                                                         |
| `waitForTimeout` / arbitrary pauses in `*.test.ts` | forbidden (single exception: `Component.wait()` — see contract)   |
| Raw selector strings in tests                      | forbidden (call POM methods)                                      |
| Shared selector constants                          | only when reused by 2+ consumers; else inline on POM fields       |
| Test id per test                                   | exactly one real `@T<id>` or `@unlinked` (`contract/test-id-tag`) |
| Expected values                                    | from the requirement (oracle), never copied from the app          |
| Requirement link per test                          | one `source` annotation (`contract/test-source`)                  |

## Custom reference paths

| Document                          | Path                                         |
| --------------------------------- | -------------------------------------------- |
| Framework contract / architecture | `ai/instructions/02-architecture.md`         |
| Writing tests                     | `ai/instructions/03-writing-tests.md`        |
| Examples                          | `ai/instructions/06-examples.md`             |
| Best practices                    | `ai/instructions/04-best-practices.md`       |
| Playwright AI agents / MCP / CLI  | `ai/instructions/07-playwright-ai-agents.md` |

Cursor rule (thin pointer): `.cursor/rules/qa-playwright-tests.mdc`.

**Skills SSoT:** `ai/skills/` (symlinked into `.claude/skills/` and `.cursor/skills/` by `npm run sync:ai`). Catalog and tool parity: `ai/instructions/05-ai-usage.md`.

Skill refs `playwright-test-creator/references/{framework-patterns,examples}.md` are short inventories — still prefer this binding + `ai/instructions/` + live `app/` / `tests/`. Template for other repos: `ai/templates/project.binding.template.md`.

Static contract guard: `npm run lint:contract` (ESLint enforces imports, raw selectors, XPath, `waitForTimeout`, RegExp class assertions). Full gate: `npm run verify` — typecheck + contract + format + `verify:ai`.
