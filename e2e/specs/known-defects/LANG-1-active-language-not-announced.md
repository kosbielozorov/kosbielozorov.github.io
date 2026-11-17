# LANG-1 — The switcher does not tell which language is active

<!-- From ai/templates/known-defect.template.md. Linked from specs/language-switching.md → Known defects (F-1). -->

- **Severity:** low — a screen reader announces "EN" and "UA" alike; the active one is shown only by colour and underline
- **Found:** 2026-11-17, characterization of zone Z-2 Language switching, `specs/language-switching.md` O-1 → F-1
- **Pinned test:** `tests/ui/language-switching.test.ts`, scenario 1.5 (`test.fail`, `@bug-LANG-1`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The active language's button has `aria-pressed="true"`, the other `aria-pressed="false"`, in the
> header and in the drawer (O-1; confirmed by the site owner, 2026-11-17).

## Actual

Both buttons are plain `<button>`s; the active one differs only by its classes (`underline`,
colour). No `aria-pressed` or `aria-current`.

## Reproduce

In the console on http://localhost:5173/:
`[...document.querySelectorAll('[role=group] button')].map(b => b.getAttribute('aria-pressed'))` →
all `null`.

## Where

`src/components/LanguageSwitcher/index.jsx` — the two `<button>`s; `active(code)` already knows
which one is active.

## Suggested fix

`aria-pressed={active('en')}` and `aria-pressed={active('uk')}` on the two buttons. One component
serves the header and the drawer, so both are fixed at once. No visual change.

Both languages: after switching to `UA` the `UA` buttons are pressed (Q-4). After the fix, the
tests' `LanguageSwitcher.expectActive` (1.4, today the `underline` class) should move to
`aria-pressed` — tell the test owner.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-LANG-1` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
