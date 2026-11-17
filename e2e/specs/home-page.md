# Home page

## Scope

- In scope: zone Z-3 of `specs/app-map.md` — the content and behaviour of the home page's four
  sections (Home, Experience, About Me with the skills, Contact Me) in English and Ukrainian, at
  1440 and 375 px.
- Out of scope: what `specs/smoke.md` holds — the sections in order with a heading, the `h1` text,
  "My resume" and "View my full resume" (1.1, 1.2, 1.5); what `specs/navigation.md` holds — menu,
  drawer, back-to-top; language switching (Z-2); head metadata (Z-5); the footer (Z-7); the live
  deployment.
- Out of scope: the number of items in each skill's list — content (Q-2, 2026-11-17).

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- Texts come from `../src/info/{en,uk}.js` and `../src/locales/`; changing them is a content change,
  not a regression — tests check structure and the behaviours confirmed below, and only the texts a
  human confirms as fixed.

## Risks

- The home page is the first impression: who the owner is, what they did, what they can do, how to
  reach them.

## Test data

- None — a static page. The language is set through the browser locale (`en-US` / `uk-UA`).

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id   | Observation                                                                                                                                                                                                                                                                                                                 | Source   | Env, date, account | Triage              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | ------------------- |
| O-1  | ⚠ Wide screens: the six skill cards are `<a>` without `href`, role or `tabindex` — not focusable; a keyboard or screen-reader user cannot choose a skill                                                                                                                                                                    | UI, code | dev, 2026-11-17, — | suspected bug → F-1 |
| O-2  | ⚠ Narrow screens (below 640 px) hide the cards; the only way through the skills is two arrows — `<a>` without `href`, not focusable, with no name (their `svg` is `aria-hidden`)                                                                                                                                            | UI, code | dev, 2026-11-17, — | suspected bug → F-2 |
| O-3  | ⚠ All six skill icons have `alt="internet issues"` (both languages) — a wrong text alternative, read out six times                                                                                                                                                                                                          | UI, code | dev, 2026-11-17, — | suspected bug → F-3 |
| O-4  | ⚠ Contact Me links Telegram to `tg://resolve?domain=kostya_bels` (opens only with the app installed); the drawer does the same (`specs/smoke.md` 1.6); the resume page links `https://t.me/kostya_bels` (`specs/resume-page.md` 1.2, confirmed)                                                                             | UI       | dev, 2026-11-17, — | intended → 1.6      |
| O-5  | ⚠ No `main` landmark; five `h1` — "I'm Kostiantyn", "Professional experience", the large background text "About Me", "About My Self", "Contact me" — so a screen reader hears "About Me" twice and the outline is flat (`specs/smoke.md` O-6 sent it here)                                                                  | UI       | dev, 2026-11-17, — | suspected bug → F-4 |
| O-6  | Home: "Hi There!" (uk "Вітаю!"), the name heading, the position as `h2` ("Manual and automation QA engineer" / "Інженер з ручного та автоматизованого тестування"), a photo (alt "my profile photo" / "фото профілю"), and two buttons: "Experience" (uk "Досвід") → `/#experience`, "My resume" → `/my-resume`             | UI       | dev, 2026-11-17, — | intended → 1.1      |
| O-7  | Experience: two jobs, newest first — "Manual and automation QA engineer", May 2022 – Present (uk "Травень 2022 – Зараз"); "Manual QA engineer / junior automation QA engineer", May 2021 – May 2022 — each with achievements and responsibilities lists                                                                     | UI       | dev, 2026-11-17, — | intended → 1.2      |
| O-8  | About Me: three paragraphs about the owner; six skills numbered 1–6 — QA docs & reports, Front-end testing, Back-end testing, Automation testing, DevOps and VCS, Soft and Tools (uk: QA-документація та звіти, Тестування фронтенду, Тестування бекенду, Автоматизація тестування, DevOps та VCS, Програми та інструменти) | UI       | dev, 2026-11-17, — | intended → 1.3      |
| O-9  | Wide screens: the first skill is selected on load; clicking a card shows "My skills in" + its title (uk "Мої навички в"), its list (7, 7, 4, 7, 5, 7 items) and its number on the flip card                                                                                                                                 | UI       | dev, 2026-11-17, — | intended → 1.3      |
| O-10 | Narrow screens: "next" goes 1 → 2 → … → 6 → 1, "previous" goes back (and from 1 to 6), with the same panel as on wide screens                                                                                                                                                                                               | UI, code | dev, 2026-11-17, — | intended → 1.4      |
| O-11 | Contact Me: "Contact me" heading (uk "Звʼяжіться зі мною"); links GitHub → `https://github.com/kosbielozorov`, LinkedIn → `https://www.linkedin.com/in/k-bielozorov/`, Gmail → `mailto:k.bielozorov@gmail.com`, Telegram (O-4); they open in the same tab                                                                   | UI       | dev, 2026-11-17, — | intended → 1.6      |

## Scenarios

### 1. Home page

#### 1.1 The Home section introduces the owner

**Steps:**

1. Open `/` in English, then in Ukrainian; click "Experience".

**Expected:**

- The Home section shows the position as a heading — "Manual and automation QA engineer" (uk "Інженер з ручного та автоматизованого тестування") — and a photo with a text alternative (O-6; confirmed by the site owner, 2026-11-17).
- "Experience" (uk "Досвід") leads to `/#experience` and brings the Experience section to the top (O-6; confirmed by the site owner, 2026-11-17).

#### 1.2 The Experience section lists the jobs

**Steps:**

1. Open `/` in English, then in Ukrainian; read the Experience section.

**Expected:**

- The Experience section lists the jobs, each with a title and a period, and non-empty achievements and responsibilities lists; job texts are content and are not pinned (O-7; confirmed by the site owner, 2026-11-17).
- It shows exactly the two most recent jobs — `experience.jobs[0]` and `[1]` of `../src/info/en.js` in English, of `../src/info/uk.js` in Ukrainian — with their titles and periods (O-7; confirmed by the site owner (Q-1), 2026-11-17).

#### 1.3 Choosing a skill (wide screens)

**Steps:**

1. At 1440 px open `/`; click each skill card.

**Expected:**

- Six skills are shown in this order: QA docs & reports, Front-end testing, Back-end testing, Automation testing, DevOps and VCS, Soft and Tools (uk QA-документація та звіти, Тестування фронтенду, Тестування бекенду, Автоматизація тестування, DevOps та VCS, Програми та інструменти) (O-8; confirmed by the site owner, 2026-11-17).
- The first skill is shown on load; choosing a skill shows "My skills in" (uk "Мої навички в") with its title, a non-empty list and its number 1–6 (O-9; confirmed by the site owner, 2026-11-17).

#### 1.4 Going through the skills (narrow screens)

**Steps:**

1. At 375 px open `/`; press "next" seven times, then "previous".

**Expected:**

- "Next" goes 1 → 2 → … → 6 → 1 and "previous" goes back, from 1 to 6, showing the same panel as on wide screens (O-10; confirmed by the site owner, 2026-11-17).

#### 1.5 The skills from the keyboard

**Steps:**

1. At 1440 px and at 375 px open `/`; Tab to the skills; choose one with Enter, then with Space.

**Expected:**

- At 1440 px each skill card is a button reached by Tab; Enter shows its skills, and the chosen card is marked for assistive technology (`aria-pressed` or `aria-current`) (O-1; confirmed by the site owner, 2026-11-17).
- At 375 px "previous" and "next" are buttons with accessible names, reached by Tab; Enter moves through the skills (O-2; confirmed by the site owner, 2026-11-17).
- Space works like Enter on the cards and the arrows (O-1, O-2; confirmed by the site owner (Q-3), 2026-11-17).

#### 1.6 The Contact Me links

**Steps:**

1. Open `/` in English, then in Ukrainian; read the Contact Me links.

**Expected:**

- Contact Me links GitHub → `https://github.com/kosbielozorov`, LinkedIn → `https://www.linkedin.com/in/k-bielozorov/`, Gmail → `mailto:k.bielozorov@gmail.com`, Telegram → `tg://resolve?domain=kostya_bels` (intended here, unlike the resume page), in both languages, and none opens a new tab (O-11, O-4; confirmed by the site owner, 2026-11-17).

#### 1.7 The page's structure for assistive technology

**Steps:**

1. Open `/` in English, then in Ukrainian; read the landmarks, the headings and the images' text alternatives.

**Expected:**

- The sections are inside a `main` landmark; the page has exactly one `h1` (the Home heading), the section headings sit below it, and the large background "About Me" text is hidden from assistive technology (O-5; confirmed by the site owner, 2026-11-17).
- In Ukrainian too — the background "Про мене" is hidden the same way (O-5; confirmed by the site owner (Q-4), 2026-11-17).
- The skill icons are decorative: `alt=""` (O-3; confirmed by the site owner, 2026-11-17).

## Known defects

- F-1 / `@bug-HOME-1` (2026-11-17): scenario 1.5 — the skill cards are `<a>` without `href`: not focusable, not buttons → `specs/known-defects/HOME-1-skill-cards-not-keyboard.md`
- F-2 / `@bug-HOME-2` (2026-11-17): scenario 1.5 — the narrow-screen "previous" / "next" arrows are unnamed `<a>` without `href` → `specs/known-defects/HOME-2-skill-arrows-not-keyboard.md`
- F-3 / `@bug-HOME-3` (2026-11-17): scenario 1.7 — every skill icon has `alt="internet issues"` → `specs/known-defects/HOME-3-skill-icons-wrong-alt.md`
- F-4 / `@bug-HOME-4` (2026-11-17): scenario 1.7 — no `main` landmark, five `h1`, the background "About Me" read out → `specs/known-defects/HOME-4-no-main-five-h1.md`
