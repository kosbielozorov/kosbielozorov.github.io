---
name: grill-me-qa
description: >-
  Guided interview to challenge QA plans, coverage, and automation strategy
  before implementation in this Playwright framework. Use when the user wants
  to grill/audit/challenge a test plan or strategy, validate automation scope,
  or stress-test decisions before specs or code. Keywords: grill, challenge,
  audit strategy, test plan review, coverage gaps, ISTQB, decision record.
---

# Grill Me QA (this package)

Challenge plans and strategy — **not** write POM/tests. After decisions land, hand off to `create-spec-from-requirement` → `playwright-test-creator`.

## Authority (read first)

1. `ai/project.md` — fixtures, tags, placement (stack is already chosen)
2. `ai/instructions/02-architecture.md` → **Framework contract**
3. Tiers/flakes: `playwright-regression-testing`
4. A11y gates: `a11y-playwright-testing` when NFR includes accessibility

**Fixed for this repo (do not re-litigate unless user explicitly opens it):** Playwright + TypeScript, POM via `PageManager` / `ControllersManager`, `*.test.ts`, fixtures from `@fixtures`, Chrome/chromium default, Testomatio `@S`/`@T` (real ids via `testomatio-mcp`).

## When to use

- Before a large feature / migration / AI-testing rollout
- User says: grill / challenge / audit my test plan or QA strategy
- Spec exists but feels thin — stress-test before coding
- Deciding **what to automate vs not** (UI / API / e2e levels)

### Do NOT use for

- Writing one test or POM → `playwright-test-creator`
- Drafting `specs/*.md` without challenge → `create-spec-from-requirement`
- Live DOM / selectors → `playwright-cli`
- Healing a failure → `trace-triage`
- Selenium / Java / Cypress bake-offs (out of scope unless user forces a migrate discussion)

## Protocol

1. **One question at a time.** Wait for the answer.
2. Every question includes a **recommended default** (ISTQB-lean + this framework).
3. **Explore the repo first** (binding, existing `specs/`, `tests/`, CI) — do not ask what files already answer.
4. Challenge vague answers (“it depends”) until a concrete decision or explicit **Deferred** with risk.
5. Budget: **10–15 grilling questions** max (Phase 1 context free). Prefer depth over checklist spam.
6. End with a **TSDR** (Test Strategy Decision Record) — see `templates/tsdr.md`.

## Session flow

```
Phase 1 — Context (free)
  Role, feature/scope under grill, greenfield vs existing suite, constraints (time, env, data)
  Explore codebase / specs / tags

Phase 2 — Grill (5 dimensions, 2–3 Q each — see references/decision-tree.md)
  1 Coverage & risk (ISTQB levels/types, automate vs exploratory)
  2 Architecture fit (POM/API/fixtures/data — within THIS framework)
  3 Isolation & environments
  4 AI workflow (gate: using AI for tests? if no → 1–2 Q then skip)
  5 CI tiers & quality gates (link regression skill)

Phase 3 — TSDR + next steps
  Write decision record; offer: create/update specs/ via create-spec-from-requirement
```

## Output rules

- Ukrainian or English — match the user.
- TSDR lists Resolved / Deferred / Open per dimension.
- Explicit sections: **What to automate**, **What NOT to automate**, **Test levels & priorities**, **Risks**, **Open questions**.
- Do **not** invent `@S`/`@T`. Do **not** invent locators or violate Framework contract.
- Do **not** dump full ISTQB textbooks — techniques only as needed (`references/istqb-lean.md`).

## Hand-off

| After grilling…           | Next skill                                                       |
| ------------------------- | ---------------------------------------------------------------- |
| Need `specs/<feature>.md` | `create-spec-from-requirement` (feed TSDR scope/risks/scenarios) |
| Implement tests           | `playwright-test-creator`                                        |
| Suite/CI shape            | `playwright-regression-testing`                                  |
| A11y in scope             | `a11y-playwright-testing`                                        |

## Stopping criteria

- Five dimensions covered (or Deferred), or user stops, or question budget exhausted
- Always emit TSDR (even partial) before closing

## Red flags

- Grilling trivial smoke for 15 questions
- Re-opening “Playwright vs Selenium” when user only asked about a feature plan
- Producing code/selectors instead of decisions
- Skipping “what NOT to automate”
