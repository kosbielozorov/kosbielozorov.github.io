# META-3 — The home page has no canonical URL

<!-- From ai/templates/known-defect.template.md. Linked from specs/head-metadata.md → Known defects (F-3). -->

- **Severity:** low — search engines may index `/`, `/#home` and `/index.html` as different pages
- **Found:** 2026-11-17, characterization of zone Z-5 Head metadata, `specs/head-metadata.md` O-3 → F-3
- **Pinned test:** `tests/ui/head-metadata.test.ts`, scenario 1.1 (`test.fail`, `@bug-META-3`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> `canonical` and `og:url` are `https://kosbielozorov.github.io/` (O-3; confirmed by the site owner,
> 2026-11-17).

## Where

`src/components/MainLayout/index.jsx` — the `<Helmet>` block has no `canonical` or `og:url`.

## Suggested fix

`<link rel="canonical" href="https://kosbielozorov.github.io/" />` and
`<meta property="og:url" content="https://kosbielozorov.github.io/" />`, as the resume page does
with its own URL.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-META-3` tag, remove the F-3 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
