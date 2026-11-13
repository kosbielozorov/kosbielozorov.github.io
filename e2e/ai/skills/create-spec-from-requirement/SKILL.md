---
name: create-spec-from-requirement
description: Creates a Playwright test plan markdown file under specs/ from a feature requirement or user story. Use when the user asks to create a test plan, specs/*.md, scenarios, acceptance criteria, or coverage for a web feature.
---

# Create spec from requirement

## Output

Create `specs/<feature>.md` using this structure:

```markdown
# <Feature name>

## Scope

- In scope:
- Out of scope: <case> — <reason> (Q-n, <date> when it came from a question)

## Assumptions

## Risks

## Test data

## Environments

## Scenarios

### 1. <Top level suite name>

**Seed:** `tests/seed.spec.ts`

#### 1.1 <Scenario name> @smoke

**Preconditions:**

- ...

**Steps:**

1. ...

**Expected:**

- ...

**Page Objects / fixtures:**

- pageManager / homePage (names from binding)
- ...

## Open questions

- Q-n: <question> — asked <date>, owner <who>

## Known defects

- F-n / `@bug-<id>` (<date>): scenarios <N.M> — <what the app does instead of the requirement>
```

### Characterization flow (legacy app, no requirement)

When the spec comes from `characterize-feature` (handoff `Flow: characterization`), it adds an
**Observations** section after **Environments**, and every **Expected** line carries its
confirmation:

```markdown
## Observations

| Id  | Observation                       | Source  | Env, date, account          | Triage              |
| --- | --------------------------------- | ------- | --------------------------- | ------------------- |
| O-1 | Flash reads `You logged in!`      | UI      | staging, 2026-11-12, user-a | intended → 1.1      |
| O-2 | Empty form shows a username error | UI      | staging, 2026-11-12, user-a | suspected bug → F-1 |
| O-3 | `GET /api/items` returns 50 items | network | staging, 2026-11-12, user-a | suspected bug → Q-2 |
| O-4 | Footer shows a build number       | UI      | staging, 2026-11-12, —      | out of scope        |

**Expected:**

- The flash message reads `You logged in!` (O-1; confirmed by PO, 2026-11-12).
```

- **Source:** `UI`, `network`, `OpenAPI`, `docs`, `TMS` or `code` — where the observation was seen.
  Every source is an observation, never a requirement by itself.
- **Triage** (decided at Gate 1, by a human): `intended → N.M` (becomes an **Expected** line),
  `suspected bug → F-n` (correct value known: pinned with `test.fail()` and the correct value),
  `suspected bug → Q-n` (correct value unknown: an **Open questions** line with an owner, no
  functional test), `out of scope`, or `pending` (not triaged yet).
- **Confirmation** on every **Expected** line: `(O-n; confirmed by <role / doc / ticket>, <YYYY-MM-DD>)`.
  "Nobody knows" is never a confirmation — it is a `Q-n` with an owner. `npm run handoff -- check`
  fails on an Expected line without one.

## Optional prelude

If the user wants the plan **challenged** first (grill / audit / strategy stress-test), run skill `grill-me-qa` and feed the TSDR (scope, risks, what to automate / not, levels) into this template. Do not duplicate a second grilling inside this skill.

## Rules

- Follow `ai/instructions/02-architecture.md` (framework contract).
- Read the project binding first: `ai/project.md` (fixtures, page objects, tag rules).
- Keep scenarios independent and parallel-safe.
- Number scenarios `N.M` (`#### 1.1 …`). Tests cite them as `source` annotations (`specs/<feature>.md#1.1`), so never renumber an existing scenario — append new ones at the end of their suite. `npm run lint:contract` fails on a dangling reference.
- Include `Seed: tests/seed.spec.ts` when a Planner seed is used in this package.
- Do **not** invent real `@S` / `@T` ids — resolve via `testomatio-mcp`, or mark the scenario `@unlinked` (the tests then carry `@unlinked`; Framework contract → **Test ids**).
- **Trace every requirement clause.** Split the requirement into clauses (one checkable statement each). Every clause must map to an **Expected** line, to **Out of scope** (with the reason), or to a `Q-n`. A clause with none is a missing Expected line. When run from `automate-feature`, this trace is shown at Gate 1.
- **Expected** lines are the oracle: take them from the requirement, never from the current app. Unclear expected outcome → a `Q-n`; do not guess (Framework contract → **Map and oracle**). In the characterization flow the requirement is a **confirmed observation** — an observation alone never becomes an Expected line.
- **Every question ends in this file** (the handoff in `.work/` is not committed): answered as a requirement → an **Expected** line or scenario citing `Q-n`; out of scope → a line under **Out of scope** with the reason; not decided yet → a line under **Open questions** with an owner. Remove the line from **Open questions** when it is decided. **Known defects** lists every pinned product defect (`test.fail()` + `@bug-<id>`); remove the line when the bug is fixed and the pin removed. Empty sections may be dropped.
