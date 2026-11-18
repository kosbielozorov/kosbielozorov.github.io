# Not-found page

## Scope

- In scope: zone Z-6 of `specs/app-map.md` — the not-found page's content in English and Ukrainian,
  and which paths lead to it (and which do not).
- Out of scope: what other specs hold — it opens with its heading and no errors (`specs/smoke.md`
  1.1), "Back to home" → `/` (smoke 1.7), the menu and drawer from it (smoke 1.3, 1.4), its head
  (`specs/head-metadata.md` 1.3), its footer (`specs/footer.md`); the HTTP status, which the dev
  server always answers 200 (on GitHub Pages it is 404 — the live deployment is out of scope).

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- Routing is `react-router-dom` (`../src/App.jsx`): `/`, `/my-resume`, anything else → not found.

## Risks

- Low — an edge path; but every mistyped or outdated link lands here.

## Test data

- None. The language is the browser locale.

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id  | Observation                                                                                                                                                                                                                                                                             | Source   | Env, date, account | Triage              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | ------------------- |
| O-1 | ⚠ `/index.html` shows the not-found page — a link or bookmark to `/index.html` (common for static sites) lands on "Page not found"                                                                                                                                                      | UI, code | dev, 2026-11-17, — | suspected bug → F-1 |
| O-2 | The page shows, inside `main#not-found`: a large "404", the heading "Page not found" (uk "Сторінку не знайдено"), the text "This page does not exist or the link is outdated." (uk "Такої сторінки немає або посилання застаріло.") and the link "Back to home" (uk "На головну") → `/` | UI       | dev, 2026-11-17, — | intended → 1.1      |
| O-3 | Unknown paths at any depth show it: `/no-such-page`, `/a/b/c`, `/my-resume/extra`, `/download/nope.pdf` (a missing file under `download/`)                                                                                                                                              | UI       | dev, 2026-11-17, — | intended → 1.2      |
| O-4 | Known routes tolerate case and a trailing slash, and ignore a query or a hash: `/My-Resume`, `/my-resume/`, `/my-resume?x=1` show the resume; `/?x=1`, `/#nope` show the home page                                                                                                      | UI, code | dev, 2026-11-17, — | intended → 1.3      |
| O-5 | A client-side navigation to an unknown path (from the home page, scrolled down) shows the not-found page at its top                                                                                                                                                                     | UI       | dev, 2026-11-17, — | intended → 1.4      |

## Scenarios

### 1. Not-found page

#### 1.1 What the page says

**Steps:**

1. Open an unknown path in English, then in Ukrainian; read the page.

**Expected:**

- Inside `main`: "404", the heading "Page not found" (uk "Сторінку не знайдено"), the text "This page does not exist or the link is outdated." (uk "Такої сторінки немає або посилання застаріло.") and the link "Back to home" (uk "На головну") to `/` (O-2; confirmed by the site owner, 2026-11-17).

#### 1.2 Which paths lead to it

**Steps:**

1. Open `/a/b/c`, `/my-resume/extra`, `/download/nope.pdf`, `/index.html`.

**Expected:**

- `/a/b/c`, `/my-resume/extra` and `/download/nope.pdf` show the not-found page (O-3; confirmed by the site owner, 2026-11-17).
- `/index.html` shows the home page (it may redirect to `/`), not the not-found page (O-1; confirmed by the site owner, 2026-11-17).

#### 1.3 Which paths do not

**Steps:**

1. Open `/My-Resume`, `/my-resume/`, `/my-resume?x=1`, `/?x=1`, `/#nope`.

**Expected:**

- `/My-Resume`, `/my-resume/` and `/my-resume?x=1` show the resume; `/?x=1` and `/#nope` show the home page (O-4; confirmed by the site owner, 2026-11-17).

#### 1.4 Reaching it inside the app

**Steps:**

1. On the home page, scroll down; navigate to an unknown path without a reload.

**Expected:**

- Navigating to an unknown path inside the app (no reload) shows the not-found page at its top (O-5; confirmed by the site owner, 2026-11-17).
