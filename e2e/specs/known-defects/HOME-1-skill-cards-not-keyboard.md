# HOME-1 — The skill cards cannot be chosen from the keyboard

<!-- From ai/templates/known-defect.template.md. Linked from specs/home-page.md → Known defects (F-1). -->

- **Severity:** medium — a keyboard or screen-reader visitor on a wide screen sees only the first
  skill's list
- **Found:** 2026-11-17, characterization of zone Z-3 Home page, `specs/home-page.md` O-1 → F-1
- **Pinned test:** `tests/ui/home-page.test.ts`, scenario 1.5 (`test.fail`, `@bug-HOME-1`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> At 1440 px each skill card is a button reached by Tab; Enter shows its skills, and the chosen card
> is marked for assistive technology (`aria-pressed` or `aria-current`) (O-1; confirmed by the site
> owner, 2026-11-17).

## Actual

The six cards are `<a onClick={…}>` with no `href`, role or `tabindex`: Tab skips them, they are not
announced as controls, and the chosen card differs only by colour.

## Reproduce

Open http://localhost:5173/ at 1440 px; Tab through About Me — no card gets focus.

## Where

`src/components/AboutMe/index.jsx` ~line 104: `about.skills.map((item, index) => <a key={index}
onClick={() => handleCardClick(item, index)} …>`.

## Suggested fix

Render each card as `<button type="button" aria-pressed={selectedIndex === index} onClick={…}>`
keeping the classes (Tailwind's preflight resets the button look; add `text-left`/`w-full` if the
layout shifts). The card's `h4` title gives the button its name; its icon becomes decorative
(HOME-3). Optionally group them: `role="group"` with a label such as the section heading. Check by
hand: hover and the selected look are unchanged; Enter and Space choose a card.

Space must work like Enter (Q-3) — a `<button>` gives both.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-HOME-1` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
