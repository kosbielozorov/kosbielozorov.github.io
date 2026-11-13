# Examples of Correct and Incorrect Code

Normative rules (imports, waits, constants, POM locators on the class) are in **Framework contract** — `02-architecture.md`. These snippets illustrate patterns for **this** boilerplate (`app/` + `PageManager` / `ControllersManager`).

## ✅ Correct Test (fixture + POM shape):

```typescript
import { test, expect } from '@fixtures';

test.describe('Home @S<suiteId> @smoke', { tag: ['@S<suiteId>', '@smoke'] }, () => {
  test(
    'Open home page @T<testId>',
    {
      tag: ['@T<testId>'],
      annotation: [{ type: 'source', description: 'specs/home.md#1.1' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.expectLoaded();

      await expect(homePage.mainTitle).toBeVisible();
    },
  );
});
```

Why it is correct:

- Imports `test` / `expect` from `@fixtures` (never `@playwright/test`).
- Uses `pageManager` and destructures a Page Object registered on `PageManager` — no raw `page` / selectors in the test.
- Actions and load checks go through POM methods / inherited helpers.
- Tags `@S…` on `describe` and `@T…` on `test`, in both the title and the `tag: []` array.
- One `source` annotation names the requirement the expected values come from: `specs/<feature>.md#<N.M>` (a scenario heading) or the test's own `@T<id>` when the TMS case is the requirement.
- Use real Testomatio ids via `testomatio-mcp` — do not invent `@S` / `@T`. `@S<suiteId>` / `@T<testId>` above are illustrations only: with no TMS case yet, write `{ tag: ['@unlinked'] }` and leave the id out of the title (see `tests/ui/login.test.ts`).

Built-in fixtures: `pageManager`, `controllersManager`. Document any new fixtures in `../project.md`.

## ✅ Correct API Test shape:

```typescript
import { test } from '@fixtures';

test.describe('Resources API @S<suiteId>', { tag: ['@S<suiteId>'] }, () => {
  test(
    'Create resource returns 201 @T<testId>',
    {
      tag: ['@T<testId>'],
      annotation: [{ type: 'source', description: 'specs/resources-api.md#1.1' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.resourceController.create({/* payload */});
      await controllersManager.expectResponseStatusCode(response, 201);
    },
  );
});
```

## ✅ Correct API Schema Test shape:

```typescript
import { resourceSchema } from '@schemas/resource.schema';
import { expect, test } from '@fixtures';

test.describe('Resources API — schema @S<suiteId>', { tag: ['@S<suiteId>'] }, () => {
  test(
    'GET /resources/{id} response matches the resource schema @T<testId>',
    {
      tag: ['@T<testId>'],
      annotation: [{ type: 'source', description: 'specs/resources-api.md#1.2' }],
    },
    async ({ controllersManager }) => {
      const response = await controllersManager.resourceController.getResource(1);
      const body = await response.json();

      const { error } = resourceSchema.validate(body);
      expect(error).toBeUndefined();
    },
  );
});
```

Why it is correct:

- Lives in its own `*.schema.test.ts` file — schema/contract assertions never mix into a functional `*.test.ts` (see file placement in `../project.md`).
- Validates the full response shape via the `Joi` schema from `app/api/schemas/`, not field-by-field.

## ❌ Incorrect Test:

```typescript
import { test } from '@playwright/test'; // INCORRECT: import from fixtures, not @playwright/test

// INCORRECT: no fixtures, no Page Objects, hardcoded selectors, no tags
test('test', async ({ page }) => {
  await page.goto('http://localhost');
  await page.locator('.items-table .row').first().click(); // INCORRECT: hardcoded selector in test
  await page.waitForTimeout(1000); // FORBIDDEN — see Framework contract in 02-architecture.md
});
```

## ❌ Violating KISS and YAGNI:

```typescript
// INCORRECT: Excessive complexity, abstractions "for the future"
import { type Page } from '@playwright/test';

class UniversalEntityHandler {
  private page: Page;
  private options: Record<string, any>;

  constructor(page: Page, options: Record<string, any> = {}) {
    this.page = page;
    this.options = {
      enableLogging: options.enableLogging || false,
      retryCount: options.retryCount || 3,
      timeout: options.timeout || 5000,
      // ... 10 more parameters that aren't used
    };
  }

  // Method with many parameters, though only 2 are used
  async createEntity(entity: any, view: string, options = {}, retry = true, ...args: any[]) {
    // Complex logic with many checks that aren't needed
  }
}

// INCORRECT: Creating a helper for one-time use
import { complexHelper } from './helpers/complexHelper'; // used 1 time
```
