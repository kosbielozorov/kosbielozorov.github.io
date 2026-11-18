---
name: playwright-test-creator
description: Generate Playwright tests, Page Objects, components, API controllers, and fixtures for the test automation framework. Respects the markdown config `ai/project.md` when present (paths, facade class, fixtures, tag rules). Use this skill whenever the user asks to create, write, or generate any Playwright test (UI or API), including from a Testomat @T id, a new Page Object, component, fixture, API controller, or schema validation. Also use when the user mentions test automation, writing e2e tests, adding test coverage, creating test cases for a feature, or asks about the project's test patterns and conventions — even if they don't explicitly say "Playwright".
---

# Playwright Test Creator

Generate Playwright automation that matches the **active project's** binding and contract. Do **not** restate the framework contract in generated docs or chat — read and obey it.

## Authority (read first — do not duplicate)

1. **`ai/project.md`** (at the test package root, or a user-given path) — imports, placement, facade, fixtures, tags, rule flags.
2. **Framework contract** — Custom reference path from the binding (`ai/instructions/02-architecture.md`) → **Framework contract** (imports, selectors, waits, JSDoc, healing). If missing, use binding flags + discover from codebase.
3. **Examples / writing tests** — Custom paths from binding (`ai/instructions/06-examples.md`, `03-writing-tests.md`).
4. **Skill refs** (`references/framework-patterns.md`, `examples.md`) — short inventory/examples pointers; still prefer binding + `ai/instructions/` + live `app/` / `tests/`.
5. If binding is missing: offer `ai/templates/project.binding.template.md`, or proceed from codebase discovery.

## Before you start

1. Read binding → contract → examples (as above).
2. Identify artifact: **UI test**, **API test**, **Page Object**, **Component**, **Modal**, **Fixture**, **API Controller**, or **Schema** (skip API/schema if binding says `none`).
3. **Testomat `@T` given:** before code, follow `testomatio-mcp` → **Workflow A** (`tests_get`). Do not invent steps from the id alone.
4. **Need new TMS ids:** `testomatio-mcp` → **Workflow B**. Do not invent `@S`/`@T`. No TMS (or the user defers it) → tag the test `@unlinked` (Framework contract → **Test ids**).
5. **Expected values** come from the spec / TMS case (oracle), never from the live app (Framework contract → **Map and oracle**).

## UI discovery & triage

**Priority:** (1) `playwright-cli` → (2) Playwright MCP. Full policy: `ai/instructions/07-playwright-ai-agents.md`. Snapshot first; convert findings to POM (inline locators by default; shared constants only when reused). No raw selectors in tests.

## Check existing code (critical)

Before any new method/class/utility:

- Run `npm run catalog:generate` (fast, deterministic) and read `specs/framework-catalog.md` —
  every concrete Page/Component/Modal/Controller with its class summary and full public method
  list, without opening candidate files one at a time. `references/framework-patterns.md` covers
  the shared base-class methods the catalog doesn't (`Component`, `BasePage`, `BaseModal`,
  `BaseController`) — read both.
- Search existing pages/components/helpers in **this** repo for similar logic.
- Check constants directory from binding before adding selectors.

**Exists → use. Similar → extend/compose. Only create when nothing covers the need.**

## Test first, then gaps

For a new test that needs Page Objects / controllers / fixtures that do not exist yet:

1. Write the test **first**, calling the missing members as if they existed — business names, the
   shape the test wants (draft in `.work/<feature>/` when the plan is not approved yet).
2. Before writing it, list the members you expect to be missing (your **gap plan**).
3. Run `npm run gaps` (or `npm run gaps -- .work/<feature>/`). It type-checks and prints every
   `FIXTURE` / `PAGE` / `CONTROLLER` / `METHOD` gap.
4. The output must **equal** your gap plan. An extra entry means the test misspelled or renamed an
   existing member — fix the test, never create the member. A gap marked `similar to: <name>` is
   the usual suspect.
5. Implement exactly the gaps (POM / controller skeleton skills), then re-run until it reports
   `0 gap(s), 0 other error(s)`.

## Generating UI tests

Shape must match binding + contract + a live sibling test when one exists.

```typescript
import { test } from '@fixtures';

test.describe('Feature @S<suiteId> @smoke', { tag: ['@S<suiteId>', '@smoke'] }, () => {
  test(
    'Case @T<testId>',
    {
      tag: ['@T<testId>'],
      annotation: [{ type: 'source', description: 'specs/<feature>.md#1.1' }],
    },
    async ({ pageManager: {/* registered page from PageManager */} }) => {
      // Fixture + POM methods only — names from binding / PageManager
    },
  );
});
```

- Use **fixtures from the binding** (`pageManager`, `controllersManager`).
- Destructure Page Objects from the fixture/`PageManager` named in the binding.
- A test that starts on a page: if the binding lists `opened<Page>`, take it (`{ opened<Page>: <page> }`) instead of a first-step `await <page>.open()`. No such fixture yet → open by hand; when this test makes it the **third** one opening that page first, add the fixture (see **Creating fixtures**). Contract → **Imports and fixtures**.
- Tags in **title and** `tag: []`. One `source` annotation per test: `specs/<feature>.md#<N.M>` (the scenario) or its own `@T<id>` (Framework contract → **Map and oracle**). Data: parallel-safe (e.g. Faker) per contract / `03-writing-tests.md`.

## Generating API tests

Only if binding has API controllers / schemas. Otherwise say API layer is out of scope for this package. When present, follow binding paths and a sibling API test; validate with project schema helpers. Use `controllersManager` fixture.

## Creating Page Objects / components / modals

- Hierarchy and directories: **binding** (`PageHolder` → `Component` → `BasePage` under `app/ui/pages/`; components under `app/ui/components/`; modals → `BaseModal` under `app/ui/modals/` — **not** nested in `components/`).
- Locators / JSDoc / atomic methods: **Framework contract** — do not paste it here.
- Always register new pages on **`PageManager`** (`app/ui/pages/PageManager.ts`). Components/modals are composed into pages.
- Prefer skill `generate-pom-skeleton` for empty POM structure when appropriate.
- Check existing components/modals in-repo before creating duplicates.

## Creating fixtures

Extend `test` in the primary fixture file from the binding. Setup → `await use(value)` → cleanup if needed. Mirror existing fixture patterns in that file.

Add a fixture when tests need it, not ahead of them (YAGNI). The common case is `opened<Page>`: create it once three or more tests start with a bare `await <page>.open()`, move those tests onto it in the same change, and add a row to the binding's fixtures table. From then on `contract/opened-page-fixture` keeps new tests on it.

## File placement & imports

Use binding tables **File placement** and **Import path rules** only. App layer root is `app/` (not `framework/`).

## Anti-patterns

Obey contract + binding. Quick reminders (full detail in contract / `06-examples.md`):

| Avoid                                                  | Do instead                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `test`/`expect` from `@playwright/test` in `*.test.ts` | Import from `@fixtures` alias (binding → Import path rules) |
| `waitForTimeout` / XPath / raw selectors in tests      | Web-first waits; POM methods; semantic locators             |
| Locators recreated inside methods                      | Class fields (inline by default; constants if shared)       |
| Invented `@S`/`@T`                                     | `testomatio-mcp` (TMS only — never for locators)            |
| Testomatio for selectors/DOM                           | `playwright-cli` → Playwright MCP                           |
| Duplicate base/POM methods                             | Search first                                                |
| Heal by editing test first                             | Contract **Healing**: POM → shared constants → test         |
| Change expected value to match the app                 | Classify first (contract **Healing**); product → pin + ask  |
| Fake `@T[ID]` placeholder                              | `@unlinked` in `tag: []`                                    |

## Validation loop

1. Run the changed test(s) — Chrome/chromium unless the user asks otherwise.
2. On failure: `trace-triage` + live re-check (**CLI first**, MCP second) if reachable; classify (test / product / data / environment) and act per contract **Healing**; re-run. Environment unreachable → report `blocked`, never done.
3. Pass before presenting as done. For flaky suspects: `--repeat-each` / workers as needed.

## Quality checklist

- [ ] Binding + contract read; no contract duplication in output
- [ ] Existing methods/POMs searched
- [ ] Imports / placement / fixtures from binding
- [ ] Tags in title + `tag: []`; real `@T` or `@unlinked` (`npm run lint:contract`)
- [ ] One `source` annotation pointing at an existing scenario or the test's own `@T` (`npm run lint:contract`)
- [ ] Every expected value traces to the spec / TMS case
- [ ] No `waitForTimeout`, XPath, raw selectors in tests
- [ ] POM locators as fields; JSDoc on public methods; atomic actions
- [ ] New pages registered on facade
- [ ] Test run locally (or failure triage started)

## Quick decision tree

```
Need?
├─ Whole feature (several scenarios, new POM/controllers) → skill `automate-feature`
├─ UI test → binding fixtures + sibling test + contract
├─ API test → only if binding has API layer
├─ Page / Component / Modal → binding hierarchy + contract + facade register
├─ Fixture → primary fixture file in binding
└─ Unsure → binding → contract → custom examples → bundled refs last
```

## When to read references

| When                     | What                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Always                   | `ai/project.md`                                                                                                             |
| Rules                    | Framework contract (custom path / `02-architecture.md`)                                                                     |
| New repo                 | `ai/templates/project.binding.template.md`                                                                                  |
| Patterns / mini-examples | `references/framework-patterns.md`, `references/examples.md` (also `ai/instructions/06-examples.md`)                        |
| Method inventory         | `specs/framework-catalog.md` (`npm run catalog:generate` first) + `references/framework-patterns.md` for base-class methods |
| JSDoc on methods         | `jsdoc` skill                                                                                                               |
| Selectors review         | `selector-governance` skill                                                                                                 |
| Specs from requirements  | `create-spec-from-requirement` skill                                                                                        |
| Static contract check    | `npm run lint:contract` — ESLint enforces the contract; `npm run verify` runs the full gate                                 |
