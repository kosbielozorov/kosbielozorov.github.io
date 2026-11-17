# HOME-2 — The skill arrows on phones are unnamed and not focusable

<!-- From ai/templates/known-defect.template.md. Linked from specs/home-page.md → Known defects (F-2). -->

- **Severity:** medium — below 640 px the arrows are the only way through the skills; keyboard and
  screen-reader visitors on phones cannot use them
- **Found:** 2026-11-17, characterization of zone Z-3 Home page, `specs/home-page.md` O-2 → F-2
- **Pinned test:** `tests/ui/home-page.test.ts`, scenario 1.5 (`test.fail`, `@bug-HOME-2`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> At 375 px "previous" and "next" are buttons with accessible names, reached by Tab; Enter moves
> through the skills (O-2; confirmed by the site owner, 2026-11-17).

## Actual

Both arrows are `<a onClick={HandlePrev|HandleNext}>` without `href`, role or `tabindex`; the only
content is an `aria-hidden` `svg`, so they have no name either.

## Reproduce

Open http://localhost:5173/ at 375 px; Tab through About Me — the two arrows under the skills panel
never get focus.

## Where

`src/components/AboutMe/index.jsx` ~lines 179 and 199: `<a onClick={HandlePrev} …>` and
`<a onClick={HandleNext} …>`.

## Suggested fix

Make both `<button type="button">` with translated `aria-label`s (new keys, e.g.
`about.prevSkill` "Previous skill" / "Попередня навичка" and `about.nextSkill` "Next skill" /
"Наступна навичка" in `src/locales/{en,uk}`), keeping the classes. Check by hand: they look the
same and still cycle 6 → 1 and 1 → 6.

Space must work like Enter (Q-3) — a `<button>` gives both.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-HOME-2` tag, remove the F-2 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
