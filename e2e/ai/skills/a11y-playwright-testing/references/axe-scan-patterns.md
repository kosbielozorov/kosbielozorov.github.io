# Axe scan patterns (this framework)

Import `test` / `expect` from fixtures. Prefer scanning after a POM `open()` / visible assert. Keep CSS include/exclude strings out of tests when possible — expose a page method or helper.

## Page-level scan

```typescript
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures';

const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'] as const;

test.describe('Home a11y @S<suiteId> @a11y', { tag: ['@S<suiteId>', '@a11y'] }, () => {
  test(
    'home has no WCAG 2.2 AA violations @T<testId>',
    { tag: ['@T<testId>', '@a11y'] },
    async ({ pageManager: { homePage }, page }) => {
      await homePage.open();
      await expect(homePage.heading).toBeVisible(); // stable state before scan

      const results = await new AxeBuilder({ page }).withTags([...WCAG_22_AA]).analyze();
      expect(results.violations).toEqual([]);
    },
  );
});
```

## Scoped exclude (documented)

```typescript
// Known issue: TICKET-123 — third-party widget; owner X; revisit YYYY-MM-DD
const results = await new AxeBuilder({ page })
  .exclude('#third-party-widget') // prefer POM-exposed root if shared
  .withTags([...WCAG_22_AA])
  .analyze();
```

Avoid global `.disableRules(['color-contrast'])`. Prefer narrow `.exclude()` + ticket.

## Shared helper (optional)

If multiple suites scan the same way, put a helper under `helpers/` (e.g. `scanWcag22Aa(page, options?)`) instead of duplicating builder options. Still call it from tests after POM navigation.
