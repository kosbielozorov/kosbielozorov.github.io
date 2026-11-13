# App map

<!-- Format: skill characterize-feature → App map. Check: npm run characterization:check -->

Map of a legacy app without requirements, built by `characterize-feature` (step 1). It is a list of
**observations**, never an oracle: nothing here is a requirement until a human confirms it in a
feature spec.

- Environment: `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server of the parent repo,
  started by `playwright.config.ts` → `webServer`) — never the live site
- Explored: 2026-11-12
- Sources: UI + network (en and uk, routes `/`, `/my-resume`, an unknown path); app code `../src`
  (read-only: routes `../src/App.jsx`, texts `../src/info/`, `../src/locales/`)
- Access: none — the site has no sign-in
- Third-party hosts (ignored as observations): none seen locally (only `localhost:5173`)

## Approved writes

None needed — a static site: no forms, no API, nothing is stored on a server. The language choice is
stored in the browser only (`localStorage.i18nextLng`).

## Zones

Granularity: a small static site (3 routes, 2 languages) — one zone per page plus the cross-cutting
parts (navigation, language, head metadata). Risk is business value for a portfolio: the resume and
the contacts are what a visitor comes for.

### Z-1 Resume page

- Entry points: `/my-resume`; PDF download `/download/qa-engineer-k.bielozorov-{en,ua}.pdf`;
  contact links (mail, phone, LinkedIn, GitHub, Telegram); "Back to home"
- Risk: high — the main artifact for a recruiter: the PDF must download in the visitor's language,
  the contacts must be right
- Status: covered
- Spec: `specs/resume-page.md`
- Scaffolding: —
- Tests: `tests/ui/resume-page.test.ts` (Firefox not run yet — B-1, environment)

### Z-2 Language switching

- Entry points: the `EN | UA` group in the header and in the drawer; `localStorage.i18nextLng`;
  browser language detection; `<html lang>`; every text of every page
- Risk: high — the whole site exists twice; a wrong or mixed language is visible on every page
- Status: unexplored
- Spec: —
- Scaffolding: —

### Z-3 Home page

- Entry points: `/` — sections `#home`, `#experience`, `#about-me` (skills tabs), `#contact-me`;
  links to `/my-resume`
- Risk: medium — the landing page; content only
- Status: unexplored
- Spec: —
- Scaffolding: —
- Notes: Telegram links here use `tg://resolve?domain=…`; the resume's `https://t.me/…` was confirmed as
  correct (`specs/resume-page.md` O-6) — ask at this zone's triage whether `tg://` is a bug

### Z-4 Navigation

- Entry points: header menu (`/#home`, `/#experience`, `/#about-me`, `/#contact-me`), the diagonal
  drawer (mobile / narrow screens), cross-page anchors from `/my-resume` and the 404 page, sticky
  header on scroll
- Risk: medium — a broken anchor hides a section
- Status: unexplored
- Spec: —
- Scaffolding: —

### Z-5 Head metadata (SEO / sharing)

- Entry points: `<title>`, `meta description`, Open Graph / Twitter tags, `canonical`, `robots` on
  every route and language
- Risk: medium — what search engines and link previews show
- Status: unexplored
- Spec: —
- Scaffolding: —
- Notes: two `meta description` tags on every page — the static English one from `index.html`
  first; confirmed as a bug on the resume page (`specs/resume-page.md` F-3)

### Z-6 Not-found page

- Entry points: any unknown path → 404 page, "Back to home" → `/`; on GitHub Pages `404.html` is the
  SPA shell (`vite.config.js`), so `/my-resume` on the live site answers HTTP 404 with the app
- Risk: low — an edge path
- Status: unexplored
- Spec: —
- Scaffolding: —

### Z-7 Footer and call to action

- Entry points: footer, the call-to-action block on every page
- Risk: low — presentation
- Status: unexplored
- Spec: —
- Scaffolding: —
