# Playwright Test Creator — project binding (template)

Copy this file to your test package as `ai/project.md` and replace every placeholder.

The test package is self-contained: `ai/project.md` sits next to `AGENTS.md` at the package root,
whether the package is a repository of its own or a folder inside a product repo.

## Project identity

| Field             | Value                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Project label** | `<SHORT_NAME>`                                                                                   |
| **Language**      | TypeScript                                                                                       |
| **Test runner**   | `@playwright/test` with custom extended `test` (or `standard` if you use raw `@playwright/test`) |

## Architecture

| Concept                      | Value                                                  |
| ---------------------------- | ------------------------------------------------------ |
| **Page facade class**        | `<FACADE_CLASS>` e.g. `PageManager`                    |
| **Facade module**            | `<FACADE_FILE>` e.g. `app/ui/pages/PageManager.ts`     |
| **API controllers facade**   | `<API_FACADE>` e.g. `ControllersManager` or `none`     |
| **Base class chain (pages)** | e.g. `PageHolder` → `Component` → `AppPage` → concrete |
| **Modals base**              | `<MODAL_BASE>` or `none`                               |
| **Components base**          | `<COMPONENT_BASE>`                                     |
| **API controllers base**     | `<API_BASE>` or `none`                                 |

## Fixtures

| Field                    | Value                                                         |
| ------------------------ | ------------------------------------------------------------- |
| **Primary fixture file** | `<PATH_TO_FIXTURES>` e.g. `tests/fixtures/index.ts`           |
| **Test import rule**     | `<DESCRIBE: import test from where in *.spec.ts / *.test.ts>` |
| **Key fixtures**         | List names and shapes: `app`, `authenticatedPage`, etc.       |

## Import path rules

Replace with a table for **your** directories:

| File location        | Import `test` from | Import shared constants from |
| -------------------- | ------------------ | ---------------------------- |
| `<TEST_DIR_UI>`      | `<RELATIVE_PATH>`  | `<RELATIVE_PATH>`            |
| `<TEST_DIR_API>`     | `<RELATIVE_PATH>`  | `<RELATIVE_PATH>`            |
| `<PAGE_OBJECTS_DIR>` | `@playwright/test` | `<RELATIVE_PATH>`            |

## File placement

| Artifact     | Directory | Filename pattern |
| ------------ | --------- | ---------------- |
| UI tests     | `<DIR>`   | `<GLOB>`         |
| API tests    | `<DIR>`   | `<GLOB>`         |
| Page objects | `<DIR>`   | `<PATTERN>`      |
| ...          | ...       | ...              |

## Test management / tags

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| **ID scheme**     | e.g. Testomatio `@S` / `@T`, or plain `@smoke` only |
| **Tag placement** | In title / in `tag` option / both                   |

## Rules (project-specific)

| Rule                                                         | Enforced (yes/no) |
| ------------------------------------------------------------ | ----------------- |
| XPath                                                        | yes / no          |
| `waitForTimeout`                                             | yes / no          |
| Shared selector constants (2+ consumers); else inline on POM | yes / no          |

## Custom reference paths

Point to markdown or docs **inside this repo** so the agent reads your truth source:

| Document                              | Path                           |
| ------------------------------------- | ------------------------------ |
| Framework patterns / method inventory | `<e.g. docs/e2e-framework.md>` |
| Code examples                         | `<e.g. docs/e2e-examples.md>`  |

If empty, the agent uses only the skill body + generic Playwright rules.
