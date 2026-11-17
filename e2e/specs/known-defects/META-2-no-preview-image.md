# META-2 — No page has a preview image

<!-- From ai/templates/known-defect.template.md. Linked from specs/head-metadata.md → Known defects (F-2). -->

- **Severity:** medium — shared links have no picture
- **Found:** 2026-11-17, characterization of zone Z-5 Head metadata, `specs/head-metadata.md` O-2 → F-2
- **Pinned test:** `tests/ui/head-metadata.test.ts`, scenario 1.1, 1.2 (`test.fail`, `@bug-META-2`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> `og:image` and `twitter:image` are an absolute `https://kosbielozorov.github.io/…` URL of an image
> the site serves (O-2; confirmed by the site owner, 2026-11-17).

## Actual

No `og:image` or `twitter:image` on `/` or `/my-resume`.

## Where

`src/components/MainLayout/index.jsx` and `src/components/Resume/index.jsx` (the `<Helmet>` blocks).

## Suggested fix

Add `<meta property="og:image" content="https://kosbielozorov.github.io/images/kos.jpg" />` and
`<meta name="twitter:image" content="…same…" />` to both pages (or a purpose-made 1200×630 image —
the owner's choice), with `og:image:alt`. Use the absolute URL: preview bots do not resolve relative
ones. Add the same to `index.html` for META-1.

If META-1 also puts an `og:image` into `index.html`, Helmet's own would make two — the pin keeps failing on "exactly once" until only one remains.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-META-2` tag, remove the F-2 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
