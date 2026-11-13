# Framework Patterns Reference

Canonical facts: `ai/project.md` + `ai/instructions/02-architecture.md`.  
Code examples: `ai/instructions/06-examples.md` and live tests under `tests/`.

This file is a **short method / structure inventory** for the playwright-test-creator skill. Prefer reading the real TypeScript sources when unsure.

## Class hierarchy

```
PageHolder (app/ui/pages/PageHolder.ts) — holds `page`
└── Component (app/ui/components/Base.component.ts)
    ├── BasePage (app/ui/pages/BasePage.ts) — `pagePath`, `open()`, page helpers
    │   └── concrete `*.page.ts`
    └── BaseModal (app/ui/modals/Base.modal.ts)
        └── concrete `*.modal.ts`
```

UI facade: `PageManager` (`app/ui/pages/PageManager.ts`) — register pages as `public fooPage = new FooPage(this.page)`.  
API facade: `ControllersManager` (`app/api/controllers/ControllersManager.ts`) — register controllers as `public fooController = new FooController(this.request)`.

## Components (`app/ui/components/`)

Extend `Component` from `Base.component.ts`. Composed into pages (not listed on `PageManager`).

Two opt-in components ship with the boilerplate. They are **not** on `Component` — compose them only
into pages whose app really has that chrome, passing your own locator:

| File                       | Class                  | Compose when                           |
| -------------------------- | ---------------------- | -------------------------------------- |
| `ProgressBar.component.ts` | `ProgressBarComponent` | the app shows a spinner / progress bar |
| `Toast.component.ts`       | `ToastComponent`       | the app shows toasts / notifications   |

```ts
private readonly progressBar = new ProgressBarComponent(this.page.getByRole('progressbar'));
private readonly toast = new ToastComponent(this.page.getByRole('status'));
```

## Modals (`app/ui/modals/`)

Extend `BaseModal` → `Component`. Import from `../modals/…` (never `../components/modals/…`).

| File            | Class                  |
| --------------- | ---------------------- |
| `Base.modal.ts` | `BaseModal` (abstract) |

## Base-class method inventory (reuse before inventing)

For **concrete** classes (a specific page, component, modal, or controller), don't hand-search
this file — run `npm run catalog:generate` (fast, deterministic, regenerates from source) and read
`specs/framework-catalog.md` instead. It lists every concrete class with a one-line summary and
full public method signatures, always current. This file used to carry a hand-written inventory
table of concrete pages here; it drifted the moment a page was added, so it was replaced by the
generated catalog — add a class-level JSDoc summary to new classes (skill `jsdoc`) and the
generator picks it up.

The tables below cover only the **shared base classes**, which the generator deliberately excludes
(there's nothing concrete to catalog about them):

### `Component` (`app/ui/components/Base.component.ts`)

| Method / field           | Notes                                                            |
| ------------------------ | ---------------------------------------------------------------- |
| `mainTitle`              | level-1 heading — the only chrome assumed for every app          |
| `expectLoaded(message?)` | abstract                                                         |
| `isLoaded()`             | try/catch around `expectLoaded`                                  |
| `wait(time)`             | **Sanctioned** `waitForTimeout` wrapper — see Framework contract |
| `reload()`               | page reload                                                      |

### `ProgressBarComponent` / `ToastComponent` (opt-in, composed into pages)

| Method                               | Notes                    |
| ------------------------------------ | ------------------------ |
| `expectVisible()` / `expectHidden()` | progress bar state       |
| `expectCycle()`                      | progress bar show → hide |
| `expectMessages(expected: string[])` | toast text(s), any order |

### `BasePage` (`app/ui/pages/BasePage.ts`)

| Method        | Notes                   |
| ------------- | ----------------------- |
| `pagePath`    | abstract route          |
| `open(path?)` | `goto` + `expectLoaded` |

### `BaseModal` (`app/ui/modals/Base.modal.ts`)

Read the file for lifecycle helpers (`waitForOpen` / `waitForClose` / `continue` / `cancel`, etc.) before adding modal methods.

### `BaseController` (`app/api/controllers/Base.controller.ts`)

| Method                          | Notes                          |
| ------------------------------- | ------------------------------ |
| constructor(`request`)          | Playwright `APIRequestContext` |
| `expectResponseStatusCode`      | soft status assert             |
| `expectResponseErrorMessage(s)` | API error body asserts         |

## Fixtures

See binding table in `ai/project.md`. Primary file: `app/fixtures/index.ts`.

UI: `pageManager`.  
API: `controllersManager`.  
Additional fixtures: add when needed; document in the binding.

## Selectors / constants

Contract: inline POM fields by default; `app/constants/` only when shared (2+ consumers). Live discovery: **playwright-cli → Playwright MCP**.

## Sibling patterns (prefer these over inventing)

| Need                  | Look at                                                      |
| --------------------- | ------------------------------------------------------------ |
| Fixture setup         | `app/fixtures/index.ts`                                      |
| New page registration | `app/ui/pages/PageManager.ts`                                |
| New API controller    | `app/api/controllers/ControllersManager.ts`                  |
| Example test shape    | `ai/instructions/06-examples.md` + live `tests/**/*.test.ts` |
