# NAV-3 — The drawer's social icon links have no accessible name

<!-- From ai/templates/known-defect.template.md. Linked from specs/smoke.md → Known defects (F-3). -->

- **Severity:** low — a screen reader announces four links as "link" with no destination
- **Found:** 2026-11-13, characterization of zone Z-0 Smoke, `specs/smoke.md` O-4 → F-3
- **Pinned test:** `tests/ui/smoke.test.ts`, scenario 1.6 (`test.fail`, `@bug-NAV-3`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The drawer's icon links have accessible names — GitHub, LinkedIn, Gmail, Telegram, as in the
> Contact Me section (O-4; confirmed by the site owner, 2026-11-13).
>
> Each named icon link points where the Contact Me link of the same name points (O-4; confirmed by
> the site owner (Q-4), 2026-11-13).

## Actual

The links to `https://github.com/kosbielozorov`, `https://www.linkedin.com/in/k-bielozorov/`,
`mailto:k.bielozorov@gmail.com` and `tg://resolve?domain=kostya_bels` contain only an `svg` — no
text, `aria-label`, `title` or `<title>`; their ARIA name is empty (see the ARIA snapshot
`tests/characterization/smoke.test.ts-snapshots/home-en-wide.aria.yml`: `- link:` with only `/url`).

## Reproduce

Open http://localhost:5173/, open the drawer (or run the scaffolding) and read the accessible names
of the links under "Follow me Around".

## Where

`src/components/Header/DiagonalDrawer.jsx` ~lines 158–225: `<a href={github.url} …><svg …/></a>` and
the three after it.

## Suggested fix

Add `aria-label="GitHub"`, `"LinkedIn"`, `"Gmail"`, `"Telegram"` to the four `<a>` (brand names — no
translation needed) and `aria-hidden="true"` to their `svg`. Check by hand: the Contact Me links keep
their visible text.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-NAV-3` tag, remove the F-3 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
