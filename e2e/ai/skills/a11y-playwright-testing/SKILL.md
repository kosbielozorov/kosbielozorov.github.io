---
name: a11y-playwright-testing
description: >-
  Accessibility testing for this Playwright/TypeScript framework with axe-core,
  keyboard/focus checks, and WCAG 2.2 AA. Use when adding a11y scans, keyboard
  navigation, dialog focus traps, ARIA/semantic checks, or @a11y coverage.
  Keywords: accessibility, WCAG, axe-core, keyboard, focus, ARIA, a11y.
---

# Accessibility (Playwright + axe-core)

Project-bound a11y playbook. Obey binding + Framework contract — do **not** invent a second locator/wait policy.

## Authority (read first)

1. `ai/project.md` — paths, fixtures, tags, placement
2. `ai/instructions/02-architecture.md` → **Framework contract**
3. Live UI: **`playwright-cli` → Playwright MCP** (`07-playwright-ai-agents.md`)
4. Functional E2E / POM: skill `playwright-test-creator`
5. Selectors: skill `selector-governance`

## When to use

- axe-core scans (WCAG 2.2 AA tags)
- Keyboard / focus / dialog trap tests
- Semantic / accessible-name checks on critical flows

### Do NOT use for

- Replacing full WCAG sign-off (automation catches ~30–40%; manual AT still required)
- Generic functional E2E without a11y intent → `playwright-test-creator`
- Selenium / Java a11y (out of scope for this repo)

## Prerequisites

| Requirement | Details                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| Package     | `@axe-core/playwright` — already a devDependency of this package                           |
| Imports     | `test` / `expect` from `@fixtures` — **never** from `@playwright/test` in `*.test.ts`      |
| Browser     | Chrome/chromium until the user asks otherwise                                              |
| Tags        | Real `@S`/`@T` via `testomatio-mcp`; category `@a11y` (+ `@smoke` / `@critical` as needed) |

## Non-negotiable (this framework)

- No raw selectors in `*.test.ts` — call POM / component / modal methods
- No XPath, no `waitForTimeout` (only sanctioned `Component.wait()`)
- Prefer `getByRole` / `getByLabel` — inability to locate by role/label is often an a11y defect
- Place tests under `tests/` as `*.test.ts`; keep axe helpers in `helpers/` or a small POM method if reused
- Document exclusions with ticket + owner + expiry (scoped `.exclude()`, not global rule disable)

## Workflow

1. Clarify scope (pages/flows), WCAG target (default **2.2 AA**), known third-party exceptions.
2. Discover UI via CLI→MCP; extend POM if needed (`generate-pom-skeleton` / creator).
3. Add scan and/or keyboard tests with `@a11y` in **title and `tag: []`**.
4. Wait for stable UI state before `AxeBuilder.analyze()` (web-first asserts / load state — not hard sleeps).
5. Run: `npx playwright test --project=chromium --grep @a11y` (from the package root).

## Minimal patterns

See `references/axe-scan-patterns.md` and `references/keyboard-focus.md`. Checklist: `references/wcag-aa-checklist.md`.

## Red flags

- Clean axe run treated as full conformance
- Global `.disableRules(['color-contrast'])` instead of scoped exclude + ticket
- Scanning before UI is stable
- Keyboard/focus skipped because axe passed
- Raw `page.locator` / RegExp locators in tests

## Verification

- [ ] Zero (or documented-exception) axe violations for in-scope tags
- [ ] Critical interactive paths keyboard-reachable; dialogs trap/return focus
- [ ] Tags `@a11y` + real `@S`/`@T` where required
- [ ] Chrome run green for the new tests
