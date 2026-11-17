# NAV-6 — The current menu item is marked only visually

<!-- From ai/templates/known-defect.template.md. Linked from specs/navigation.md → Known defects (F-3). -->

- **Severity:** low — a screen-reader user cannot tell which menu item is current
- **Found:** 2026-11-13, characterization of zone Z-4 Navigation, `specs/navigation.md` O-4 → F-3
- **Pinned test:** `tests/ui/navigation.test.ts`, scenario 1.2 (`test.fail`, `@bug-NAV-6`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The marked item carries `aria-current`; the other items do not (O-4; confirmed by the site owner,
> 2026-11-13).

## Actual

The marked item differs only by colour (`text-black` vs `text-[#e9b200]`) and the visible tick
(`.menu-effect` opacity 1); no item has `aria-current`, in the header menu or in the drawer.

## Reproduce

Open http://localhost:5173/ at 1440 px; in the console
`document.querySelectorAll('header nav a[aria-current]').length` → 0.

## Where

`src/components/Header/index.jsx` — `NavigationLink` (~line 80): `className` depends on
`selectedIndex === index`; the same index drives the tick `span`. `DiagonalDrawer.jsx` — the drawer
links use `selectedIndex1` the same way.

## Suggested fix

In `NavigationLink`, add `aria-current={selectedIndex === index ? 'location' : undefined}` (an
in-page section is a "location"; `'true'` is also fine). Do the same for the four drawer links with
`selectedIndex1`. No visual change.

`aria-current="false"` on the other items is acceptable (Q-2). Once fixed, the tests' `SiteMenu.expectMarked`
should check `aria-current` instead of the `text-black` styling class — tell the test owner.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-6` tag, remove the F-3 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
