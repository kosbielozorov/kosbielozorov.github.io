# CONTENT-1 — Typos and a wrong label in the English resume data

- **Severity:** low — visible to every English reader of the resume and the home
  page.
- **Found:** 2026-11-12, characterization of zone Z-1
  (`e2e/specs/resume-page.md`, O-4, O-5, O-7 — out of scope for tests: texts are
  content, not pinned).
- **Pinned test:** none. This is a content edit; the e2e tests must stay green.

## Fix

All in `src/info/en.js` (the Ukrainian data `src/info/uk.js` is already right
for 1 and 2):

| #   | Line (approx.) | Now                                              | Should be                        |
| --- | -------------- | ------------------------------------------------ | -------------------------------- |
| 1   | 210            | `'Inbacket / MailPit'` (home → Soft and Tools)   | `'Inbucket / MailPit'`           |
| 2   | 259            | `'Inbacket/MailPit'` (resume → programs & tools) | `'Inbucket/MailPit'`             |
| 3   | 228            | `'Black/Grey White box testing'`                 | `'Black/Grey/White box testing'` |

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

- `grep -rn "Inbacket\|Black/Grey White" src/` finds nothing.
- Item 4: done only with the owner's wording, in both languages.
- `npm run lint` and `npm run build` pass; from `e2e/`, the `resume-page` tests
  stay green
  (`npx playwright test tests/ui/resume-page.test.ts --project=chromium`).
