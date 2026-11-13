# RESUME-1 — The Ukrainian resume PDF is a copy of the English one

- **Severity:** high — a Ukrainian-speaking recruiter downloads an English
  resume that is also out of date.
- **Found:** 2026-11-12, characterization of zone Z-1
  (`e2e/specs/resume-page.md`, O-1 → F-1).
- **Pinned test:** `e2e/tests/ui/resume-page.test.ts` → _the Ukrainian PDF
  differs from the English one_ (`test.fail`, `@bug-RESUME-1`), scenario 1.3.

## Expected (confirmed by the site owner)

> The Ukrainian PDF is a Ukrainian resume — a different file from the English
> one (1.3). In English the button downloads `qa-engineer-k.bielozorov-en.pdf`,
> in Ukrainian `qa-engineer-k.bielozorov-ua.pdf`; each answers 200
> `application/pdf` (1.3 — already true).

## Actual

- `public/download/qa-engineer-k.bielozorov-en.pdf` and `…-ua.pdf` are
  byte-identical (`md5 6c73be5150f959c7bc1ed0b3a24b353c`, 257 089 bytes).
- The PDF metadata: `Lang en`, `Title "Vite + React"`, `Creator Chrome 131`,
  created 2025-01-28 — printed from the browser before the site became bilingual
  (commit `53dcb41`, 2026-03-22). Its content is older than the current resume
  page.

## Reproduce

```bash
md5 public/download/*.pdf
```

Or: open `/my-resume` in Ukrainian (`localStorage.i18nextLng = 'uk'`), click
«Завантажити резюме», open the file — English text.

## Where

- `public/download/qa-engineer-k.bielozorov-en.pdf`,
  `public/download/qa-engineer-k.bielozorov-ua.pdf`
- The page already prints well: `src/components/Resume/resume.css` →
  `@media print` (A4, 8 × 10 mm margins). The PDF file names come from
  `src/components/Resume/index.jsx` (`resumePdfFile`).

## Suggested fix

Regenerate **both** PDFs from the current page, so they match what the site
shows:

1. Add a small script, e.g. `e2e/scripts/print-resume.mjs` (or a root `scripts/`
   one), that with Playwright (`chromium`) opens
   `http://localhost:5173/my-resume` once with locale `en-US` and once with
   `uk-UA` (or `localStorage.i18nextLng`), waits for the page to load, and calls
   `page.pdf({ path, format: 'A4', printBackground: true, preferCSSPageSize: true })`
   into `public/download/…-en.pdf` / `…-ua.pdf`. The document title then becomes
   the resume title instead of `Vite + React`.
2. Run it with the dev server up (`npm run dev`), open both PDFs and check them
   visually: one page, all sections, Ukrainian text in the `-ua` file.
3. Optionally add an npm script (`"resume:pdf"`) so the PDFs are regenerated
   whenever the resume data changes.

Do **not** write resume content by hand — the PDF must be printed from
`src/info/{en,uk}.js` as the page renders it.

## Done when

- `md5 public/download/*.pdf` shows two different hashes; the `-ua` file
  contains Ukrainian text.
- The pinned test is reported _"expected to fail, but passed"_ → un-pinned (see
  `tasks/README.md`); the full `resume-page` run is green.
- **The owner has reviewed both PDFs** (it is their resume) before merging.
