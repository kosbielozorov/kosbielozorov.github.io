# RESUME-3 — Two `meta description` tags; the static English one comes first

- **Severity:** medium — search engines and link previews may show the generic
  English text `Kostiantyn Bielozorov - QA engineer` instead of the page's own
  description, also for Ukrainian.
- **Found:** 2026-11-12, characterization of zone Z-1
  (`e2e/specs/resume-page.md`, O-3 → F-3). Seen on `/`, `/my-resume` and the 404
  page (zone Z-5 Head metadata).
- **Pinned tests:** `e2e/tests/ui/resume-page.test.ts` → _has a single meta
  description in English_ and _… in Ukrainian_ (`test.fail`, `@bug-RESUME-3`),
  scenario 1.6.

## Expected (confirmed by the site owner)

> The head has exactly one `meta description` — the page's own, in the page's
> language (1.6). The page's own description starts with the full name of the
> page's language, then a spaced dash (1.6, Q-4): `Kostiantyn Bielozorov – …` /
> `Костянтин Бєлозьоров – …`.

## Actual

`document.querySelectorAll('meta[name=description]')` on `/my-resume` returns
two tags:

1. `Kostiantyn Bielozorov - QA engineer` — static, from `index.html` line 5;
2. `Kostiantyn Bielozorov – QA engineer with knowledge of …` (uk:
   `Костянтин Бєлозьоров – QA-інженер …`) — added by `react-helmet-async` in
   `src/components/Resume/index.jsx`.

`react-helmet-async` only manages tags it created, so it never replaces the
static one.

## Where

- `index.html` line 5:
  `<meta name="description" content="Kostiantyn Bielozorov - QA engineer" />`
- Per-page descriptions: `src/components/MainLayout/index.jsx` (home),
  `src/components/Resume/index.jsx` (resume),
  `src/components/NotFound/index.jsx` (404).

## Suggested fix

Option A (recommended, smallest): delete the static `meta description` from
`index.html`. Every route already sets its own through `<Helmet>`.

Option B (keeps a fallback for crawlers that do not run JS): keep the static tag
but mark it as managed by Helmet — add `data-rh="true"` — and **verify** in the
browser that Helmet then replaces it instead of adding a second one. If it does
not, use option A.

Either way check all three routes (`/`, `/my-resume`, an unknown path) in both
languages: one description each, in the page's language. The build copies
`index.html` to `build/404.html` (`vite.config.js`), so the fix applies to the
GitHub Pages fallback too.

## Done when

- Both pinned tests are reported _"expected to fail, but passed"_ → un-pinned
  (see `tasks/README.md`).
- `/` and the 404 page also have exactly one `meta description` (check by hand;
  zone Z-5 will get its own tests).
