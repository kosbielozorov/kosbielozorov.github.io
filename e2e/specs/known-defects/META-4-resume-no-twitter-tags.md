# META-4 — The resume page has no Twitter tags

<!-- From ai/templates/known-defect.template.md. Linked from specs/head-metadata.md → Known defects (F-4). -->

- **Severity:** low — X/Twitter previews of the resume fall back to Open Graph inconsistently
- **Found:** 2026-11-17, characterization of zone Z-5 Head metadata, `specs/head-metadata.md` O-4 → F-4
- **Pinned test:** `tests/ui/head-metadata.test.ts`, scenario 1.2 (`test.fail`, `@bug-META-4`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> `twitter:card` `summary`, `twitter:title` = the title and `twitter:description` = the summary are
> set, as on the home page (O-4; confirmed by the site owner, 2026-11-17).

## Where

`src/components/Resume/index.jsx` ~lines 88–95 (the `<Helmet>` block).

## Suggested fix

Add `<meta name="twitter:card" content="summary" />`, `twitter:title` = `pageTitle`,
`twitter:description` = `description` — copy the pattern of `MainLayout`.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-META-4` tag, remove the F-4 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
