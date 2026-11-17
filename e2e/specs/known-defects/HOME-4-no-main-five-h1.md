# HOME-4 — The home page has no main landmark and five h1

<!-- From ai/templates/known-defect.template.md. Linked from specs/home-page.md → Known defects (F-4). -->

- **Severity:** medium — screen-reader users navigate by landmarks and headings; here there is no
  `main` to jump to, every section heading is an `h1`, and "About Me" is read twice
- **Found:** 2026-11-17, characterization of zone Z-3 Home page, `specs/home-page.md` O-5 → F-4
  (first seen in `specs/smoke.md` O-6)
- **Pinned test:** `tests/ui/home-page.test.ts`, scenario 1.7 (`test.fail`, `@bug-HOME-4`) — added at
  `automate-feature` step 2
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`

## Expected

> The sections are inside a `main` landmark; the page has exactly one `h1` (the Home heading), the
> section headings sit below it, and the large background "About Me" text is hidden from assistive
> technology (O-5; confirmed by the site owner, 2026-11-17).

## Actual

No `main`/`role="main"`. `h1`s: "I'm Kostiantyn" (Home), "Professional experience", the 240 px
background "About Me", "About My Self", "Contact me". The resume and 404 pages already have a `main`.

## Reproduce

In the console on http://localhost:5173/: `document.querySelectorAll('main').length` → 0;
`document.querySelectorAll('h1').length` → 5.

## Where

- `src/components/MainLayout/index.jsx` ~lines 47–52: `<Header /> <Home /> <Experience /> <AboutMe />
<ContactMe /> <Footer />` with no `main` around the sections.
- `h1`: `Home/index.jsx` ~35 (keep), `Experience/index.jsx` ~30, `AboutMe/index.jsx` ~60 (the
  background text) and ~63, `ContactMe/index.jsx` ~22.

## Suggested fix

Wrap `<Home /> … <ContactMe />` in `<main>`. Change the section headings in Experience, AboutMe (~63)
and ContactMe to `<h2>` keeping their classes (Tailwind sets the look, not the tag). Make the
background "About Me" a `<p aria-hidden="true">` (or a `div`) with the same classes. Check by hand
that nothing moves: the tags change, the classes do not. Check the resume and 404 pages keep their
single `main` (MainLayout is the home page only).

The same in Ukrainian: the background "Про мене" (`about.watermark`) is hidden too (Q-4).

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pin it in the same change:
  `test.fail(` → `test(`, remove the `@bug-HOME-4` tag, remove the F-4 line under the spec's
  **Known defects**, and delete this file.
- `npm run test` and `npm run verify` (in `e2e/`) pass; the site's `npm run build` passes.

Change the app, never the expected value in a test. Do not commit or push without the owner's OK.
