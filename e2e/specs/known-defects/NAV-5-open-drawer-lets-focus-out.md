# NAV-5 — Tab leaves the open drawer for controls hidden behind it

<!-- From ai/templates/known-defect.template.md. Linked from specs/navigation.md → Known defects (F-2). -->

- **Severity:** medium — a keyboard user tabs from the drawer into links they cannot see (the
  drawer covers the whole screen)
- **Found:** 2026-11-13, characterization of zone Z-4 Navigation, `specs/navigation.md` O-2 → F-2
- **Pinned test:** `tests/ui/navigation.test.ts`, scenario 1.4 (`test.fail`, `@bug-NAV-5`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> While the drawer is open, Tab and Shift+Tab keep the focus inside it (O-2; confirmed by the site
> owner, 2026-11-13).

## Actual

At 375 px, with the drawer opened from the keyboard, Tab goes Close menu → EN → UA → 4 menu links →
GitHub → LinkedIn → Gmail → Telegram → **Open menu** (the header behind the drawer) → **Experience**
→ **My resume** … (the hero's links, under the drawer). Shift+Tab from "Close menu" leaves too.

## Reproduce

Open http://localhost:5173/ at 375 px; Tab to "Open menu", Enter; press Tab 12 times and watch
`document.activeElement` leave `.diagonal-drawer`.

## Where

- `src/components/Header/index.jsx`: the drawer container (`#site-drawer`) and the header are
  siblings; while the drawer is open nothing keeps the rest of the page out of the Tab order.
- `src/components/Header/DiagonalDrawer.jsx`: the drawer moves the focus to "Close menu" on open.

## Suggested fix

While the drawer is open, make everything outside it inert: wrap the page content after the drawer
(header, main, footer) in an element that gets `inert` when `isOpen`, or set `inert` on those
siblings from the Header effect that already handles Escape. Then also mark the drawer
`role="dialog"` with `aria-modal="true"` and a label (`aria-label={t('nav.menu')}` or the existing
close/open names) so screen readers treat it as a modal. A hand-written focus trap (Tab/Shift+Tab
wrap) works too but is more code. Check by hand: Escape and "Close menu" still return the focus to
"Open menu"; the page is usable again after closing.

The focus may pass through the browser's own controls on its way round (so `inert` on the rest of
the page is a valid fix), but never land on a page control outside the drawer — Q-3, confirmed by the
site owner, 2026-11-13.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-5` tag, remove the F-2 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
