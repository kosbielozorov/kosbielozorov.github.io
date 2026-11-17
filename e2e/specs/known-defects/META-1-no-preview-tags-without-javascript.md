# META-1 — Link previews get the title only

<!-- From ai/templates/known-defect.template.md. Linked from specs/head-metadata.md → Known defects (F-1). -->

- **Severity:** high — every link to the site shared in Telegram, LinkedIn, Facebook or Slack shows a bare title with no text or picture
- **Found:** 2026-11-17, characterization of zone Z-5 Head metadata, `specs/head-metadata.md` O-1 → F-1
- **Pinned test:** `tests/ui/head-metadata.test.ts`, scenario 1.4 (`test.fail`, `@bug-META-1`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> Without JavaScript, the HTML of `/` and `/my-resume` already has `og:title`, `og:description` and
> `og:image` (site-wide English defaults are enough); once the app has run, each of these tags and
> `description` appear exactly once, with the page's own values (O-1; confirmed by the site owner,
> 2026-11-17).

## Actual

`index.html` (the shell of every route, and `404.html` on GitHub Pages) has only
`<title>Kostiantyn Bielozorov - QA engineer</title>`. All other tags are added by
`react-helmet-async` at runtime, which preview bots never run. The static description was removed in
RESUME-3 because it duplicated Helmet's.

## Reproduce

`curl -s http://localhost:5173/ | grep -c 'og:'` → 0.

## Where

`index.html`; Helmet tags in `src/components/MainLayout/index.jsx` and
`src/components/Resume/index.jsx`.

## Suggested fix

Two parts, both needed:

1. Add site-wide defaults to `index.html`: `description`, `og:title`, `og:description`, `og:image`
   (absolute URL, see META-2), `og:type` `website`, `twitter:card`.
2. Avoid duplicates once the app runs: Helmet only manages tags it rendered (`data-rh`), so give the
   static tags the same `data-rh="true"` attribute (Helmet then takes them over), or remove the
   static ones on start in `src/main.jsx` before rendering. Check in the browser that each tag appears
   once (the RESUME-3 test — a single description — must stay green).

A better long-term fix is pre-rendering each route (e.g. `vite-plugin-prerender` or a build step
writing per-route HTML with its own tags); that also gives the resume its own preview. Ask the
owner before adding a build dependency.

The static `og:image` must be an absolute `https://kosbielozorov.github.io/…` URL of a served image (Q-1).

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-META-1` tag, remove the F-1 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
