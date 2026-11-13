# CONTENT-1 — The university degree is labelled as a certificate

- **Severity:** low — visible to every English reader of the resume and the home
  page.
- **Found:** 2026-11-12, characterization of zone Z-1
  (`e2e/specs/resume-page.md`, O-4, O-5, O-7 — out of scope for tests: texts are
  content, not pinned).
- **Pinned test:** none. This is a content edit; the e2e tests must stay green.
- **Paths:** relative to the site repository root; e2e commands run from `e2e/`.

## Fix

Items 1–3 (`Inbacket` → `Inbucket` twice, `Black/Grey White` → `Black/Grey/White` in
`src/info/en.js`) were fixed on 2026-11-13. Left:

**4 — needs the owner's wording first.** The university degree (Bila Tserkva
National Agrarian University, 2000–2005,
`certification: 'Management of organizations | Specialist'`, line ~284) is shown
as `Certification | Management of organizations | Specialist`, like the two
courses, because `src/components/Education/index.jsx` prefixes every entry with
`t('education.certification')` (`"Certification | "` / `"Сертифікат | "`).
Suggested: give each education entry a `type` (`certificate` / `degree`) and
translate the prefix per type (e.g. `Degree | ` / `Освіта | ` or
`Specialist degree`). Ask the owner for the exact wording in both languages
before changing it.

## Done when

- Item 4: done only with the owner's wording, in both languages.
- `npm run lint` and `npm run build` pass; from `e2e/`, the `resume-page` tests
  stay green
  (`npx playwright test tests/ui/resume-page.test.ts --project=chromium`).

Change the site, never the expected value in a test. Prove it: from `e2e/`, `npx playwright test tests/ui/resume-page.test.ts --project=chromium` and `npm run verify`; from the repo root, `npm run lint` and `npm run build`. Do not commit or push without the owner's OK.
