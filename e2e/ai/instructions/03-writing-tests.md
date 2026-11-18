# Writing Tests

## Core Principles

### 1. Test Structure

- Use plain `test.describe()`. Parallelism comes from `fullyParallel` in `playwright.config.ts` (env `FULLY_PARALLEL`, default `true`); a file that must run in parallel regardless uses `test.describe.configure({ mode: 'parallel' })`. `test.describe.parallel()` is deprecated
- Add tags to each test in `tag: []`: a real `@T<id>` **or** `@unlinked` (Framework contract → **Test ids**), plus categories such as `@smoke`, `@regression`
- Name the requirement in one `source` annotation: `annotation: [{ type: 'source', description: 'specs/<feature>.md#<N.M>' }]` (or the test's own `@T<id>`) — Framework contract → **Map and oracle**
- Use `test.beforeEach()` to prepare state before each test
- Use `test.slow()` for tests that require more time
- Test names should be descriptive and contain the real test id when one exists: `'Test description @T<id>'`
- Large/unclear scope: challenge the plan first with skill `grill-me-qa`, then `create-spec-from-requirement`

### 2. Waiting and Asynchrony

- Always use `await` for async operations
- Use `page.waitForLoadState()` to wait for page load
- Use `expect(locator).toBeVisible` to wait for elements
- Use `expect()` with Playwright's automatic waits instead of manual `setTimeout`
- **Do not use** `waitForTimeout`; full rule set: **Framework contract** in `02-architecture.md`

### 3. Test Data

- Use `@faker-js/faker` to generate test data
- Store static upload / fixture files under `uploads/` (create when needed)
- Prefer builders under `data/` for structured test cases
- Create unique data for each test (especially for email, username, etc.)

### 4. Parallelization and Isolation

- Ensure tests run reliably in parallel without shared state conflicts
- Tests should be independent - don't rely on execution order
- Use unique data for each test (especially users)
- Clean up state after tests if needed (e.g., delete test users)
- Parallel suite structure: see **§1. Test Structure** above (do not use `test.describe.serial()`)
- Expected values come from the requirement, never from the current app — Framework contract → **Map and oracle**

### 5. Configuration and Environment Variables

- Use environment variables from `.env` file for configuration
- Don't hardcode URLs - use `DEV_BASE_URL` from `app/constants` (env: `DEV_BASE_APP_URL`)
- Consider the difference between CI and local environment (check via `process.env.CI`)

### 6. Testomatio Integration

- Every test has a real `@T<id>` (title + `tag: []`) or `@unlinked` (`tag: []` only) until its TMS case exists — enforced by `npm run lint:contract`
- Use descriptive test names for better display in Testomatio
- Add tags for categorization: `@smoke`, `@sanity`, `@regression`, `@critical`, `@a11y`, `@quarantine`, `@slow`, etc. Suite tiers: skill `playwright-regression-testing`.
- Resolve or create real `@S`/`@T` ids via **Testomatio MCP** — skill `testomatio-mcp`. Do not invent ids or duplicate TMS cases.
- Testomatio MCP is **TMS-only** — it does **not** help with UI selectors/locators; use `playwright-cli` → Playwright MCP (`07-playwright-ai-agents.md`).
