# Best Practices

## Error Handling and Debugging

- Use descriptive messages in assertions: `expect(actual, 'Custom message').toBe(expected)`
- Add screenshots and traces for failed tests (already configured in `playwright.config.ts`)
- Use `test.step()` to group actions in reports
- Add comments for complex or non-obvious actions

## Reusable visibility checks (helper)

If you have many (more than 2) repeated visibility assertions on a page, create a small universal helper that accepts a **Locator** and performs a visibility check. Do this only when the assertion pattern repeats in multiple places (DRY), and keep it simple (KISS).

Example helper:

```ts
import { expect, type Locator } from '@playwright/test';

export async function expectVisible(locator: Locator, message = 'Element should be visible') {
  await expect(locator, message).toBeVisible();
}
```

Example usage (test or POM method):

```ts
await expectVisible(homePage.submitButton, 'Submit button should be visible');
await expectVisible(homePage.itemsTable, 'Items table should be visible');
```

## Optimization and Performance

- Use `page.goto()` with an appropriate `waitUntil` (prefer `domcontentloaded` / `load` unless you have a specific need; avoid relying on `networkidle` as a default)
- Avoid unnecessary waits - Playwright has automatic waits. Source: https://playwright.dev/docs/best-practices#dont-use-hardcoded-waits
- Use `page.route()` to mock API requests if needed
- Use `test.setTimeout()` for individual tests that need more time
- **KISS / YAGNI** for premature optimization: see `01-fundamental-principles.md`

## Code Style and Quality

- Follow ESLint or OxLint rules
- Use Prettier or OxFmt for formatting
- Method names should be in camelCase and describe the action: `submitForm()`, `expectLoaded()`
- Class names should be in PascalCase: `HomePage`, `LoginPage`

## Documentation and Comments

- JSDoc requirement on POM methods: normative rule lives in **Framework contract** — `02-architecture.md`; not restated here
- For other comments: explain "why", not "what"; skip obvious noise (KISS / YAGNI: `01-fundamental-principles.md`)
- Add usage examples only for non-obvious APIs
