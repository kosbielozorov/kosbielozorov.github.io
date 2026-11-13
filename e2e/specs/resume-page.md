# Resume page

## Scope

- In scope: zone Z-1 of `specs/app-map.md` — the resume page `/my-resume` in English and Ukrainian:
  profile, sections, contacts, the PDF download, the language switch on the page, "Back to home",
  the page's head metadata, the mobile layout.
- Out of scope: the language switcher itself on other pages (zone Z-2), the home page (Z-3), the
  live GitHub Pages deployment (`DEV_BASE_APP_URL` is the local Vite server).
- Out of scope: content typos in the English skills — `Inbacket/MailPit` (→ `Inbucket/MailPit`) and
  `Black/Grey White box testing` (→ `Black/Grey/White box testing`); a content fix in
  `../src/info/en.js`, texts are not pinned by tests (O-4, O-5, 2026-11-12).
- Out of scope: the university degree labelled `Certification | …` like the courses — a content
  wording issue in `../src/info/`, not tested (O-7, 2026-11-12).

- Out of scope: "Back to home" checked in Ukrainian too — the same link and `href`, only the text is
  translated, and texts are not pinned by tests (Q-1, 2026-11-13).
- Out of scope: the chosen language surviving a reload — language persistence belongs to zone Z-2
  Language switching (Q-2, 2026-11-13).
- Out of scope: the fields of the JSON-LD `Person` (name, job title, e-mail, phone, links) — head
  metadata belongs to zone Z-5; here only its presence is checked (Q-3, 2026-11-13).

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- The texts come from `../src/info/{en,uk}.js` and `../src/locales/`; a text change there is a
  content change, not a regression — tests check structure and the behaviours confirmed below.

## Risks

- The resume is what a recruiter comes for: a wrong PDF or a wrong contact loses the contact.

## Test data

- None — a static page. The language is set through `localStorage.i18nextLng` (`en` / `uk`).

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id   | Observation                                                                                                                                                                                                                                                                  | Source        | Env, date, account | Triage              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------ | ------------------- |
| O-1  | ⚠ The EN and UA resume PDFs are byte-identical (`md5` equal, 257 089 bytes); the PDF says `Lang en`, `Title "Vite + React"`, created 2025-01-28 — a Ukrainian visitor downloads the English file, older than the site's content (2026-03)                                    | code, network | dev, 2026-11-12, — | suspected bug → F-1 |
| O-2  | ⚠ Mobile (375 px), Ukrainian: the name heading `БЄЛОЗЬОРОВ` overflows — the page scrolls sideways (392 px wide); English fits                                                                                                                                                | UI            | dev, 2026-11-12, — | suspected bug → F-2 |
| O-3  | ⚠ The head has two `meta description` tags: the static `Kostiantyn Bielozorov - QA engineer` from `index.html` first, then the page's own (`<name> – <summary>`); same on the home and 404 pages (zone Z-5)                                                                  | UI, code      | dev, 2026-11-12, — | suspected bug → F-3 |
| O-4  | ⚠ English skills list `Inbacket/MailPit`; the English experience and the Ukrainian skills say `Inbucket/MailPit`                                                                                                                                                             | UI            | dev, 2026-11-12, — | out of scope        |
| O-5  | ⚠ English skills list `Black/Grey White box testing`; Ukrainian says `Black/Grey/White box тестування`                                                                                                                                                                       | UI            | dev, 2026-11-12, — | out of scope        |
| O-6  | ⚠ Telegram on the resume links to `https://t.me/kostya_bels`; on the home page and in the menu to `tg://resolve?domain=kostya_bels` (opens only with the app installed)                                                                                                      | UI            | dev, 2026-11-12, — | intended → 1.2      |
| O-7  | ⚠ Education: the university degree (2000–2005) is labelled `Certification \| Management of organizations \| Specialist` (uk `Сертифікат \| …`), like the two courses                                                                                                         | UI            | dev, 2026-11-12, — | out of scope        |
| O-8  | The page shows the full name as the only `h1`, the position, a photo (`/images/kos.jpg`, alt `Kostiantyn Bielozorov photo` / `Фото Костянтина Бєлозьорова`) and the sections Summary, Experience, Education, Skills, Languages (uk: Підсумок, Досвід, Освіта, Навички, Мови) | UI            | dev, 2026-11-12, — | intended → 1.1      |
| O-9  | Contacts: `k.bielozorov@gmail.com` → `mailto:`, `+38 (098) 794-95-07` → `tel:+380987949507`, LinkedIn, GitHub and Telegram links — the same in both languages                                                                                                                | UI            | dev, 2026-11-12, — | intended → 1.2      |
| O-10 | "Download my resume" (uk "Завантажити резюме") downloads `qa-engineer-k.bielozorov-en.pdf` in English and `qa-engineer-k.bielozorov-ua.pdf` in Ukrainian; the server answers 200 `application/pdf`                                                                           | UI, network   | dev, 2026-11-12, — | intended → 1.3      |
| O-11 | Switching EN ↔ UA on the page changes every text, the title and the PDF link without a reload, and stores the choice in `localStorage.i18nextLng`                                                                                                                            | UI            | dev, 2026-11-12, — | intended → 1.4      |
| O-12 | "Back to home" (uk "На головну") leads to `/#home`                                                                                                                                                                                                                           | UI            | dev, 2026-11-12, — | intended → 1.5      |
| O-13 | Title `<name> – <position> \| My resume` (uk `… \| Моє резюме`); `canonical` and `og:url` = `https://kosbielozorov.github.io/my-resume`; `og:type` `profile`; a JSON-LD `Person` (name, job title, e-mail, phone, links)                                                     | UI            | dev, 2026-11-12, — | intended → 1.6      |
| O-14 | The page loads with no console errors and no failed requests, in both languages                                                                                                                                                                                              | UI, network   | dev, 2026-11-12, — | intended → 1.8      |

## Scenarios

### 1. Resume page

#### 1.1 The resume page shows the profile and its sections

**Steps:**

1. Open `/my-resume` in English, then in Ukrainian.

**Expected:**

- The full name is the page's only `h1`; the position and the photo (with a text alternative) are shown (O-8; confirmed by the site owner, 2026-11-12).
- The name heading reads `Kostiantyn Bielozorov` in English and `Костянтин Бєлозьоров` in Ukrainian (O-8; confirmed by the site owner (Q-4), 2026-11-13).
- The position reads `Manual and automation QA engineer` in English and `Інженер з ручного та автоматизованого тестування` in Ukrainian (O-8; confirmed by the site owner (Q-5), 2026-11-13).
- The sections Summary, Experience, Education, Skills and Languages are shown in English, Підсумок, Досвід, Освіта, Навички and Мови in Ukrainian (O-8; confirmed by the site owner, 2026-11-12).

#### 1.2 The contacts lead to the right addresses

**Steps:**

1. Open `/my-resume`.
2. Read the contact links.

**Expected:**

- The e-mail links to `mailto:k.bielozorov@gmail.com`, the phone to `tel:+380987949507`, LinkedIn to `https://www.linkedin.com/in/k-bielozorov/`, GitHub to `https://github.com/kosbielozorov` — the same in both languages (O-9; confirmed by the site owner, 2026-11-12).
- Telegram links to `https://t.me/kostya_bels` (O-6; confirmed by the site owner, 2026-11-12).

#### 1.3 The resume PDF downloads in the visitor's language

**Steps:**

1. Open `/my-resume` in English; click "Download my resume".
2. Repeat in Ukrainian.

**Expected:**

- In English the button downloads `qa-engineer-k.bielozorov-en.pdf`, in Ukrainian `qa-engineer-k.bielozorov-ua.pdf`; each answers 200 `application/pdf` (O-10; confirmed by the site owner, 2026-11-12).
- The Ukrainian PDF is a Ukrainian resume — a different file from the English one (O-1; confirmed by the site owner, 2026-11-12).

#### 1.4 Switching the language on the resume page

**Steps:**

1. Open `/my-resume` in English.
2. Click `UA`, then `EN`.

**Expected:**

- `UA` / `EN` changes the page's texts, title and PDF link without a reload and stores the choice in `localStorage.i18nextLng` (O-11; confirmed by the site owner, 2026-11-12).
- After the switch the name and the position are the ones of the new language (1.1) (O-11; confirmed by the site owner (Q-4, Q-5), 2026-11-13).

#### 1.5 Back to home

**Steps:**

1. Open `/my-resume`; click "Back to home".

**Expected:**

- "Back to home" ("На головну") leads to `/#home` (O-12; confirmed by the site owner, 2026-11-12).

#### 1.6 The page's head metadata

**Steps:**

1. Open `/my-resume` in English, then in Ukrainian; read the head.

**Expected:**

- The title is `<name> – <position> | My resume` (`… | Моє резюме` in Ukrainian); `canonical` and `og:url` are `https://kosbielozorov.github.io/my-resume`; `og:type` is `profile`; the head has a JSON-LD `Person` (O-13; confirmed by the site owner, 2026-11-12).
- The head has exactly one `meta description` — the page's own, in the page's language (O-3; confirmed by the site owner, 2026-11-12).
- The page's own description starts with the full name of the page's language and `–` (O-3; confirmed by the site owner (Q-4), 2026-11-13).

#### 1.7 The page fits a phone screen

**Steps:**

1. Open `/my-resume` at 375 px wide, in English and in Ukrainian.

**Expected:**

- At 375 px wide the page fits the screen in both languages — no horizontal scroll (O-2; confirmed by the site owner, 2026-11-12).

#### 1.8 The page loads cleanly

**Steps:**

1. Open `/my-resume` in both languages; watch the console and the network.

**Expected:**

- No console errors and no failed requests, in both languages (O-14; confirmed by the site owner, 2026-11-12).

## Known defects

- F-1 / `@bug-RESUME-1` (2026-11-12): scenario 1.3 — the Ukrainian PDF is byte-identical to the English one (English text, `Title "Vite + React"`, created 2025-01-28).
- F-2 / `@bug-RESUME-2` (2026-11-12): scenario 1.7 — at 375 px in Ukrainian the name heading overflows; the page is 392 px wide.
- F-3 / `@bug-RESUME-3` (2026-11-12): scenario 1.6 — two `meta description` tags; the static English one from `index.html` comes first.
