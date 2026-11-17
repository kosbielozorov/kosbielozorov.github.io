# NAV-4 — The home page scrolls sideways between ~620 and ~760 px

<!-- From ai/templates/known-defect.template.md. Linked from specs/navigation.md → Known defects (F-1). -->

- **Severity:** medium — on small tablets and wide phones in landscape the whole page wobbles
  sideways; every visitor of the home page at those widths
- **Found:** 2026-11-13, characterization of zone Z-4 Navigation, `specs/navigation.md` O-1 → F-1
- **Pinned test:** `tests/ui/navigation.test.ts`, scenario 1.3 (`test.fail`, `@bug-NAV-4`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The home page does not scroll sideways at 640, 700, 768, 1024, 1279 or 1280 px (O-1; confirmed by
> the site owner, 2026-11-13).

## Actual

`document.documentElement.scrollWidth − innerWidth` on `/`: 0 at 620, **66 at 640, 36 at 700, 6 at
760**, 0 at 780. Hiding the About Me flip card brings it to 0 at every width; hiding the header menu
changes nothing. `/my-resume` and the 404 page fit.

## Reproduce

Open http://localhost:5173/ in a 640 px wide window and scroll right — or in the console:
`document.documentElement.scrollWidth - innerWidth` → 66.

## Where

`src/components/AboutMe/index.jsx` ~line 169:

```jsx
className={`absolute perspective-500 -top-7 sm:top-30 right-0 sm:-right-20 card ${isFlipped ? 'flipped' : ''}`}
```

From the `sm` breakpoint (640 px) `-right-20` moves the card 80 px past its container's right edge;
above ~780 px the container is wide enough to hide it.

## Suggested fix

Keep the card inside the viewport at `sm`: e.g. `sm:right-0 lg:-right-20` (the offset only where
there is room), or clip the section (`overflow-x-clip` on the About Me section container — check
the card's shadow and rotation are not cut). Check by hand at 640, 700, 768, 1024 and 1440 px that
the card still sits where it does today on desktop. Do not hide the overflow on `body`/`html` — that
would mask the next overflow instead of fixing this one.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-4` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.
- The owner looks at the About Me card at a tablet width.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
