# NAV-1 — The drawer toggle cannot be used from the keyboard

<!-- From ai/templates/known-defect.template.md. Linked from specs/smoke.md → Known defects (F-1). -->

- **Severity:** medium — on narrow screens (below 1280 px) the drawer is the only menu; a keyboard
  or screen-reader visitor cannot open it
- **Found:** 2026-11-13, characterization of zone Z-0 Smoke, `specs/smoke.md` O-2 → F-1
- **Pinned test:** `tests/ui/smoke.test.ts`, scenario 1.6 (`test.fail`, `@bug-NAV-1`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> At 375 px the drawer toggle is a button with an accessible name, reached by Tab and opened with
> Enter or Space (O-2; confirmed by the site owner, 2026-11-13).

## Actual

The toggle is a `div` with an `onClick` — no `role`, no `tabindex`, so Tab skips it and Enter does
nothing; its only name is the image alt `drawer item`. The close control inside the drawer is the
same kind of `div`.

## Reproduce

Open http://localhost:5173/ at 375 px wide; press Tab repeatedly — the toggle (blue square,
top-left) never gets focus.

## Where

- `src/components/Header/index.jsx` ~line 109: `<div onClick={openDrawer} className="z-30 absolute
cursor-pointer …"><img src="/images/drawer.png" alt="drawer item" …/></div>`
- `src/components/Header/DiagonalDrawer.jsx` ~line 27: the close `div onClick={() => setIsOpen(false)}`

## Suggested fix

Replace both `div`s with `<button type="button">` keeping the classes; give them a translated
`aria-label` (e.g. `t('nav.openMenu')` / `t('nav.closeMenu')` in `src/locales/`), `aria-expanded`
and `aria-controls` pointing at the drawer; the image becomes decorative (`alt=""`). When the drawer
opens, move focus into it; on close, back to the toggle; Escape closes it. Check by hand: the look
of the toggle is unchanged (a button has default border / padding — reset them), both languages.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-1` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
