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
parts (navigation, language, head metadata). Risk is impact × exposure, then dependents
(`characterize-feature` → **Ranking**); re-ranked 2026-11-13: the first ranking weighed impact
alone, so the home page every visitor sees first was "content only" and was left for later.

Order: Z-0 Smoke (covered) → Z-4 Navigation (covered) → Z-3 Home page (covered) → Z-2 Language switching (covered) → Z-5 Head metadata (covered) →
Z-7 Footer and call to action (covered) → Z-6 Not-found page (covered) (Z-1 Resume page — covered).

### Z-0 Smoke

- Entry points: `/` (the entry page, en and uk); every route — `/`, `/my-resume`, an unknown path
  (404 page); each item of the header menu and of the drawer → its target
- Risk: high — impact: nothing else is reachable when it breaks; exposure: every visitor;
  dependents: all zones
- Status: covered
- Spec: `specs/smoke.md`
- Scaffolding: —
- Tests: `tests/ui/smoke.test.ts` (`@smoke`; Tab-order tests `@keyboard` run in Chromium only; Firefox not run — B-1, environment)
- Notes: `/my-resume` opening and its "Back to home" are already held by
  `tests/ui/resume-page.test.ts` (Z-1); no `@smoke` tests yet

### Z-1 Resume page

- Entry points: `/my-resume`; PDF download `/download/qa-engineer-k.bielozorov-{en,ua}.pdf`;
  contact links (mail, phone, LinkedIn, GitHub, Telegram); "Back to home"
- Risk: high — impact: the main artifact for a recruiter: the PDF must download in the visitor's
  language, the contacts must be right; exposure: most (reached from the home page); dependents: —
- Status: covered
- Spec: `specs/resume-page.md`
- Scaffolding: —
- Tests: `tests/ui/resume-page.test.ts` (Firefox not run yet — B-1, environment)

### Z-2 Language switching

- Entry points: the `EN | UA` group in the header and in the drawer; `localStorage.i18nextLng`;
  browser language detection; `<html lang>`; every text of every page
- Risk: high — impact: the whole site exists twice; a wrong or mixed language is visible on every
  page; exposure: every visitor; dependents: — (cross-cutting: every page's text)
- Status: covered
- Spec: `specs/language-switching.md`
- Scaffolding: —
- Tests: `tests/ui/language-switching.test.ts` (with `tests/ui/resume-page.test.ts` 1.4; run in Chromium so far — the other browsers once all tests are written)

### Z-3 Home page

- Entry points: `/` — sections `#home`, `#experience`, `#about-me` (skills tabs), `#contact-me`;
  links to `/my-resume`
- Risk: high — impact: the first impression — who the owner is, experience, skills, contacts;
  exposure: every visitor (the entry page); dependents: Z-1 (the resume is reached from here)
- Status: covered
- Spec: `specs/home-page.md`
- Scaffolding: —
- Tests: `tests/ui/home-page.test.ts` (with `tests/ui/smoke.test.ts` 1.1, 1.2, 1.5; Tab-order tests `@keyboard` run in Chromium only; Firefox not run — B-1, environment)
- Notes: Telegram links here use `tg://resolve?domain=…`; the resume's `https://t.me/…` was confirmed as
  correct (`specs/resume-page.md` O-6); on the home page and in the drawer `tg://` is intended (`specs/home-page.md` O-4, 2026-11-17); the page has no `main` landmark and five `h1` (`specs/smoke.md` O-6) — triaged as a bug (`specs/home-page.md` F-4)

### Z-4 Navigation

- Entry points: header menu (`/#home`, `/#experience`, `/#about-me`, `/#contact-me`), the diagonal
  drawer (mobile / narrow screens), cross-page anchors from `/my-resume` and the 404 page, sticky
  header on scroll
- Risk: high — impact: a broken anchor or menu hides a section or a page; exposure: every visitor;
  dependents: Z-3 sections, Z-1 (from the drawer and the 404 page)
- Status: covered
- Spec: `specs/navigation.md`
- Scaffolding: —
- Tests: `tests/ui/navigation.test.ts` (with `tests/ui/smoke.test.ts` 1.3, 1.4, 1.6; Tab-order tests `@keyboard` run in Chromium only; Firefox not run — B-1, environment)

### Z-5 Head metadata (SEO / sharing)

- Entry points: `<title>`, `meta description`, Open Graph / Twitter tags, `canonical`, `robots` on
  every route and language
- Risk: medium — impact: what search engines and link previews show; exposure: every visitor
  arriving from a search or a shared link; dependents: —
- Status: covered
- Spec: `specs/head-metadata.md`
- Scaffolding: — (not applicable: `<head>` is outside the accessibility tree and API shapes)
- Tests: `tests/ui/head-metadata.test.ts` (with `tests/ui/resume-page.test.ts` 1.6 and `tests/ui/language-switching.test.ts` 1.3 for the titles; run in Chromium so far)
- Notes: two `meta description` tags on every page — the static English one from `index.html`
  first; confirmed as a bug on the resume page (`specs/resume-page.md` F-3)

### Z-6 Not-found page

- Entry points: any unknown path → 404 page, "Back to home" → `/`; on GitHub Pages `404.html` is the
  SPA shell (`vite.config.js`), so `/my-resume` on the live site answers HTTP 404 with the app
- Risk: low — impact: a lost visitor gets no way back; exposure: few (an edge path); dependents: —
- Status: covered
- Spec: `specs/not-found-page.md`
- Scaffolding: —
- Tests: `tests/ui/not-found-page.test.ts` (with `tests/ui/smoke.test.ts` 1.1, 1.3, 1.4, 1.7, `tests/ui/head-metadata.test.ts` 1.3, `tests/ui/footer.test.ts`; run in Chromium so far)

### Z-7 Footer and call to action

- Entry points: footer, the call-to-action block on every page
- Risk: medium — impact: presentation, the call to contact; exposure: every visitor (every page);
  dependents: —
- Status: covered
- Spec: `specs/footer.md`
- Scaffolding: —
- Tests: `tests/ui/footer.test.ts` (with `tests/ui/navigation.test.ts` 1.7 for the back-to-top button from the keyboard; run in Chromium so far)
