# NAV-2 — The closed drawer takes the first ten Tab stops

<!-- From ai/templates/known-defect.template.md. Linked from specs/smoke.md → Known defects (F-2). -->

- **Severity:** medium — every keyboard visitor, on every page and width, tabs through ten invisible
  controls before reaching anything on screen
- **Found:** 2026-11-13, characterization of zone Z-0 Smoke, `specs/smoke.md` O-3 → F-2
- **Pinned test:** `tests/ui/smoke.test.ts`, scenario 1.6 (`test.fail`, `@bug-NAV-2`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> While the drawer is closed none of its controls takes keyboard focus: the first Tab stop is a
> visible control (O-3; confirmed by the site owner, 2026-11-13).

## Actual

On `/` at 1440 and 375 px the first ten Tab stops are, in order: `EN`, `UA`, Home, Experience, About
Me, Contact Me and four icon links — all inside `.diagonal-drawer`, which is closed and moved off
screen; the focus ring is drawn off screen. The visible header menu is the 11th stop.

## Reproduce

Open http://localhost:5173/ at 1440 px; press Tab once — nothing visible gets focus.

## Where

- `src/components/Header/DiagonalDrawer.css`: `.diagonal-drawer { transform: translate(-100%, -100%) }`
  hides the closed drawer only visually.
- `src/components/Header/index.jsx` ~line 97: the drawer is always rendered.

## Suggested fix

Make the closed drawer inert: `inert` on `.diagonal-drawer` while `!isOpen` (React 19 supports the
attribute; on React 18 set it through a ref), or `visibility: hidden` on the closed state with a
delayed transition so the slide-out animation still plays. Rendering it only when open would lose the
animation. Keep the drawer's container class `.diagonal-drawer` — the tests find the drawer by it (or
add a `data-testid` and tell the test owner). Check by hand: opening and closing still animate; with the drawer open, Tab moves through
its controls.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-2` tag, remove the F-2 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
