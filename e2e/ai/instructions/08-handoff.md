# Handoff — shared state of one feature

One feature = one working file: `.work/<feature>/handoff.md` (gitignored, like the drafts next to
it). Every step — a skill, a subagent or a person — reads its inputs from the handoff and writes its
result there. Chat history is not a hand-over: a step that is not in the handoff did not happen.

Skill `automate-feature` runs the steps below in order and keeps this file. Create it with
`npm run handoff -- init <feature>` (from `ai/templates/handoff.template.md`).
Check it with `npm run handoff -- check <feature>`. Code rules stay in the
**Framework contract** (`02-architecture.md`); this file defines only the hand-over.

## Steps and sections

| #   | Step           | Done by (skill / agent)                                                  | Reads | Writes | Gate after |
| --- | -------------- | ------------------------------------------------------------------------ | ----- | ------ | ---------- |
| 1   | Scenarios      | `grill-me-qa` (optional) → `create-spec-from-requirement`                | 0     | 1      | Gate 1     |
| 2   | Tests and gaps | `playwright-test-creator` → **Test first, then gaps**; `npm run gaps`    | 0, 1  | 2      | Gate 2     |
| 3   | Implementation | `generate-pom-skeleton`, `generate-controller-skeleton`, `jsdoc`         | 2     | 3      | —          |
| 4   | Run            | `npx playwright test`; on failure `trace-triage` + contract **Healing**  | 2, 3  | 4      | —          |
| 5   | Review         | `test-code-reviewer` subagent (read-only; the runner records its report) | all   | 5      | Gate 3     |

Section 0 (header and status) and **Approvals** belong to whoever runs the chain (the user or an
orchestrator). They update the status line after every step.

A gate is a real stop: show the user what the row says, record the answer in **Approvals**, and go on
only after **Approve**. **Change** sends the work back to the step that owns it.

| Gate | Show the user                                                                                      |
| ---- | -------------------------------------------------------------------------------------------------- |
| 1    | The scenarios (by number) in `specs/<feature>.md`, open questions, out of scope                    |
| 2    | The test files and the gap plan, with the `check` result (contract lint clean, plan equals `gaps`) |
| 3    | The reviewer's verdict, gate results, findings; the list of changed files                          |

## Stable ids

Never reuse or renumber an id inside one handoff. Cite ids instead of repeating text. Only the
runner (the user or the orchestrator) assigns ids: skills and subagents propose questions as `Q-?`,
one decision per question, and the runner gives each the next free number.

| Id    | Meaning                                                                                  | Written in |
| ----- | ---------------------------------------------------------------------------------------- | ---------- |
| `Q-n` | Question to the user / BA (blocks the scenarios that cite it until resolved in the spec) | 1, 5       |
| `G-n` | Gap: a fixture / page / controller / method the tests need (`gaps`)                      | 2          |
| `F-n` | Finding: product behaviour differs from the requirement (oracle)                         | 4, 5       |
| `B-n` | Blocker: something outside this feature stops a step (env, access)                       | any        |

## Size and reading rules

Every step reads the handoff, so its size is a cost on every step.

- **One copy of each fact.** The requirement lives in `specs/<feature>.md`, the tests in their files.
  The handoff names them by path and scenario number — it never pastes their text.
- A table cell holds at most 250 characters. Longer reasoning goes into a `Q-`, `F-` or `B-` line.
- Soft limit: 15 KB. `check` warns above it — trim duplicates before the next step.
- Read only your sections: `grep -n "^## " .work/<feature>/handoff.md`, then that line range.

## Section rules

**0. Status.** One line: `Status: step <n> <name> — in progress | done | blocked (B-n)`, with
`<n>` from 0 (`step 0 Setup`) to 5. Plus the feature name, the requirement source (story, TMS case, document) and the mode (`live` / `dry-run`). And the flow: `requirement` (the default — Expected lines come from a requirement) or `characterization` (a legacy app without one — skill `characterize-feature`: Expected lines are confirmed observations; `check` then requires a confirmation on every **Expected** line of the spec and a triage on every observation once step 1 is done). In that flow the handoff is created after Gate A, and the whole flow up to Gate 1 reports as `step 1 Scenarios — in progress (observe | scaffold | triage)` (`characterize-feature` → **Status line**).

**1. Scenarios.** The spec path, the scenario numbers in scope, what is out of scope and why, and
`Q-n` lines. Do not copy scenario text. Each `Q-n` line ends with its resolution once answered:
`→ requirement (spec N.M)`, `→ out of scope`, or `→ open` — the answer itself lives in
`specs/<feature>.md` (**Expected** line, **Out of scope**, or **Open questions**), because `.work/` is
not committed. Format: `Q-1: <question> → out of scope`.

**2. Tests and gaps.**

- `**Tests:**` — every test file of this feature **as it exists now**, backticked (a draft under
  `.work/<feature>/` or the final path under `tests/`); `check` requires each to exist, so put
  planned paths on another line. Update the line when a draft moves to `tests/`.
- `**Gap plan:**` — one line per gap, written **before** running `npm run gaps`:
  `- G-1 PAGE pageManager.homePage`, `- G-2 METHOD pageManager.homePage.expectWelcome`
  (kinds and keys exactly as `npm run gaps` prints them).
- `check` runs `gaps` on the listed tests and compares: a gap in the output but not in the plan is a
  **misspelled or renamed existing member** → fix the test. A planned gap that is no longer reported
  is **closed**.
- `check` also runs the Framework-contract lint rules (`TEST_CONTRACT_RULES` in `eslint.config.js`)
  on the listed tests — drafts under `.work/` included, which `npm run lint:contract` skips. A
  draft may cite a spec draft next to it (`.work/<feature>/<feature>.md`) as
  `specs/<feature>.md#N.M`; a file under `tests/` may not. Type-aware rules run only after the move
  to `tests/` (`npm run verify`).

**3. Implementation.** Per `G-n`: the file and the class / method that closes it. Files changed.
Done when `check` reports every gap closed and `npm run gaps` reports `0 gap(s), 0 other error(s)`.

**4. Run.** The exact command, the result, and per failure its class from contract **Healing**
(`test` / `product` / `data` / `environment`) with the evidence. `product` → an `F-n` line, a pin, and a line under the spec's **Known defects** (committed);
`environment` → a `B-n` line and status `blocked`. A blocked run is never a pass.

**5. Review.** The `test-code-reviewer` report, recorded by the runner (the reviewer itself is
read-only): the gates it re-ran, the findings, the verdict (`ready` / `changes needed` /
`offline verified; runtime blocked`). If the optional `adversarial-tester` ran, its report follows:
verdict (`weak tests` / `tests hold`), **[PROVED]** / **[REASONED]** findings with probe paths and
operator ids, proposed questions; then, per [REASONED] finding, the `adversarial-judge` decision
(`proved` / `refuted` / `out of scope` / `stands`) with its probe paths. **Verbatim:** the verdict, every finding and every proposed question. **May be
condensed:** layout, gate output, "hunted, nothing broke" detail — give the path of the full report
(the subagent transcript) when you condense. Never write a verdict or finding the subagent did not
give. Questions raised in review get their `Q-n` lines **here, in section 5**, each with its
resolution (same format as section 1). A second review round is appended as "Round 2", not merged.

**Approvals.** One row per gate: gate, date, what was approved, the user's answer.

## Dry run

A dry run rehearses the chain without touching the repository: the spec and the tests stay drafts
under `.work/<feature>/`, nothing is created under `app/`, `tests/` or `specs/`, and the TMS is
read-only. The status line says `dry-run`. Gate answers are recorded in Approvals with `(dry-run)`.

- The draft tests' `source` annotations already use the **live** spec path (`specs/<feature>.md#N.M`):
  they become valid when the spec moves there.
- The dry run **ends after Gate 2** (a `characterize-feature` dry run: after Gate 1 — skill →
  **Dry run**). Section 3 lists the files the live run would create per `G-n`;
  sections 4 and 5 are `Not applicable (dry-run)`.
- **Dry-run answers are a rehearsal.** A `Q-n` answered or a gate approved in the dry run counts
  only for the dry run: at go-live ask every question again and show both gates again — even when the
  dry-run spec already lists the question under **Out of scope** or **Open questions**.
- To go live:
  1. Remove `dry-run` from the status line; re-run the baseline (`npm run verify`).
  2. Move the spec to `specs/<feature>.md`, remove its dry-run banner, and re-check it against the
     `create-spec-from-requirement` template (sections, `(Q-n, <date>)` out-of-scope format, reasons,
     the requirement-to-Expected trace). Show every change as a delta at Gate 1.
  3. Show Gates 1 and 2 again, then move the drafts to `tests/` and continue with step 3.

## Never in a handoff

Credentials, tokens, `.env` values, auth-state contents, pasted traces or logs (give the artifact
path instead).
