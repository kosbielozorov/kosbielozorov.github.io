---
name: automate-feature
description: >-
  Orchestrates covering one feature with Playwright tests end to end: requirement → scenarios in
  specs/ → test-first tests and gap plan → Page Objects / controllers → green run → independent
  review, with three user approval gates and all state in .work/<feature>/handoff.md. Use when the
  user asks to automate, cover or write tests for a feature, story, requirement document or a set
  of Testomat cases, or to resume such work ("continue <feature>"). Not for one test or one POM
  method (playwright-test-creator), healing an existing failure (trace-triage), or plan review only
  (grill-me-qa).
---

# Automate a feature (orchestrator)

You run the chain and enforce its gates. The specialised skills do the work; you keep the handoff
`.work/<feature>/handoff.md` as the only place where steps exchange results. Its format, ids and size
rules: `ai/instructions/08-handoff.md`. Code rules: `ai/instructions/02-architecture.md` →
**Framework contract**. Read both, and `ai/project.md`, before step 0.

```text
0 Setup → 1 Scenarios → [Gate 1] → 2 Tests and gaps → [Gate 2] → 3 Implementation → 4 Run → 5 Review → [Gate 3]
```

## Rules

- **Run the steps in order. Never skip a gate.** A gate is a real stop: show the user what the gate
  row in `08-handoff.md` lists, ask **Approve / Change / Stop**, and wait. Record the answer in
  **Approvals**. Never take a decision that belongs to a gate (scope, an expected value, an id).
- **Evidence, not claims.** After each step run its check yourself (`npm run handoff -- check
<feature>`, `npm run gaps`, the test run). Do not trust a step's own report that it is done.
- A failed check goes back to the step that owns it **at most 2 times**; then stop and report.
- Blocked items (`B-n`: no access, app down, missing test id) do not stop independent work: continue
  with the rest and list the dependent tests as blocked. Never report a blocked item as done.
- **Oracle:** expected values come from the requirement only (contract → **Map and oracle**). The
  app tells you how to reach the UI, never what is correct. Handoff `Flow: characterization`
  (legacy app, started by `characterize-feature`): the requirement is the spec's **confirmed
  observations**; steps 0–1 and Gate 1 were done there, so resume at step 2, and after Gate 3 hand
  back to `characterize-feature` → **5. Close the zone**.
- Never commit, push, open a PR, or write to the TMS without the user's explicit OK.
- The shipped example sets (`ai/project.md` → **Examples**) are pattern references: never extend them
  for this feature.
- Update the handoff status line after every step.
- **Every `Q-n` ends in the spec, not in the handoff.** The handoff lives in `.work/` and is not
  committed. Ask each `Q-n` as its own question with three answers and apply the answer the same turn:

  | Answer                    | Apply                                                                                                                                                                      |
  | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Requirement** (+ value) | New **Expected** line or new scenario in `specs/<feature>.md`, citing `Q-n`; back to step 1 for that scenario only, then steps 2–5 for the tests it touches (max 2 rounds) |
  | **Out of scope** (+ why)  | A line under **Out of scope**: `<case> — <reason> (Q-n, <date>)`                                                                                                           |
  | **Open** (decide later)   | A line under **Open questions**: `Q-n: <question> — asked <date>, owner <who>`; listed in the PR description                                                               |

  Then mark the `Q-n` line in the handoff `→ requirement | out of scope | open`. A question already in
  the spec's **Out of scope** or **Open questions** is decided: do not ask it again — except at
  go-live from a dry run, where every question is asked again (`08-handoff.md` → **Dry run**).

- **You number the questions.** Skills and subagents propose `Q-?`, one decision each; split a
  bundled proposal and give each part the next free `Q-n`.

## 0. Setup

1. Feature name: kebab-case, from the user's words (ask if unclear). Mode: `live` unless the user
   asks for a rehearsal (`dry-run` — see `08-handoff.md` → **Dry run**). A dry run **ends after
   Gate 2**: write section 3 as a plan of files per `G-n`, mark sections 4 and 5 not applicable,
   and give the final output.
2. **Resume:** if `.work/<feature>/handoff.md` exists, read its status line and Approvals and continue
   from there. Re-show a gate whose inputs changed since it was approved. Going live from a dry run →
   follow `08-handoff.md` → **Dry run** → "To go live".
   Otherwise: `npm run handoff -- init <feature>`; status `step 0 Setup — in progress`.
3. Record the requirement source in section 0. A Testomat `@T` / suite → `testomatio-mcp`
   **Workflow A** first (read-only); the TMS case text becomes the requirement.
4. Baseline: `npm run verify`. Red before you start → a `B-n` line, show it, ask whether to go on.
   On resume, re-run it when the working tree changed since the recorded baseline (`git status`,
   `git log -1`); record the new result and date.

## 1. Scenarios → Gate 1

1. Scope large or unclear, or the user asks to challenge it → offer `grill-me-qa` first; feed its TSDR
   into the next step.
2. `create-spec-from-requirement` → `specs/<feature>.md` (dry-run: `.work/<feature>/<feature>.md`).
   Every **Expected** line comes from the requirement; an unclear outcome is a `Q-n`, never a guess.
3. Section 1: spec path, scenario numbers in scope, out of scope with reasons, `Q-n` lines.
4. **Requirement trace.** Split the requirement into clauses (one checkable statement each) and map
   every clause to the **Expected** line(s) that check it, or to **Out of scope** / a `Q-n`. A clause
   with no row is a missing Expected line — fix the spec before the gate.
5. **Gate 1.** Show the trace table (clause → Expected line / out of scope / `Q-n`), ask each `Q-n`
   that changes an expected outcome as its own question, then the gate.

## 2. Tests and gaps → Gate 2

1. `npm run catalog:generate`; read `specs/framework-catalog.md` — reuse what exists.
2. Write the tests **first** with `playwright-test-creator` → **Test first, then gaps**, as drafts in
   `.work/<feature>/*.test.ts`: fixtures and POM / controller calls only, the business names the
   test wants. One `source` annotation per test → its scenario (`specs/<feature>.md#<N.M>`). Ids:
   real `@T` only if known, else `@unlinked`.
3. **Before** running `gaps`, write section 2: `**Tests:**` (the draft paths) and the `**Gap plan:**`
   (`- G-n KIND key` per missing member).
4. `npm run handoff -- check <feature>` — contract lint on the drafts, then the gap comparison.
   Fix every contract error before Gate 2. An **unplanned** gap is a misspelled or renamed existing
   member → fix the draft, not the plan. A `similar to:` hint is the usual suspect. Type errors other
   than gaps → fix the draft.
5. **Gate 2.** Show the draft tests, the gap plan and the `check` output.
6. **Live, after approval:** move the drafts to `tests/ui/` or `tests/api/` (or a feature subfolder),
   update `**Tests:**`, re-run `check`. Offer `testomatio-mcp` **Workflow B** to create the TMS cases
   and retag `@unlinked` → `@T<id>` — writes only after the user's OK.

## 3. Implementation

1. For each open `G-n`: `generate-pom-skeleton` (page / component / modal, registered on
   `PageManager`) or `generate-controller-skeleton` (registered on `ControllersManager`); fixtures in
   `app/fixtures/index.ts`. Locators from the live app via `playwright-cli` → Playwright MCP, per
   `selector-governance`. JSDoc per `jsdoc`.
2. Implement exactly the planned gaps — no extra methods "for later" (YAGNI).
3. Section 3: per `G-n`, the file and class / method that closes it.
4. Done when `npm run handoff -- check <feature>` lists every gap `closed` and `npm run gaps` reports
   `0 gap(s), 0 other error(s)`.

## 4. Run

1. `npx playwright test <test files> --project=chromium`.
2. On failure: `trace-triage`, then classify per contract **Healing**:
   - `test` → heal (POM → shared constants → test), re-run;
   - `product` → `F-n` line, ask the user for the bug id, pin with `test.fail()` + `@bug-<id>`, and
     add a line under the spec's **Known defects** linking a defect brief
     `specs/known-defects/<id>-<slug>.md` (`ai/templates/known-defect.template.md`); the expected
     value stays;
   - `data` → fix data / fixture;
   - `environment` → `B-n` line, status `blocked`.
3. Section 4: the exact command, the result, each failure with its class and evidence.

## 5. Review → Gate 3

1. Run `npm run verify` yourself and record the result.
2. Review:
   - **Claude Code:** delegate to the `test-code-reviewer` subagent with the feature's test files and
     spec. Record its report in section 5 (`08-handoff.md` → section 5: verbatim verdict, findings,
     questions).
   - **Other tools:** do a separate review pass with the checklist in
     `.claude/agents/test-code-reviewer.md`; mark section 5 `self-review`.
3. `changes needed` → back to the step that owns each finding (max 2 rounds).
4. **Adversarial pass (Claude Code) — always offer, run only on the user's yes.** Offer the
   `adversarial-tester` subagent for every feature; **recommend** it when the feature is risky (money,
   permissions, complex forms) or the reviewer listed weak-assertion suspects. Record its report in
   section 5 under the review.
   - A **[PROVED]** weakness caused by this feature goes back to its owning step: step 3 (strengthen
     the POM / controller assertion) or step 2 (the test).
   - A **[REASONED]** finding is judged first: run one `adversarial-judge` subagent **per finding**
     (fresh context, in parallel), passing only the finding's **Judge brief** and the feature name —
     never the tester's argument or report. The yes to the adversarial pass covers the judges.
     - `proved` → treat it as [PROVED] (above).
     - `refuted` → record it in section 5 with the judge's probe paths; it does not go to the user.
     - `out of scope` → record it in section 5 with the `Q-n` that decided it; it does not go to the
       user.
     - `stands` → it goes to the user, with the judge's reason.
       **Other tools** (no subagents): skip the judge; every [REASONED] finding goes to the user.
   - A [REASONED] finding that reaches the user: **Accepted** → it goes back to its owning step
     exactly like a [PROVED] one. **Rejected** → record the reason next to it in section 5.
5. **Questions from the review.** Number each proposed `Q-?` (reviewer, adversarial pass) and resolve
   it per the **Rules** table above; its line goes in section 5. A **Requirement** answer reopens the
   chain for that scenario; Gate 3 waits until it is through.
6. **After any change made in step 5** (a finding or an answer sent work back): re-run step 4 (the
   run) and the reviewer (step 5.2) before Gate 3, as "Round 2" in section 5. The adversarial pass is
   re-run only on the user's yes.
7. **Gate 3.** Show the verdict, the gate results, the findings, the changed files, and the `Q-n`
   resolutions (requirement / out of scope / open).

## Final output

1. Status per step: done / not applicable / blocked (`B-n`).
2. Files changed, grouped: specs, tests, pages / components / modals, controllers / schemas /
   interfaces, fixtures.
3. Coverage: scenario `N.M` → test title → id tag (`@T` or `@unlinked`).
4. Open items: the spec's **Open questions** (with owners), `F-n` (with bug ids), `B-n`. Every `Q-n`
   of the handoff is either resolved in the spec or listed here — none is only in the handoff.
5. The last gate results (verify, gaps, run, review verdict).
6. A PR description draft from the above. Commit / PR only after the user's OK.
