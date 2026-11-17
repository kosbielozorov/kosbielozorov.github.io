# Language switching

## Scope

- In scope: zone Z-2 of `specs/app-map.md` — which language a first visit gets, the stored choice,
  the `EN | UA` switchers in the header and in the drawer on every route, `<html lang>`, the
  switcher for assistive technology.
- Out of scope: the resume page's own switching details that `specs/resume-page.md` 1.4 holds (its
  sections, the PDF link) — scenario 1.3 checks `/my-resume` only as one of the routes; each page's texts as content (Z-1, Z-3, Z-6); head
  metadata beyond the title (Z-5); the live deployment.
- Out of scope: the ITVDN course title "Manual QA Engineer" in the Ukrainian resume stays in
  English — the course's own name, like "HTML / CSS / JavaScript" (O-4, 2026-11-17). With it,
  scenario "no text left in the other language" had no other observation and was dropped.

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- The language is chosen by `i18next` (`src/i18n.js`): the stored choice
  (`localStorage.i18nextLng`) first, then the browser's language; supported `en` and `uk`, anything
  else falls back to `en`.

## Risks

- The whole site exists twice; a wrong or mixed language on the first visit is the first thing a
  visitor sees.

## Test data

- None. The browser language is the context `locale`; a stored choice is seeded into
  `localStorage.i18nextLng` before the page loads.

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id  | Observation                                                                                                                                                                                                                                 | Source                 | Env, date, account                                                                                                              | Triage              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| O-1 | ⚠ The `EN` / `UA` buttons do not expose which language is active — no `aria-pressed` or `aria-current`; only colour and underline mark it                                                                                                   | UI, code               | dev, 2026-11-17, —                                                                                                              | suspected bug → F-1 |
| O-2 | ⚠ The switcher group is labelled "Language" in Ukrainian too (`aria-label` not translated)                                                                                                                                                  | UI, code               | dev, 2026-11-17, —                                                                                                              | suspected bug → F-2 |
| O-3 | ⚠ The Ukrainian button reads `UA` — a country code, not the language (`uk`); neither button names its language for a screen reader ("English" / "Українська")                                                                               | UI, code               | dev, 2026-11-17, —                                                                                                              | suspected bug → F-3 |
| O-4 | ⚠ The Ukrainian resume lists a course as "Manual QA Engineer" (ITVDN, 2021, `educations[0].certification` in `src/info/uk.js`) — the same English text as in the English resume; the other shared texts are names (companies, tools, links) | UI, code               | dev, 2026-11-17, —                                                                                                              | out of scope        |
| O-5 | First visit, nothing stored: browser `uk-UA` or `uk` → Ukrainian; `en-US`, `ru-RU`, `de-DE`, `pl-PL` → English; the detected value is stored (`uk-UA`, `uk`, `en-US`, `en`)                                                                 | UI                     | dev, 2026-11-17, —                                                                                                              | intended → 1.1      |
| O-6 | A stored choice wins over the browser: `uk` stored with an English browser → Ukrainian; `en` with a Ukrainian browser → English; an unsupported stored value (`de`, `garbage`) is ignored → the browser's language                          | UI                     | dev, 2026-11-17, —                                                                                                              | intended → 1.2      |
| O-7 | Clicking `UA` in the header on `/`, `/my-resume` or the 404 page changes the texts, the title (`/`: `<full name>                                                                                                                            | <position>`, 404: `404 | <Page not found>`) and `<html lang>`without a reload and stores`uk`; the choice survives a reload and holds on the other routes | UI                  | dev, 2026-11-17, — | intended → 1.3 |
| O-8 | The drawer has its own switcher; it changes the language the same way, the drawer stays open, and its own labels change too ("Меню", "Відкрити меню"); both switchers always mark the same language                                         | UI                     | dev, 2026-11-17, —                                                                                                              | intended → 1.4      |
| O-9 | `<html lang>` is `en` or `uk` on every route, matching the page's language                                                                                                                                                                  | UI, code               | dev, 2026-11-17, —                                                                                                              | intended → 1.3      |

## Scenarios

### 1. Language switching

#### 1.1 The first visit gets the browser's language

**Steps:**

1. With nothing stored, open `/` with the browser in `uk-UA`, `uk`, `en-US` and an unsupported
   language (`de-DE`).

**Expected:**

- With nothing stored, a Ukrainian browser (`uk-UA`, `uk`) gets the Ukrainian site and any other language (`en-US`, `de-DE`) the English one; the detected language is stored (O-5; confirmed by the site owner, 2026-11-17).
- The stored value is exactly the browser's language when supported (`uk-UA`, `uk`, `en-US`) and `en` for an unsupported one (`de-DE`) (O-5; confirmed by the site owner (Q-1), 2026-11-17).

#### 1.2 A stored choice wins

**Steps:**

1. Store `uk` and open `/` with an English browser; store `en` and open it with a Ukrainian one.
2. Store an unsupported value and open `/`.

**Expected:**

- A stored `uk` wins over an English browser and a stored `en` over a Ukrainian one; an unsupported stored value is ignored and the browser's language is used (O-6; confirmed by the site owner, 2026-11-17).

#### 1.3 Switching on every route

**Steps:**

1. On `/`, `/my-resume` and the 404 page click `UA` in the header; reload; open another route.

**Expected:**

- On `/`, `/my-resume` and the 404 page, `UA` in the header switches the texts, the title and `<html lang>` (`uk`) without a reload and stores `uk`; the choice holds after a reload and on the other routes (O-7, O-9; confirmed by the site owner, 2026-11-17).
- After a switch the stored value is exactly `uk` (or `en`) (O-7; confirmed by the site owner (Q-1), 2026-11-17).
- The titles are `<full name> | <position>` on `/` ("Kostiantyn Bielozorov | Manual and automation QA engineer" / "Костянтин Бєлозьоров | Інженер з ручного та автоматизованого тестування") and `404 | <Page not found>` on the 404 page ("404 | Page not found" / "404 | Сторінку не знайдено"); the resume's as `specs/resume-page.md` 1.6 (O-7; confirmed by the site owner (Q-5), 2026-11-17).

#### 1.4 Switching from the drawer

**Steps:**

1. At 375 px open the drawer and click `UA`.

**Expected:**

- The drawer's `UA` switches the language the same way, the drawer stays open and its own labels follow; the header and drawer switchers mark the same language (O-8; confirmed by the site owner, 2026-11-17).

#### 1.5 The switcher for assistive technology

**Steps:**

1. Read the switcher's group label, button names and state in both languages.

**Expected:**

- The active language's button has `aria-pressed="true"`, the other `aria-pressed="false"`, in the header and in the drawer (O-1; confirmed by the site owner, 2026-11-17).
- That holds in both languages — after switching to `UA` the `UA` buttons are pressed (O-1; confirmed by the site owner (Q-4), 2026-11-17).
- The switcher group's label is translated — "Language" in English, a Ukrainian label in Ukrainian (O-2; confirmed by the site owner, 2026-11-17).
- The Ukrainian label is "Мова" (O-2; confirmed by the site owner (Q-2), 2026-11-17).
- Each button's accessible name says the language — it contains "English" and "Українська"; the buttons may still show `EN` / `UA` (O-3; confirmed by the site owner, 2026-11-17).
- The names keep the visible code: "English (EN)" and "Українська (UA)" (WCAG 2.5.3, label in name) (O-3; confirmed by the site owner (Q-3), 2026-11-17).

## Known defects

- F-1 / `@bug-LANG-1` (2026-11-17): scenario 1.5 — the switcher buttons do not expose the active language → `specs/known-defects/LANG-1-active-language-not-announced.md`
- F-2 / `@bug-LANG-2` (2026-11-17): scenario 1.5 — the switcher group is labelled "Language" in Ukrainian too → `specs/known-defects/LANG-2-switcher-label-not-translated.md`
- F-3 / `@bug-LANG-3` (2026-11-17): scenario 1.5 — the buttons are named "EN" / "UA", not the languages → `specs/known-defects/LANG-3-buttons-do-not-name-the-language.md`
