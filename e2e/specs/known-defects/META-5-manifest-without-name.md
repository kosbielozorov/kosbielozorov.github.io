# META-5 — The web manifest has no name

<!-- From ai/templates/known-defect.template.md. Linked from specs/head-metadata.md → Known defects (F-5). -->

- **Severity:** low — a home-screen shortcut or an installed site shows no name
- **Found:** 2026-11-17, characterization of zone Z-5 Head metadata, `specs/head-metadata.md` O-5 → F-5
- **Pinned test:** `tests/ui/head-metadata.test.ts`, scenario 1.5 (`test.fail`, `@bug-META-5`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> `/site.webmanifest` has a non-empty `name` and `short_name` (O-5; confirmed by the site owner,
> 2026-11-17).

## Actual

`public/site.webmanifest`: `"name":"","short_name":""`.

## Suggested fix

`"name": "Kostiantyn Bielozorov — QA engineer"`, `"short_name": "K. Bielozorov"` (or the owner's
wording); optionally `"start_url": "/"` and the brand `theme_color` `#48AFDE`.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-META-5` tag, remove the F-5 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
