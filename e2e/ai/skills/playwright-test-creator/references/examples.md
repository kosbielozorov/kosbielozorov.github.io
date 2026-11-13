# Examples

**Prefer live sources over inventing patterns.** For this repo:

1. **Canonical good/bad snippets:** `ai/instructions/06-examples.md`
2. **Live tests:** `tests/**/*.test.ts`
3. **Contract / binding:** `ai/instructions/02-architecture.md`, `ai/project.md`

## Minimal UI shape

```typescript
import { test, expect } from '@fixtures';

test.describe('Feature @S<suiteId> @smoke', { tag: ['@S<suiteId>', '@smoke'] }, () => {
  test(
    'Case @T<testId>',
    {
      tag: ['@T<testId>'],
      annotation: [{ type: 'source', description: 'specs/<feature>.md#1.1' }],
    },
    async ({ pageManager: {/* registered page */} }) => {
      // POM methods only — see 06-examples.md
    },
  );
});
```

`@fixtures` resolves from any nesting depth — no adjustment needed under `tests/<feature>/`.

## Forbidden (see `06-examples.md`)

- `import { test } from '@playwright/test'` in `*.test.ts`
- Raw `page.locator(...)` / selectors in tests
- `page.waitForTimeout(...)`
- Missing `@S` / `@T` in title and `tag: []` when TMS ids are required
