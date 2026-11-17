# Head metadata

## Scope

- In scope: zone Z-5 of `specs/app-map.md` — the `<head>` of `/`, `/my-resume` and the 404 page in
  English and Ukrainian: description, Open Graph, Twitter, canonical, robots, structured data, icons
  and the web manifest, and what a link-preview bot that does not run JavaScript gets.
- Out of scope: the titles (`specs/language-switching.md` 1.3); what `specs/resume-page.md` 1.6
  holds for `/my-resume` (title, `canonical`, `og:url`, `og:type`, a single description that starts
  with the name, the presence of a JSON-LD `Person`); how search engines rank the site; the live
  deployment.

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- The tags are set by `react-helmet-async` after the app runs; `index.html` is what a client gets
  before (and without) JavaScript.
- Descriptions and summaries come from `../src/info/{en,uk}.js` — content; tests check where a value
  comes from and that it is in the page's language, not its wording, unless confirmed below.

## Risks

- Every shared link and every search result shows these tags; a link preview with no text or
  picture loses the visitor before they arrive.

## Test data

- None. The language is the browser locale (`en-US` / `uk-UA`).

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).
- No characterization scaffolding for this zone: the allowed scaffolding assertions (ARIA snapshot,
  API response shape) cannot see `<head>`; the observations below go straight to triage.

## Observations

| Id  | Observation                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Source   | Env, date, account | Triage              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | ------------------- |
| O-1 | ⚠ The static `index.html` (what a link-preview bot that does not run JavaScript reads — Telegram, LinkedIn, Facebook, Slack — and the shell of every route, also `404.html` on GitHub Pages) has only `<title>Kostiantyn Bielozorov - QA engineer</title>`: no description, no Open Graph, no Twitter tags                                                                                                                                                          | code     | dev, 2026-11-17, — | suspected bug → F-1 |
| O-2 | ⚠ No page has `og:image` or `twitter:image` — link previews have no picture                                                                                                                                                                                                                                                                                                                                                                                         | UI       | dev, 2026-11-17, — | suspected bug → F-2 |
| O-3 | ⚠ `/` has no `canonical` and no `og:url`; `/my-resume` has both                                                                                                                                                                                                                                                                                                                                                                                                     | UI       | dev, 2026-11-17, — | suspected bug → F-3 |
| O-4 | ⚠ `/my-resume` has no Twitter tags; `/` has `twitter:card` `summary`, `twitter:title`, `twitter:description`                                                                                                                                                                                                                                                                                                                                                        | UI       | dev, 2026-11-17, — | suspected bug → F-4 |
| O-5 | ⚠ `site.webmanifest` has an empty `name` and `short_name` — an installed site or a home-screen shortcut shows no name                                                                                                                                                                                                                                                                                                                                               | code     | dev, 2026-11-17, — | suspected bug → F-5 |
| O-6 | `/`, in the page's language: `description` = the summary; `og:title` = the title; `og:description` = the description; `og:type` `website`; `twitter:card` `summary`, `twitter:title` = the title, `twitter:description` = the description                                                                                                                                                                                                                           | UI       | dev, 2026-11-17, — | intended → 1.1      |
| O-7 | `/my-resume`, in the page's language: `og:title` = the title; `og:description` = the summary; `profile:first_name` / `profile:last_name` (Kostiantyn / Bielozorov, uk Костянтин / Бєлозьоров); JSON-LD `Person` with `name`, `jobTitle`, `email` `mailto:k.bielozorov@gmail.com`, `telephone` `+380987949507`, `url` `https://kosbielozorov.github.io/my-resume`, `image` `…/images/kos.jpg`, `sameAs` (LinkedIn, GitHub, Telegram), `worksFor` the current company | UI, code | dev, 2026-11-17, — | intended → 1.2      |
| O-8 | The 404 page: `description` "This page does not exist or the link is outdated." (uk "Такої сторінки немає або посилання застаріло."), `robots` `noindex`; no Open Graph, Twitter or canonical                                                                                                                                                                                                                                                                       | UI       | dev, 2026-11-17, — | intended → 1.3      |
| O-9 | Every page: `viewport` `width=device-width, initial-scale=1.0`, favicons 16 and 32 px, `apple-touch-icon`, the web manifest                                                                                                                                                                                                                                                                                                                                         | UI       | dev, 2026-11-17, — | intended → 1.5      |

## Scenarios

### 1. Head metadata

#### 1.1 The home page's head

**Steps:**

1. Open `/` in English, then in Ukrainian; read the head.

**Expected:**

- In the page's language: `description` = the summary (`summary.description` of `../src/info/{en,uk}.js`), `og:title` and `twitter:title` = the title, `og:description` and `twitter:description` = the description, `og:type` `website`, `twitter:card` `summary` — each tag exactly once (O-6; confirmed by the site owner, 2026-11-17).
- `canonical` and `og:url` are `https://kosbielozorov.github.io/` (O-3; confirmed by the site owner, 2026-11-17).
- `og:image` and `twitter:image` are an absolute `https://kosbielozorov.github.io/…` URL of an image the site serves (O-2; confirmed by the site owner, 2026-11-17).

#### 1.2 The resume page's head, beyond the resume spec

**Steps:**

1. Open `/my-resume` in English, then in Ukrainian; read the head and the JSON-LD.

**Expected:**

- In the page's language: `og:title` = the title, `og:description` = the summary, `profile:first_name` / `profile:last_name` = the first and last name; the JSON-LD `Person` has `name`, `jobTitle` (the position), `email` `mailto:k.bielozorov@gmail.com`, `telephone` `+380987949507`, `url` `https://kosbielozorov.github.io/my-resume`, `image` `https://kosbielozorov.github.io/images/kos.jpg`, `sameAs` (the LinkedIn, GitHub and Telegram links) and `worksFor` the current company (O-7; confirmed by the site owner, 2026-11-17).
- `twitter:card` `summary`, `twitter:title` = the title and `twitter:description` = the summary are set, as on the home page (O-4; confirmed by the site owner, 2026-11-17).
- `og:image` and `twitter:image` are an absolute `https://kosbielozorov.github.io/…` URL of an image the site serves (O-2; confirmed by the site owner, 2026-11-17).

#### 1.3 The not-found page's head

**Steps:**

1. Open an unknown path in English, then in Ukrainian; read the head.

**Expected:**

- `description` "This page does not exist or the link is outdated." (uk "Такої сторінки немає або посилання застаріло.") and `robots` `noindex`; no `og:*`, `twitter:*` or `canonical` (O-8; confirmed by the site owner, 2026-11-17).

#### 1.4 What a link preview without JavaScript gets

**Steps:**

1. Request `/` and `/my-resume` as plain HTML (no JavaScript) and read the head.

**Expected:**

- Without JavaScript, the HTML of `/` and `/my-resume` already has `og:title`, `og:description` and `og:image` (site-wide English defaults are enough); once the app has run, each of these tags and `description` appear exactly once, with the page's own values (O-1; confirmed by the site owner, 2026-11-17).
- The static `og:image` is, like the pages', an absolute `https://kosbielozorov.github.io/…` URL of an image the site serves (O-1; confirmed by the site owner (Q-1), 2026-11-17).

#### 1.5 Icons and the web manifest

**Steps:**

1. Read the icon links on every route; request `/site.webmanifest`.

**Expected:**

- Every route has `viewport` `width=device-width, initial-scale=1.0`, the 16 and 32 px favicons, `apple-touch-icon` and the manifest link (O-9; confirmed by the site owner, 2026-11-17).
- `/site.webmanifest` has a non-empty `name` and `short_name` (O-5; confirmed by the site owner, 2026-11-17).
- Each icon link and the manifest link lead to a file the site serves — the icons as images, the manifest as JSON (O-9; confirmed by the site owner (Q-2), 2026-11-17).
