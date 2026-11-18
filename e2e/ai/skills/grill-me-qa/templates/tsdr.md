# Test Strategy Decision Record (TSDR)

- **Subject:** {{FEATURE_OR_STRATEGY}}
- **Date:** {{DATE}}
- **Participants:** {{NAMES_OR_ROLE}}
- **Stack (fixed):** Playwright/TS · PageManager / ControllersManager · chromium default · Testomatio tags

## Dimension status

| Dimension          | Status (Resolved / Deferred / Open) | Notes |
| ------------------ | ----------------------------------- | ----- |
| 1 Coverage & risk  |                                     |       |
| 2 Architecture fit |                                     |       |
| 3 Isolation & data |                                     |       |
| 4 AI workflow      |                                     |       |
| 5 CI & gates       |                                     |       |

Counts: Resolved {{RESOLVED_COUNT}} / Deferred {{DEFERRED_COUNT}} / Open {{OPEN_COUNT}} (of 5)

## Decision log

| ID  | Question | Recommended | Chosen | Rationale |
| --- | -------- | ----------- | ------ | --------- |
|     |          |             |        |           |

## What to test (prioritized)

1.
2.
3.

## What NOT to test / not automate

-

## Test levels

| Level                | In scope? | Priority | Notes |
| -------------------- | --------- | -------- | ----- |
| API                  |           |          |       |
| UI e2e               |           |          |       |
| a11y                 |           |          |       |
| Exploratory (manual) |           |          |       |

## Risks

-

## Open questions / blockers

-

## Next steps

- [ ] `create-spec-from-requirement` → `specs/{{feature}}.md` from this TSDR
- [ ] Resolve `@S`/`@T` via `testomatio-mcp` when implementing
- [ ] Implement via `playwright-test-creator` (chromium)
- [ ] Align tags with `playwright-regression-testing` tiers
