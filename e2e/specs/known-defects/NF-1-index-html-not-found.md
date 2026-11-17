# NF-1 — `/index.html` shows "Page not found"

<!-- From ai/templates/known-defect.template.md. Linked from specs/not-found-page.md → Known defects (F-1). -->

- **Severity:** low — an old link or bookmark to `/index.html` (common for static sites) lands on
  "Page not found" instead of the home page
- **Found:** 2026-11-17, characterization of zone Z-6 Not-found page, `specs/not-found-page.md` O-1 → F-1
- **Pinned test:** `tests/ui/not-found-page.test.ts`, scenario 1.2 (`test.fail`, `@bug-NF-1`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> `/index.html` shows the home page (it may redirect to `/`), not the not-found page (O-1; confirmed
> by the site owner, 2026-11-17).

## Actual

The server serves the app for `/index.html` (it is the real file), but the router has no route for
the path `/index.html`, so `*` renders `NotFound`.

## Reproduce

Open http://localhost:5173/index.html — "Page not found".

## Where

`src/App.jsx` — `<Route path="/" …/>`, `<Route path="/my-resume" …/>`, `<Route path="*" …/>`.

## Suggested fix

Add `<Route path="/index.html" element={<Navigate to="/" replace />} />` (from `react-router-dom`)
before the `*` route. The redirect keeps one URL for the home page (the canonical is `/`). Check by
hand that `/index.html#contact-me` keeps its hash if that matters (`<Navigate to={{ pathname: '/',
hash: location.hash }} replace />`).

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NF-1` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
