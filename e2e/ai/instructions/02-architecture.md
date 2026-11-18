# Architecture and Structure

## Framework contract (authoritative)

These rules apply to all tests and generated code. Other instruction files, rules, and agents should **link here** instead of repeating the same bullets.

Project paths, fixture names, and file placement: `../project.md`.

**Enforced by ESLint, not by good intentions.** `npm run lint:contract` fails on: importing `test`/`expect` from `@playwright/test` in `*.test.ts`, raw selectors in tests, XPath, `page.waitForTimeout()` in tests, `toHaveClass(/regex/)`, a test without exactly one of `@T<id>` / `@unlinked` in `tag: []` (see **Test ids**), and a test without exactly one valid `source` annotation (see **Map and oracle**), and a test that opens a page by hand although its `opened<Page>` fixture exists (see **Imports and fixtures**). Full gate before commit: `npm run verify`.

### Imports and fixtures

- In `*.test.ts` (and test files generally), **never** import `test` or `expect` from `@playwright/test`.
- **Always** import from fixtures via the `@fixtures` path alias: `import { test, expect } from '@fixtures';` — works from any file depth, no relative `../` counting. Same for shared constants via `@constants`. Both are declared in `tsconfig.json` → `compilerOptions.paths`; see project binding.
- Exception: the UI setup project `tests/ui/auth.setup.ts` (when introduced) may import from `@playwright/test`.
- In Page Objects and shared helpers, importing from `@playwright/test` is allowed where needed for types or APIs.
- **Opened-page fixture — only when it is needed (YAGNI).** Registering a page does **not** add a fixture. Once **three or more** tests start by opening the same page with a bare `await <page>.open()`, add `opened<Page>` to the primary fixture file (`opened<Page>: async ({ pageManager: { <page> } }, use) => { await <page>.open(); await use(<page>); }`), document it in the binding, and switch those tests to `async ({ opened<Page>: <page> }) => …`.
- **Once `opened<Page>` exists, use it.** A test whose first statement is a bare `await <page>.open()` while `opened<Page>` exists fails `contract/opened-page-fixture`. Keep an explicit `open()` when something must happen **before** the load (`watchProblems()`, a fixed clock, stored state), when `open()` takes an argument (another path), or when the page opens mid-test.

### Selectors and locators

- **No hardcoded selector strings in tests** — tests call POM / component methods only. Never put `page.locator('…')` (or raw CSS/role strings) in `*.test.ts`.
- **POM: declare locators on the class** — expose them as class fields (e.g. `readonly`) or assign them in the **constructor**. Do not recreate the same static `this.page.locator(...)` inside methods on every call; methods use class locator members.
- **Default (page-/component-private):** put the selector **inline on the POM field**. Do not invent a constants file that only wraps a single private locator (avoids `CONST` + `this.page.locator(CONST)` duplication).

```ts
private readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
private readonly searchField = this.page.locator('input[name="search_string"]');
```

- **Use `app/constants/` only when shared** — same selector / template is used by **2+** pages, components, or helpers; or it is a reusable dynamic template (e.g. row-by-id). Prefer semantic strategies: `getByRole`, `getByLabel`, `getByText`, `getByTestId`, scoped when needed (toolbar vs modal).
- **Forbidden:** XPath (`locator('xpath=…')`, `locator('//…')`).
- **Avoid RegExp in locators and class assertions** — do not use `RegExp` in `getByRole` / `getByText` / `locator` / `filter({ hasText })` for targeting, and do not use `toHaveClass(/active/)`. Prefer exact strings, `exact: true`, scoping (parent locator), or `hasText: 'literal'`. To assert a class among others use `toContainClass('active')` / `.not.toContainClass('active')` (Playwright 1.52+). Use `toHaveClass` only for an exact full `class` attribute match.
- **Exception:** truly dynamic locators (e.g. row by variable id) may be built inside a method. Prefer a shared constant/template only if the pattern is reused; otherwise keep the strategy local to the method/POM.

### Waiting and assertions

- **Forbidden:** `await page.waitForTimeout(n)`.
  **Single exception:** `Component.wait()` — sanctioned wrapper for waiting on backend processing when no observable UI/network signal exists. Do not add new `waitForTimeout` calls outside this wrapper.
- Prefer web-first assertions (`await expect(locator).toBeVisible()`, etc.), `page.waitForLoadState()`, or `locator.waitFor()` as needed.

### Page Object methods

- **JSDoc** is required on **public** POM methods: short description of the user-facing action; document `@param` / `@returns` only for parameters and return values the method itself accepts or returns (`page` usually comes from the constructor — do not invent a fake `@param page`).
- **Atomic methods:** one POM method = one user-facing action (see also `01-fundamental-principles.md`).
- Before adding a new POM method or helper, search for existing similar logic (DRY, YAGNI).

### Test ids (Testomatio)

**Format.** A real id is written exactly as Testomatio prints it — the prefix plus 8 lowercase
characters, **no brackets**: `@T8acca9cb` (test), `@S1a2b3c4d` (suite). In these docs `@T<id>` /
`@S<id>` mark where a real id goes; they are never ids themselves.

- Every `test(...)` carries **exactly one** of, in its `tag: []` option:
  - a **real** `@T<id>` — resolved or created via skill `testomatio-mcp`, also written in the title;
  - **`@unlinked`** — no TMS case exists yet. Tag-only (not in the title).
- **Never invent** `@S` / `@T` ids, and never use a fake placeholder such as `@T[ID]` / `@T<testId>`.
  `@unlinked` is the only sanctioned "no id yet" state. **[lint: `contract/test-id-tag`]** — it accepts
  only `@T` + 8 lowercase chars and rejects anything id-shaped that is not (`@T[ID]`, `@T<id>`,
  `@T123`).
- **Retag:** when a case is created for an `@unlinked` test, replace `@unlinked` with the real `@T<id>`
  in `tag: []` and add the id to the title. Change nothing else in the test.
- Every `@…` token in a title must also be in `tag: []`. Full tag list: `03-writing-tests.md` §6.

### Test data and parallel runs

- Use unique, parallel-safe data (e.g. Faker). Full checklist: `03-writing-tests.md`.

### Map and oracle (where values come from)

The application (live DOM, snapshot, app source) is the **map**: it tells a test _how to reach_ the UI.
The requirement (spec in `specs/*.md`, TMS case, AC, API contract) is the **oracle**: it tells a test
_what is correct_. A product bug enters the suite when an expected value is copied from the map.

| May come from the app (map)                              | Must come from a requirement (oracle)                     |
| -------------------------------------------------------- | --------------------------------------------------------- |
| Routes, roles and accessible names used to find elements | Texts, values and messages an assertion checks            |
| Test ids, attributes, request paths and their types      | Visibility rules, calculations, sort order, defaults      |
| Locator structure (scoping, parent containers)           | Status codes, error messages, response fields and meaning |

- Every expected value in a test or assertion method traces to its requirement — the scenario in
  `specs/<feature>.md` (its **Expected** lines) or the TMS case. No requirement → ask; do not take it
  from the app.
- Every test names that requirement in exactly one `source` annotation **[lint: `contract/test-source`]**:
  - `{ type: 'source', description: 'specs/<feature>.md#<N.M>' }` — the file must exist and have a
    `#### N.M` scenario heading;
  - `{ type: 'source', description: '@T<id>' }` — the TMS case is the requirement; it must be the
    test's own `@T<id>` tag.
- Scenario numbers are references: never renumber a scenario that a test cites. Add new scenarios at
  the end of their suite.
- When the app and the requirement disagree, it is a **finding**, not a test fix: report it and pin the
  test (see **Healing** → product defect). Never "fix" a test by copying the current app value.
- **No requirement at all (legacy app)** → skill `characterize-feature`. An observation of the app
  becomes a requirement only when a human **confirms** it: the Expected line then carries
  `(O-n; confirmed by <who>, <YYYY-MM-DD>)` (checked by `npm run handoff -- check`). An unconfirmed
  observation never reaches a functional test — only characterization scaffolding (below).

### Characterization scaffolding (legacy zones only)

Temporary tests that pin the **current** behaviour of a legacy zone until functional tests cover it.
They are not an oracle: a red result means "behaviour changed", and a human decides whether to
update the snapshot or file a bug.

- Live in `tests/characterization/`, run only by `npm run test:characterization` (nightly, never in
  PR runs — the main config ignores the folder).
- Carry `@characterization` (and `@unlinked`); `source` is the zone: `specs/app-map.md#Z-<n>`. No other
  test may carry the tag or cite the app map **[lint: `contract/characterization`, `contract/test-source`]**.
- Assert **only** with `expectAriaSnapshot(name)` (`BasePage`) and `expectResponseShape(response,
name)` (`BaseController`) **[lint: `contract/characterization`]**; no screenshots.
- Before the zone's Gate 1 they only open a page and snapshot it, through the generic
  `pageManager.anyPage` (`app/ui/pages/Any.page.ts`) — no framework code is written before a human
  confirms the zone. `anyPage` is for scaffolding only **[lint: `contract/characterization`]**.
- AI never updates a snapshot (`--update-snapshots` is a human decision).
- Deleted, with their snapshots, when the zone's functional tests pass Gate 3 (app map status
  `covered`; `partial` when only some entry points are covered); `npm run characterization:check` warns about scaffolding of a covered zone.

### Healing (when fixing failures)

**First classify the failure** with concrete evidence (trace, error, live re-check — skill `trace-triage`):

| Class           | Meaning                                                             | Action                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **test**        | Locator, POM method, fixture or test code no longer matches the app | Heal in the order below                                                                                                                                                                          |
| **product**     | The app behaves differently from the requirement (**oracle**)       | Do **not** heal. Report it; ask the user for the bug id; pin with `test.fail()` + `@bug-<id>` in `tag: []`, write its brief `specs/known-defects/<id>-<slug>.md`. Expected value stays unchanged |
| **data**        | Test data collides, is missing, or is not parallel-safe             | Fix the data / fixture, not the assertion                                                                                                                                                        |
| **environment** | App, API, network or credentials unavailable                        | Report as `blocked`. A blocked run is never "passed"; do not add retries or timeouts to mask it                                                                                                  |

Unsure between **test** and **product** → ask the user; do not pick the one that makes the run green.

For a **test** failure, apply fixes in this order:

1. **Page Objects / components / modals** — update locator fields (inline by default) or methods under `app/ui/pages/*`, `app/ui/components/*`, `app/ui/modals/*`.
2. **`app/constants/*`** — only if the selector is shared (2+ consumers) or a reusable template.
3. **Test** (`tests/**/*.test.ts`) — only if the POM cannot represent the action/assertion.

**Must not when healing:** change an expected value (text, status code, count, message) unless the requirement itself changed — cite it; drop `@S` / `@T` / `@unlinked` or category tags; add `waitForTimeout`; remove existing `Component.wait()` calls (sanctioned exception — see Waiting and assertions); disable assertions; switch tests to `@playwright/test` imports.

---

## General Principles

### 1. Structure and Architecture

- Always use Page Object Model (POM) — each page has its own class in `app/ui/pages/`; register on `PageManager`
- Use fixtures for dependency injection — UI via `PageManager`, API via `ControllersManager` (`app/fixtures/index.ts`)
- Use package-root `helpers/`, `utils/`, and `lib/` (e.g. reporters) for reusable non-POM logic
- API response/body `Joi` schemas live in `app/api/schemas/`, colocated with their controller as its contract — not under `helpers/` (they document one controller's API, unlike package-root helpers)
- Concrete paths and fixtures: `../project.md`

### 2. Page Objects

- Each Page Object has a constructor that accepts `page` from Playwright (via `PageHolder` / `PageManager`)
- Atomic methods and required JSDoc: **Framework contract** above; deeper rationale: `01-fundamental-principles.md`
- Locators are **declared on the class** (fields and/or constructor); see **Selectors and locators** in the Framework contract
- Methods should return data when possible
- **YAGNI**: Don't create methods "for the future" — add only what is used now.
  Source: https://playwright.dev/docs/pom

### 3. Selectors and Locators

- Policy (inline POM locators by default; constants only when shared; no raw strings in tests): **Framework contract** above.
- Use `page.locator()` instead of `page.$()` or `page.$$()`
- For expectations use `expect(locator).toHaveText()`, `expect(locator).toBeVisible()`, etc. Source: https://playwright.dev/docs/best-practices#use-web-first-assertions

### 4. Modals and components

- **Components** (`app/ui/components/*.component.ts`) — reusable UI fragments; extend `Component` (`app/ui/components/Base.component.ts`)
- **Modals** (`app/ui/modals/*.modal.ts`) — dialog POMs; extend `BaseModal` (`app/ui/modals/Base.modal.ts`), which extends `Component`
- Do **not** nest modals under `components/` — flat sibling folders: `ui/components/` and `ui/modals/`
- Use composition — Page Objects hold component/modal instances
- Register pages on `PageManager`; components/modals are composed into pages (not registered on the facade)

### 5. API controllers

- Controllers live in `app/api/controllers/`; register on `ControllersManager`
- Base: `BaseController` — takes Playwright `APIRequestContext`
- API tests use the `controllersManager` fixture (not UI page objects)
- Response/body TS types live in `app/api/interfaces/` (`*.interface.ts`), colocated with the
  controller like `app/api/schemas/` — import via `@interfaces/*`. Add one when the response shape
  is non-trivial or reused; a one-off single-field response can stay inline (YAGNI)
- **Assert status codes and error messages via the inherited `expectResponseStatusCode()` /
  `expectResponseErrorMessage(s)()`** (`Base.controller.ts`, exposed on `controllersManager`) —
  never a raw `expect(response.status()).toBe(...)`. See `06-examples.md`.

### 6. Reusability (with KISS and YAGNI in mind)

- Extract reusable logic into helpers or Page Object methods **only if it is really repeated**
- **YAGNI**: Don't create abstractions "just in case" — only when there are at least 2–3 places of use
- Create base classes for shared functionality (e.g., `BaseModal`) **only if it simplifies the code**
- Use composition instead of inheritance when possible
- **KISS**: Simple code copying is better than complex abstraction if usage is one-time
