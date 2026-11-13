# Fundamental Principles (KISS, YAGNI, DRY, SOLID)

Hard requirements for this repo (fixtures, selectors, `waitForTimeout`, JSDoc on POM) live in **Framework contract** — `02-architecture.md`. This file explains _why_ we keep tests and helpers simple — and why the `app/` layer stays extensible as an adopting project grows real business logic and service layers on top of this boilerplate.

## KISS (Keep It Simple, Stupid)

- **Write the simplest code that solves the task** — don't complicate
  unnecessarily.
- **One method = one action** — methods should do one specific thing.
- **Minimize nesting** — avoid deeply nested conditions and loops.
- **Use straightforward solutions** — if a simple approach works, don't invent
  more complex ones.
- **Avoid premature abstractions** — don't create classes/helpers "for the
  future".
- **Readability is more important than "cleverness"** — code must be
  understandable to other developers.

## YAGNI (You Aren't Gonna Need It)

- **Don't add functionality that isn't needed now** — implement only what is
  required.
- **Don't create "universal" solutions** — write code for a specific task.
- **Don't add parameters "just in case"** — add only what is used.
- **Don't create "spare" methods** — create methods only when they are really
  needed.
- **Don't optimize prematurely** — optimize only when there is a real
  performance problem.
- **Don't create complex class hierarchies** — use composition and simple
  solutions.

## DRY (Don't Repeat Yourself)

- **Extract repeated logic** — if you see the same code block two or more times,
  move it to a separate method or function.
- **Single Source of Truth (SSOT)** — every piece of knowledge or logic must
  have a single, unambiguous representation within the system.
- **Avoid magic values** — extract repeated numbers/strings to named constants
  (env, test data, **shared** selectors). Page-private locators stay **inline on
  the POM field** — see **Selectors and locators** in `02-architecture.md`.
- **Unify data structures** — avoid duplicating identical fields across
  different objects if they describe the same entity.
- **Automate routine** — use decorators, middlewares, or higher-order functions
  for repetitive setup or error handling.
- **DRY ≠ Over-abstraction** — a little duplication is better than a complex or
  wrong abstraction. Don't sacrifice KISS for the sake of DRY.

## SOLID (the `app/` class layer)

KISS/YAGNI keep individual classes simple; SOLID keeps the **class hierarchy** healthy as an
adopting project adds real pages, controllers, and business logic on top of this boilerplate. All
five map to concrete patterns already in this framework — this is not abstract theory:

- **S — Single Responsibility.** One Page Object = one page/route; one Controller = one API
  resource; one Component = one UI fragment. A Page Object that accumulates unrelated flows (e.g.
  checkout logic bolted onto a product-listing page) is a sign to split it, not extend it.
- **O — Open/Closed.** Extend by **adding** a new `*.page.ts` / `*.controller.ts` / opt-in
  component — never by special-casing one product's feature inside `PageHolder`, `Component`,
  `BasePage`, `BaseModal`, or `BaseController`. Those bases must stay generic across whatever
  project adopts this boilerplate.
- **L — Liskov Substitution.** A subclass must honor its base class's contract, not weaken it.
  Every `BasePage` subclass's `expectLoaded()` must actually assert the page loaded (never a
  silent no-op); every `BaseModal` subclass's `waitForOpen()` must really wait for that modal.
  Callers of the base type rely on this.
- **I — Interface Segregation.** Compose optional behavior instead of forcing it on every class —
  this is why `ProgressBarComponent` / `ToastComponent` are **opt-in** components and not methods
  on `Component`: a page without a spinner must never inherit a locator that silently times out.
  Apply the same test before adding anything to a shared base: "does every consumer actually need
  this, or only some?"
- **D — Dependency Inversion.** Tests and Page Objects depend on **fixtures**
  (`pageManager`, `controllersManager`), never on constructing `Page` / `APIRequestContext`
  themselves. When an adopting project adds a service layer (auth, data seeding, feature flags),
  inject it as a new fixture in `app/fixtures/index.ts` — don't reach for a global or a singleton.

## Applying Principles in Tests

For tags, parallelism, and test data specifics, see `03-writing-tests.md`.

- **Tests should test one thing** — one test = one check.
- **Don't create complex setup/teardown** — only the minimum necessary for the
  current test.
- **Don't add unnecessary checks** — check only what is relevant to the specific
  test case.
- **Use Factories and Fixtures** — don't copy-paste object creation; use shared
  tools to keep test data DRY.
- **Parameterized tests** — use one test with multiple data sets instead of
  creating several nearly identical tests.
- **Simple code is easier to maintain** — complexity in tests leads to more bugs
  and harder refactoring.
