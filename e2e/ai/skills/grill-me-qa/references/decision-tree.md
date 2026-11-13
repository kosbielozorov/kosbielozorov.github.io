# Decision tree (lean, this framework)

Ask **2–3** highest-impact questions per dimension. Always offer a recommended default.

## Dimension 1 — Coverage & risk

| #   | Ask                                         | Default recommendation                                                                              |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1.1 | Highest product risks if this ships broken? | Rank journeys: auth, money/data loss, permissions first                                             |
| 1.2 | Which levels: API vs UI e2e vs pure UI?     | API for rules/contracts; UI e2e for critical user paths only; avoid duplicating same assert on both |
| 1.3 | What stays manual / exploratory?            | Visual polish, rare locales, one-off admin, unclear requirements                                    |
| 1.4 | NFR in scope (a11y, perf, security)?        | a11y on critical flows if public UI (`@a11y`); perf/security only with clear SLOs                   |

## Dimension 2 — Architecture fit (do not re-pick Playwright)

| #   | Ask                                      | Default recommendation                                                                   |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 2.1 | New pages/modals vs extend existing POM? | Inventory `app/ui` first; extend before new classes                                      |
| 2.2 | API setup vs UI setup for preconditions? | Prefer `controllersManager` / API for seed; UI only when user-visible setup is the point |
| 2.3 | Assertions in POM or test?               | Interactions in POM; expectations in test (contract)                                     |

## Dimension 3 — Isolation & data

| #   | Ask                  | Default recommendation                                     |
| --- | -------------------- | ---------------------------------------------------------- |
| 3.1 | Shared mutable data? | Unique data per test; no order dependence; `fullyParallel` |
| 3.2 | Env / roles needed?  | Document in spec; secrets via `.env`, never hardcode       |
| 3.3 | Cleanup required?    | API teardown when creates persist; else isolated accounts  |

## Dimension 4 — AI (gate first)

**Gate:** Using AI to generate/heal/plan tests for this work?

- **No** → 1–2 validation Q (review still human?), mark N/A, continue
- **Yes / evaluating** → continue

| #   | Ask                                           | Default recommendation                                                     |
| --- | --------------------------------------------- | -------------------------------------------------------------------------- |
| 4.1 | Where AI is allowed (plan / generate / heal)? | Plan+generate OK with human review; heal must obey contract Healing order  |
| 4.2 | How to stop bad locators/hallucinations?      | CLI→MCP before inventing DOM; no invented `@T`; run chromium after changes |
| 4.3 | Token/cost boundary?                          | Atomic prompts; binding+contract by link, not paste                        |

## Dimension 5 — CI & gates

| #   | Ask                                | Default recommendation                                                             |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| 5.1 | Which tier tags for new scenarios? | Happy path `@smoke`/`@critical`; rest `@regression`; flakes → `@quarantine`+ticket |
| 5.2 | PR vs nightly expectation?         | PR: smoke+critical; nightly: regression − quarantine (chromium)                    |
| 5.3 | Failure triage owner?              | Author + `trace-triage`; no silent retry-only “fixes”                              |

Full question banks from external catalogs are optional — prefer these.
