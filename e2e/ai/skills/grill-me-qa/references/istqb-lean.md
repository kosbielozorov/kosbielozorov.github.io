# ISTQB lean (enough for grilling)

Use as vocabulary during Dimension 1 — not as a full CTFL course.

## Levels (pick explicitly)

| Level             | Use when                      | Typical automation here        |
| ----------------- | ----------------------------- | ------------------------------ |
| Unit / component  | Dev-owned                     | Out of QA package scope        |
| API / integration | Rules, contracts, auth errors | `ControllersManager` + schemas |
| System / UI e2e   | Critical user journeys        | `pageManager` + `*.test.ts`    |
| Acceptance        | Business-facing scenarios     | Subset of e2e + manual         |

## Types (call out in TSDR)

Functional · regression · smoke · negative · a11y (NFR) · exploratory (manual)

## Design techniques (when inputs/rules matter)

- **EP / BVA** — fields, limits, formats
- **Decision table** — combined business rules
- **State transition** — status workflows
- **Use-case / scenario** — end-to-end happy + key alts

## Risk-based priority

Score impact × likelihood. Automate high-risk stable paths first. Defer low-risk unstable UI.

## Automate vs not (checklist)

**Automate:** stable UI, clear oracle, high regression value, API-checkable rules  
**Do not (yet):** pixel-perfect layout, one-off migrations, undefined UX, third-party black boxes without hooks
