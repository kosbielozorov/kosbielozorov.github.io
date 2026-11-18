---
name: playwright-regression-testing
description: >-
  Govern Playwright regression suites in this framework: tiers (smoke/sanity/full),
  tags, CI selection, sharding, and flaky quarantine. Use when planning suite
  strategy, optimizing CI, managing flakes, or selecting tests by risk/change —
  not for authoring a single UI spec. Keywords: regression, smoke, sanity,
  sharding, flaky, quarantine, CI, test selection.
---

# Playwright regression strategy (this package)

Suite governance for this test package. Authoring one test → `playwright-test-creator`. Flake triage bundle → `trace-triage`.

## Authority (read first)

1. `ai/project.md` — tags, placement, `*.test.ts`
2. `ai/instructions/02-architecture.md` → **Framework contract** (+ **Healing**)
3. `ai/instructions/03-writing-tests.md` — structure, isolation, tags
4. Browser default: **chromium/Chrome** until the user asks otherwise

## When to use

- Define / adjust tiers and grep filters
- CI time budgets, sharding, `--last-failed`
- Flaky policy (retry vs quarantine vs heal)
- Change-/risk-based selection guidance

### Do NOT use for

- Writing a single E2E/POM → `playwright-test-creator`
- Live DOM exploration → `playwright-cli`
- a11y scan authoring details → `a11y-playwright-testing`
- Inventing `@S`/`@T` → `testomatio-mcp`

## Tier model (default budgets)

| Tier        | Tags (typical)                        | When                         | Budget (guide) |
| ----------- | ------------------------------------- | ---------------------------- | -------------- |
| 0 Smoke     | `@smoke`                              | Every commit / PR gate start | &lt; ~2 min    |
| 1 Sanity    | `@critical` and/or `@sanity`          | Every PR                     | &lt; ~10 min   |
| 2 Selective | impact/@regression subset             | On merge / path filters      | &lt; ~30 min   |
| 3 Full      | `@regression` (exclude `@quarantine`) | Nightly / pre-release        | &lt; ~60 min   |

**Characterization scaffolding** (`@characterization`, legacy zones — skill `characterize-feature`) is
outside the tiers: its own config, `npm run test:characterization`, **nightly only**, never a PR or
release gate. A red result means "behaviour changed" → a human updates the snapshot or files a bug.

Exact budgets are team SLOs — adjust in CI, keep the **tier idea**. Details: `references/tiers-and-tags.md`.

## Tag rules (this framework)

- Testomatio: `@S…` on `describe`, `@T…` on `test` — in **title and `tag: []`**
- Categories: `@smoke`, `@sanity`, `@critical`, `@regression`, `@a11y`, `@quarantine`, `@slow`
- Do not invent `@S`/`@T`. Do not drop tags when healing.

## CLI (from the package root)

```bash
npx playwright test --project=chromium --grep @smoke
npx playwright test --project=chromium --grep @critical
npx playwright test --project=chromium --grep @regression --grep-invert @quarantine
npx playwright test --project=chromium --shard=1/4
npx playwright test --project=chromium --last-failed
```

Prefer package scripts (`npm test`) which already pin chromium.

## Flaky policy

1. Reproduce → `trace-triage` bundle → heal per contract (**POM → shared constants → test**)
2. Never “fix” with `waitForTimeout` or silent assertion removal
3. Retries: CI-only, limited; local should stay fail-fast for signal
4. Quarantine: tag `@quarantine`, ticket + owner + expiry; exclude from release gates
5. Details: `references/flaky-management.md`

## CI notes

See `references/ci-chromium.md`. Keep gates: smoke → PR sanity → nightly full. Shard full suite when wall-clock grows.

## Red flags

- Full suite on every commit
- Retries / sleep as the only flake “fix”
- Quarantine without ticket/expiry
- Dual tag schemes that fight Testomatio / binding
- Multi-browser required in CI before the user asks

## Verification

- [ ] `@smoke` set identified and runs under agreed budget on chromium
- [ ] Release gate excludes `@quarantine`
- [ ] Flakes tracked (ticket) with heal path, not only retries
- [ ] Isolation: no order dependence; unique data where needed
