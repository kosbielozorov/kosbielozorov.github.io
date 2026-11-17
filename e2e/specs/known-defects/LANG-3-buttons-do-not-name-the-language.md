# LANG-3 — The language buttons are named "EN" and "UA"

<!-- From ai/templates/known-defect.template.md. Linked from specs/language-switching.md → Known defects (F-3). -->

- **Severity:** low — a screen reader reads two letters ("UA" is a country code) instead of the language
- **Found:** 2026-11-17, characterization of zone Z-2 Language switching, `specs/language-switching.md` O-3 → F-3
- **Pinned test:** `tests/ui/language-switching.test.ts`, scenario 1.5 (`test.fail`, `@bug-LANG-3`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> Each button's accessible name says the language — it contains "English" and "Українська"; the
> buttons may still show `EN` / `UA` (O-3; confirmed by the site owner, 2026-11-17).

## Actual

The buttons' names are their texts, `EN` and `UA` (`langSwitcher.en` / `langSwitcher.uk`).

## Reproduce

Read the accessible names of the two buttons in the `Language` group on http://localhost:5173/.

## Where

`src/components/LanguageSwitcher/index.jsx` — the two `<button>`s.

## Suggested fix

Keep the visible `EN` / `UA` and add `aria-label="English (EN)"` / `aria-label="Українська (UA)"`
(the visible text stays part of the name — WCAG 2.5.3), with `lang="en"` / `lang="uk"` on each
button so the name is pronounced right. The language names are the same in both page languages.
Note for the test owner: the tests click the buttons by the names `EN` / `UA` — after the fix they
must use a name that matches both (e.g. a regex).

The names are exactly "English (EN)" and "Українська (UA)" (Q-3) — the visible code stays in the
name.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-LANG-3` tag, remove the F-3 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
