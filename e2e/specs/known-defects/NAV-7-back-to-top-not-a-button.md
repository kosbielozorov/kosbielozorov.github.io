# NAV-7 — The back-to-top button cannot be used from the keyboard

<!-- From ai/templates/known-defect.template.md. Linked from specs/navigation.md → Known defects (F-4). -->

- **Severity:** low — a keyboard or screen-reader user cannot use the shortcut back to the top
- **Found:** 2026-11-13, characterization of zone Z-4 Navigation, `specs/navigation.md` O-5 → F-4
  (the button belongs to zone Z-7; fixed with navigation, decided at triage)
- **Pinned test:** `tests/ui/navigation.test.ts`, scenario 1.7 (`test.fail`, `@bug-NAV-7`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> After scrolling, a button named "Back to top" (uk "Нагору") is shown, reached by Tab; Enter
> scrolls the page to the top (O-5; confirmed by the site owner, 2026-11-13).

## Actual

The control is `<div title="Back to top" onClick={() => window.scrollTo(0, 0)}>` with an `svg`
inside — no role, no `tabindex`; its only name source is `title`.

## Reproduce

Open http://localhost:5173/, scroll down; press Tab repeatedly — the yellow arrow bottom right never
gets focus.

## Where

`src/components/CallToAction/index.jsx` ~line 24: the `div` rendered while `isScrolled`.

## Suggested fix

Make it `<button type="button" aria-label={t('cta.backToTop')} onClick={…}>` keeping the classes
(Tailwind's preflight resets the button look); keep `title` if the tooltip is wanted; `aria-hidden`
on the `svg`. After scrolling to the top, move the focus to the top of the page (e.g. the first
header control) so a keyboard user is not left on a button that disappears. Check by hand: the
bounce animation and position are unchanged.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-7` tag, remove the F-4 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
