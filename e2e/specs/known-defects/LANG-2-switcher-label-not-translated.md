# LANG-2 — The switcher is labelled "Language" in Ukrainian too

<!-- From ai/templates/known-defect.template.md. Linked from specs/language-switching.md → Known defects (F-2). -->

- **Severity:** low — a Ukrainian screen-reader user hears an English group name
- **Found:** 2026-11-17, characterization of zone Z-2 Language switching, `specs/language-switching.md` O-2 → F-2
- **Pinned test:** `tests/ui/language-switching.test.ts`, scenario 1.5 (`test.fail`, `@bug-LANG-2`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The switcher group's label is translated — "Language" in English, a Ukrainian label in Ukrainian
> (O-2; confirmed by the site owner, 2026-11-17).

## Actual

`<div role="group" aria-label="Language">` — a fixed English string.

## Reproduce

Open http://localhost:5173/ in Ukrainian; `document.querySelector('[role=group]').getAttribute('aria-label')` → "Language".

## Where

`src/components/LanguageSwitcher/index.jsx`: `aria-label="Language"`.

## Suggested fix

`aria-label={t('langSwitcher.label')}` with new keys `langSwitcher.label`: "Language" (en), "Мова"
(uk). Note for the test owner: the tests find the switcher by the group name "Language"
(`ResumePage.languageSwitcher`) — after the fix they must find it in either language.

The Ukrainian label is exactly "Мова" (Q-2).

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-LANG-2` tag, remove the F-2 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
