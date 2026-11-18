# Smoke

## Scope

- In scope: zone Z-0 of `specs/app-map.md` — the whole site shallowly: every route opens, the entry
  page shows its main parts, the global navigation (header menu on wide screens, the drawer on
  narrow ones) reaches each target, the home page leads to the resume; English and Ukrainian, 1440
  and 375 px.
- Out of scope: the content of each page — its own zone (Z-1 Resume page, Z-3 Home page, Z-6
  Not-found page); language switching (Z-2); head metadata (Z-5); the live GitHub Pages deployment
  (`DEV_BASE_APP_URL` is the local Vite server).
- Out of scope: the home page has no `main` landmark and five `h1` (one per section) — the home
  page's structure belongs to zone Z-3 (O-6, 2026-11-13).

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- Breadth only: a page "opens" when its main heading is shown with no error; texts are not pinned.
- O-1 was withdrawn before triage: "the resume opens scrolled down" was measured during the smooth
  scroll to the top (now O-14).

## Risks

- Every visitor passes the entry page and the navigation; when they break, nothing else is
  reachable.

## Test data

- None — a static site. The language is set through `localStorage.i18nextLng` (`en` / `uk`).

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id   | Observation                                                                                                                                                                                                                                                        | Source      | Env, date, account | Triage              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------ | ------------------- |
| O-2  | ⚠ Narrow screens (375 px): the drawer toggle is a `div` with a click handler — no button role, not focusable, its image alt is `drawer item`; a keyboard or screen-reader user cannot open the menu                                                                | UI, code    | dev, 2026-11-13, — | suspected bug → F-1 |
| O-3  | ⚠ Every width: the first 10 Tab stops are inside the closed, off-screen drawer (EN, UA, 4 menu links, 4 icon links) — focus is invisible; on wide screens the visible header menu is reached at the 11th Tab                                                       | UI          | dev, 2026-11-13, — | suspected bug → F-2 |
| O-4  | ⚠ The drawer's 4 icon links (GitHub, LinkedIn, e-mail, Telegram) have no accessible name — no text, `aria-label`, `title` or `alt`                                                                                                                                 | UI          | dev, 2026-11-13, — | suspected bug → F-3 |
| O-5  | ⚠ On `/` a header-menu click scrolls to the section but the URL stays `/` (no `#experience`); from `/my-resume` and the 404 page the same click opens `/#<section>` — a section reached from the menu on the home page cannot be shared or bookmarked              | UI, code    | dev, 2026-11-13, — | suspected bug → Q-1 |
| O-6  | ⚠ The home page has no `main` landmark (the resume and the 404 page have one) and five `h1` — one per section heading (zone Z-3?)                                                                                                                                  | UI          | dev, 2026-11-13, — | out of scope        |
| O-7  | ⚠ "Back to home" on the 404 page leads to `/`; on the resume page to `/#home` (`specs/resume-page.md#1.5`) — two targets for the same link text                                                                                                                    | UI          | dev, 2026-11-13, — | intended → 1.7      |
| O-8  | Every route answers 200 and renders its `h1`: `/` → `I'm Kostiantyn` (uk `Я — Костянтин`), `/my-resume` → the full name, an unknown path → `Page not found` (uk `Сторінку не знайдено`, title `404 \| …`) — in both languages, at 1440 and 375 px                  | UI, network | dev, 2026-11-13, — | intended → 1.1      |
| O-9  | No route logs a console error or warning, has a failed request or scrolls sideways — in both languages, at 1440 and 375 px                                                                                                                                         | UI, network | dev, 2026-11-13, — | intended → 1.1      |
| O-10 | The home page shows the sections `#home`, `#experience`, `#about-me`, `#contact-me` in this order, a header and a footer                                                                                                                                           | UI          | dev, 2026-11-13, — | intended → 1.2      |
| O-11 | Wide screens (1440 px): the header menu Home, Experience, About Me, Contact Me (uk Головна, Досвід, Про мене, Контакти) is on every route; each item brings its section to the top of the screen — on `/` by scrolling, from other routes by opening `/#<section>` | UI          | dev, 2026-11-13, — | intended → 1.3      |
| O-12 | Narrow screens (375 px): the header menu is hidden; the toggle top-left opens the drawer (EN \| UA, the 4 items, social icons); each item opens `/#<section>` with the section at the top and closes the drawer — on every route                                   | UI          | dev, 2026-11-13, — | intended → 1.4      |
| O-13 | The home page links "My resume" and "View my full resume" (uk "Моє резюме", "Повне резюме") open `/my-resume` without a reload — at 1440 and 375 px                                                                                                                | UI          | dev, 2026-11-13, — | intended → 1.5      |
| O-14 | The resume page opened from the home page ends at its top: it scrolls there smoothly (`scroll-behavior: smooth`, `scrollTo(0, 0)`), `scrollY` 0 after ~1 s                                                                                                         | UI, code    | dev, 2026-11-13, — | intended → 1.5      |

## Scenarios

### 1. Smoke

#### 1.1 Every route opens

**Steps:**

1. Open `/`, `/my-resume` and an unknown path, in English and in Ukrainian, at 1440 and 375 px.

**Expected:**

- `/`, `/my-resume` and an unknown path open with their `h1` shown — the home page, the full name, `Page not found` (uk `Сторінку не знайдено`) — in both languages, at 1440 and 375 px (O-8; confirmed by the site owner, 2026-11-13).
- The `h1` is in the page's language: `I'm Kostiantyn` / `Я — Костянтин` on `/`, `Kostiantyn Bielozorov` / `Костянтин Бєлозьоров` on `/my-resume` (O-8; confirmed by the site owner (Q-5), 2026-11-13).
- No route logs a console error, has a failed request or scrolls sideways (O-9; confirmed by the site owner, 2026-11-13).

#### 1.2 The entry page shows its main parts

**Steps:**

1. Open `/`.

**Expected:**

- The home page shows the sections `#home`, `#experience`, `#about-me`, `#contact-me` in this order, a header and a footer (O-10; confirmed by the site owner, 2026-11-13).

#### 1.3 The header menu reaches each section (wide screens)

**Steps:**

1. At 1440 px open `/`, `/my-resume` and an unknown path.
2. Click each header-menu item.

**Expected:**

- The header menu has four items — Home, Experience, About Me, Contact Me (uk Головна, Досвід, Про мене, Контакти) — on every route; each brings its section to the top of the screen (O-11; confirmed by the site owner, 2026-11-13).
- From `/my-resume` and the 404 page an item opens `/#<section>` (O-11; confirmed by the site owner, 2026-11-13). On `/` the URL is not checked — Q-1.

#### 1.4 The drawer reaches each section (narrow screens)

**Steps:**

1. At 375 px open `/`, `/my-resume` and an unknown path.
2. Open the drawer; click each item.

**Expected:**

- The header menu is hidden; the drawer toggle opens the drawer; each drawer item opens `/#<section>` with the section at the top and closes the drawer — on every route (O-12; confirmed by the site owner, 2026-11-13).

#### 1.5 The home page leads to the resume

**Steps:**

1. Open `/` in English, then in Ukrainian; click "My resume", then (from `/` again) "View my full resume".

**Expected:**

- "My resume" and "View my full resume" (uk "Моє резюме", "Повне резюме") open `/my-resume` without a reload, in both languages, at 1440 and 375 px (O-13; confirmed by the site owner, 2026-11-13).
- The resume page then ends at its top (O-14; confirmed by the site owner, 2026-11-13).

#### 1.6 The navigation works from the keyboard

**Steps:**

1. Open `/` at 1440 and at 375 px.
2. Press Tab until the menu (or the drawer toggle) is reached; open it with Enter, then (from the start) with Space.

**Expected:**

- At 375 px the drawer toggle is a button with an accessible name, reached by Tab and opened with Enter or Space (O-2; confirmed by the site owner, 2026-11-13).
- Both Enter and Space open it (O-2; confirmed by the site owner (Q-2), 2026-11-13).
- Its name says what it does — the image alt `drawer item` is not an acceptable name (O-2; confirmed by the site owner (Q-3), 2026-11-13).
- While the drawer is closed none of its controls takes keyboard focus: the first Tab stop is a visible control (O-3; confirmed by the site owner, 2026-11-13).
- The drawer's icon links have accessible names — GitHub, LinkedIn, Gmail, Telegram, as in the Contact Me section (O-4; confirmed by the site owner, 2026-11-13).
- Each named icon link points where the Contact Me link of the same name points — `https://github.com/kosbielozorov`, `https://www.linkedin.com/in/k-bielozorov/`, `mailto:k.bielozorov@gmail.com`, `tg://resolve?domain=kostya_bels` (O-4; confirmed by the site owner (Q-4), 2026-11-13).

#### 1.7 The 404 page leads home

**Steps:**

1. Open an unknown path; click "Back to home".

**Expected:**

- "Back to home" on the 404 page leads to `/` (the resume page's leads to `/#home`, `specs/resume-page.md#1.5` — both intended) (O-7; confirmed by the site owner, 2026-11-13).

## Open questions

- Q-1: On `/` should a header-menu click put `#<section>` into the URL, as it does from the other pages (O-5)? To research and decide — asked 2026-11-13, owner the site owner
