---
name: characterize-feature
description: >-
  Covers a legacy app that has no requirements: maps the app (specs/app-map.md), records what one
  feature currently does as observations, pins that zone with temporary characterization
  scaffolding (ARIA snapshots, API response shapes), and has a human triage every observation at
  Gate 1 (intended / suspected bug / out of scope). Confirmed observations become the spec's
  Expected lines, then automate-feature continues from step 2. Use when the user wants to cover a
  legacy or undocumented app, "characterize" a feature, or get a safety net before a refactor and
  there is no story, spec or TMS case to test against. Not for a feature with a requirement
  (automate-feature) or for one test (playwright-test-creator).
---

# Characterize a feature (legacy app, no requirement)

A legacy app has no requirement to act as the oracle. This flow does **not** relax the oracle rule:
the agent **observes**, a **human confirms**, and only a confirmed observation becomes an
**Expected** line. Until then the zone is held by temporary scaffolding that says "behaviour
changed", never "bug". Everything after the spec is the ordinary `automate-feature` chain.

Read first: `ai/project.md` (env, **Legacy sources**), `ai/instructions/02-architecture.md` →
**Map and oracle** and **Characterization scaffolding**, `ai/instructions/08-handoff.md`.

```text
0 Baseline → 1 Assess (app map) → [Gate A: zone + access + writes] → handoff init
  → 2 Observe → 3 Scaffold (page level) → 4 Triage → [Gate 1]
  → automate-feature from step 2 (tests, gaps, POM, run, review, Gate 2, Gate 3) → 5 Close the zone
```

## Rules

- **Observation ≠ requirement.** Never write an observation as an **Expected** line yourself. Every
  Expected line carries `(O-n; confirmed by <role / doc / ticket>, <YYYY-MM-DD>)`, and the
  confirmation comes from the human at Gate 1. "Nobody knows" → `Q-n` with an owner, never a
  confirmation. Docs, TMS cases, OpenAPI and app code are **sources of observations**; they may back
  a confirmation, but the human decides.
- **Test environment only** (`ai/project.md`), never prod. Reading is free. An action that creates or
  changes data (submit, POST / PUT / DELETE, sending mail) is allowed only if it is on the
  **Approved writes** list of `specs/app-map.md`, approved at Gate A. Record env, date and test
  account for every observation — data-dependent values must be visible as such.
- **Never type a password**, not even a demo one the page publishes. A zone behind a sign-in is
  observed through the access chosen at Gate A; without it, its protected part is a `B-n`.
- **App code is read-only** (when `ai/project.md` → **Legacy sources** names a path): read routes,
  validations and messages to find behaviour; never edit, build or run it.
- **Scaffolding is not an oracle** and never blocks a PR: nightly only, a red result is a signal for
  a human, and **you never update a snapshot** (`--update-snapshots` is the human's call).
- **No framework code before Gate 1.** Scaffolding before Gate 1 is page level only, through the
  generic `pageManager.anyPage`; new Page Objects / controllers come only through the gap plan of
  `automate-feature`, after Gate 1.
- Gates, evidence, blocked items, ids, questions, commits: exactly as in `automate-feature` →
  **Rules**. You number the questions (`Q-n`) and the observations (`O-n`).

## Status line

The handoff exists from Gate A on. Its status line uses the `automate-feature` step numbers; all of
this flow until Gate 1 is step 1:

| Point                                    | Status line                                         |
| ---------------------------------------- | --------------------------------------------------- |
| After Gate A (init)                      | `Status: step 1 Scenarios — in progress (observe)`  |
| Step 3                                   | `Status: step 1 Scenarios — in progress (scaffold)` |
| Step 4                                   | `Status: step 1 Scenarios — in progress (triage)`   |
| Gate 1 approved                          | `Status: step 1 Scenarios — done`                   |
| Step 5 (after `automate-feature` Gate 3) | `Status: step 5 Review — done (close zone)`         |

Steps 0–1 have no handoff yet; report them in chat.

## Dry run

Asked for a dry run (rehearsal), or no permission to write under `specs/` / `tests/`:

- the app map, the spec and the scaffolding are drafts in `.work/<feature>/` (`app-map.md`,
  `<feature>.md`, `<zone>.characterization.test.ts`). Lint and `npm run handoff -- check` resolve
  `specs/app-map.md` and `specs/<feature>.md` to the drafts next to them;
- the snapshots are not written (the runner sees only `tests/characterization/`) — say so;
- section 0 has `- Mode: dry-run`; gate answers in Approvals carry `(dry-run)`;
- the dry run **ends after Gate 1**: the rest is the `automate-feature` dry run on the same handoff.
  Go-live as in `ai/instructions/08-handoff.md` → **Dry run**, plus: the app map moves to
  `specs/app-map.md` and the scaffolding to `tests/characterization/`, then step 3.2 runs for real.

## 0. Baseline

`npm run verify`, as in `automate-feature` step 0.4. No handoff yet — the feature is named after the
zone the user picks at Gate A.

## 1. Assess → Gate A

1. `specs/app-map.md` missing → create it from `ai/templates/app-map.template.md`. Present → read it;
   reuse its zones, never renumber them.
2. Explore with `playwright-cli` (fallback Playwright MCP): pages, forms, the network calls each page
   makes. Add the OpenAPI spec, old docs / TMS cases and app code when `ai/project.md` names them.
   Read only — no writes before Gate A. Third-party hosts (analytics, tracking, CDNs) are not the
   app: list them once under **Third-party hosts** in the app map, never as observations.
3. Zones, as the template says: high risk (money, permissions, stored data) → one feature per zone;
   medium / low → grouped by area; **~15 zones at most**. Per zone: entry points, risk, status
   `unexplored`. A zone partly held by functional tests already → `partial` with a `- Covered:` line
   (run `ui-coverage-reviewer` / `api-coverage-reviewer` when tests exist). Rank zones by risk.
4. **Gate A.** Show the zones ranked by risk and the zone you recommend. For that zone ask:
   - **the zone** — a group zone picked here is split first: the feature becomes its own `Z-n`;
   - **access**, when part of the zone is behind a sign-in: a saved session (storage state from
     `auth.setup.ts`, run by the human), the human signs in in the browser pane, or no access → the
     protected part is a `B-n` and out of scope. Record it under **Access** in the app map;
   - **the writes** the exploration needs, each with why → **Approved writes** (`W-n`).
5. After the answer: `npm run handoff -- init <feature>` (kebab-case, after the zone); section 0:
   `- Flow: characterization`, requirement source `none — characterization (Z-n, O-n in the spec)`,
   the Mode; record Gate A in **Approvals**; status as in **Status line**.

## 2. Observe

1. Explore the chosen zone: each page and form, its states and messages, the network calls and their
   responses; the approved writes only, with the access chosen at Gate A. Note every behaviour a test
   could check. Skip the third-party hosts of the app map.
2. Write `specs/<feature>.md` with `create-spec-from-requirement` → **Characterization flow**:
   scenarios with **Steps** but no **Expected** lines yet, and the **Observations** table — one row
   per behaviour (`O-n`, source, env / date / account, triage `pending`). Flag in the observation
   text what looks wrong (inconsistent messages, 500s, data loss, secrets on the page) so triage sees
   it first.
3. **Cross-zone check.** Read the other specs of the app (their Expected lines and **Known defects**)
   for the same kind of behaviour — messages for the same error, the same field rules, the same
   status codes. An observation that contradicts one gets a ⚠ and a note:
   `contradicts specs/<other>.md#N.M` (or `F-n` / `@bug-<id>`).
4. Section 1 of the handoff: spec path, zone `Z-n`, scenario numbers. App map: zone status
   `observed`, `Spec:` filled in.

## 3. Scaffold (page level)

1. One file per zone: `tests/characterization/<feature>.test.ts`. Each test: tag `@characterization`
   and `@unlinked`, `source` → `specs/app-map.md#Z-n`, and only `expectAriaSnapshot(name)` /
   `expectResponseShape(response, name)` as assertions — lint enforces this. Before Gate 1 a test
   only opens a page of the zone and snapshots it:

   ```ts
   async ({ pageManager: { anyPage } }) => {
     await anyPage.open('/two_factor');
     await anyPage.expectAriaSnapshot('first-factor-form');
   };
   ```

   States that need an action (a submitted form, an error) or an API shape need Page Object /
   controller members → they are added after Gate 1, through the gap plan of `automate-feature`,
   only when the zone keeps scaffolding (a scenario left open as `Q-n`).

2. First run creates the snapshots: `npm run test:characterization -- <file>` (it fails once while
   writing them; run again — it must be green). Read the snapshot files: a value that leaks personal
   or secret data (a password shown on the page, an e-mail) → ask before committing it.
3. App map: zone status `scaffolded`, `Scaffolding:` filled in. `npm run characterization:check`.

## 4. Triage → Gate 1

1. Show the **Observations** table, suspicious ones (⚠, cross-zone contradictions) first. Ask one
   question per **behaviour**: observations of the same behaviour (e.g. the same message for several
   wrong inputs) share one question, the others get one each. Four answers; apply the answer the
   same turn to **every** `O-n` it covers — each keeps its own triage cell:

   | Answer                         | Apply                                                                                                                      |
   | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
   | **Intended** (+ who confirms)  | **Expected** line in its scenario: `… (O-n; confirmed by <who>, <date>)`; triage `intended → N.M`                          |
   | **Bug, correct value known**   | **Expected** line with the **correct** value and its confirmation; `F-n` + **Known defects**; triage `suspected bug → F-n` |
   | **Bug, correct value unknown** | **Open questions** line with an owner; no Expected line, no functional test; triage `suspected bug → Q-n`                  |
   | **Not relevant**               | **Out of scope** line with the reason; triage `out of scope`                                                               |

   A cross-zone contradiction is asked as such: "zone A says X, zone B does Y — which one is
   intended?" One answer may then also mean a `Q-n` or `F-n` for the other zone's spec.

2. A scenario left without Expected lines is dropped from the spec (its zone stays scaffolded).
3. `npm run handoff -- check <feature>` — no Expected line without a confirmation, no observation
   `pending`.
4. **Gate 1.** Show the spec's scenarios with their confirmed Expected lines, the `F-n`, the open
   questions, out of scope. Record the approval; status `step 1 Scenarios — done`.

## Hand-over → automate-feature

Run `automate-feature` **from step 2** on the same handoff (it resumes from the status line). The
confirmed observations are its requirement: the reviewer and `adversarial-tester` check the tests
against them, exactly as against any requirement. Functional tests cite `specs/<feature>.md#N.M`,
never the app map, and never use `anyPage`.

## 5. Close the zone (after Gate 3)

1. Every confirmed scenario of the zone is covered by a functional test → delete the zone's
   scaffolding test and its snapshot folder; app map: status `covered`, `Scaffolding: —`.
   Some entry points covered, others not → status `partial`, `- Covered:` lists the covered ones.
   Scenarios still open (`Q-n` with an owner) → keep the scaffolding; status stays `scaffolded`.
2. `npm run characterization:check` and `npm run verify`.
3. Final output as in `automate-feature`, plus: zone status, observations by triage
   (intended / bug / open / out of scope), scaffolding kept or deleted, the next zone by risk from
   the app map.
