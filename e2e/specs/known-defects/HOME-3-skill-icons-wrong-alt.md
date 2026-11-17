# HOME-3 — Every skill icon says "internet issues"

<!-- From ai/templates/known-defect.template.md. Linked from specs/home-page.md → Known defects (F-3). -->

- **Severity:** low — a screen reader reads "internet issues" before each of the six skills
- **Found:** 2026-11-17, characterization of zone Z-3 Home page, `specs/home-page.md` O-3 → F-3
- **Pinned test:** `tests/ui/home-page.test.ts`, scenario 1.7 (`test.fail`, `@bug-HOME-3`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The skill icons are decorative: `alt=""` (O-3; confirmed by the site owner, 2026-11-17).

## Actual

`/images/first.svg` … `/images/sixth.svg` all have `alt="internet issues"`, in both languages.

## Reproduce

In the console on http://localhost:5173/:
`[...document.querySelectorAll('img[src$=".svg"]')].map(i => i.alt)` → six times "internet issues".

## Where

`src/components/AboutMe/index.jsx` ~line 117: `<img … src={item.img} alt="internet issues" />`.

## Suggested fix

`alt=""` — the skill's title is written right under the icon. Nothing visible changes.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-HOME-3` tag, remove the F-3 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
