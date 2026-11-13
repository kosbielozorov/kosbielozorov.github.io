# Bug tasks

Product defects found by the characterization of zone Z-1 Resume page
(`e2e/specs/resume-page.md`, 2026-11-12). Each file is a self-contained brief
for an AI coding agent (or a human): context, how to reproduce, the expected
behaviour (confirmed by the site owner), where the cause is, a suggested fix,
and how to prove it.

| Task                                     | Bug                   | Severity | Pinned test                                            |
| ---------------------------------------- | --------------------- | -------- | ------------------------------------------------------ |
| [RESUME-1](RESUME-1-ua-pdf.md)           | UA PDF = EN           | high     | `the Ukrainian PDF differs from the English one`       |
| [RESUME-2](RESUME-2-mobile-overflow.md)  | 375 px overflow (uk)  | medium   | `fits the screen in Ukrainian`                         |
| [RESUME-3](RESUME-3-meta-description.md) | two meta descriptions | medium   | `has a single meta description in English / Ukrainian` |
| [CONTENT-1](CONTENT-1-typos.md)          | content typos         | low      | none (texts are not pinned by tests)                   |

## Rules for every task

- **The expected behaviour is fixed.** It comes from `e2e/specs/resume-page.md`
  (Expected lines confirmed by the site owner). Change the site, never the
  expected value in a test.
- **A pinned test is the signal.** Each RESUME bug has a test marked
  `test.fail()` + `@bug-RESUME-n` in `e2e/tests/ui/resume-page.test.ts`. While
  the bug exists the run is green; once the fix works, Playwright reports it as
  _"expected to fail, but passed"_. Then un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-RESUME-n` tag, and remove the bug's
  line under **Known defects** in `e2e/specs/resume-page.md`.
- **Prove it:** from `e2e/`,
  `npx playwright test tests/ui/resume-page.test.ts --project=chromium` (the dev
  server starts by itself) must be green with no pinned test left for this bug,
  and `npm run verify` must pass. From the repo root, `npm run lint` and
  `npm run build` must pass.
- One task = one branch / PR. Do not commit or push without the owner's OK.
