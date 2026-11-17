# Footer and call to action

## Scope

- In scope: zone Z-7 of `specs/app-map.md` — the footer and the back-to-top button on `/`,
  `/my-resume` and the 404 page, in English and Ukrainian.
- Out of scope: the back-to-top button from the keyboard and its name (`specs/navigation.md` 1.7,
  taken there at its triage); the footer's presence on `/` (`specs/smoke.md` 1.2); the live
  deployment.

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- The name comes from `../src/info/{en,uk}.js`; the year from the visitor's clock.

## Risks

- Low — presentation; the back-to-top button is on every page once it scrolls.

## Test data

- None. The language is the browser locale; reduced motion is the context's `reducedMotion`.

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id  | Observation                                                                                                                                                                                                                                                                                                                              | Source   | Env, date, account | Triage         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | -------------- |
| O-1 | ⚠ The back-to-top button bounces without end (`animate-bounce`, 1 s, infinite) — also when the visitor asks for reduced motion (`prefers-reduced-motion: reduce`); there is no way to stop it (WCAG 2.2.2 Pause, Stop, Hide; 2.3.3 Animation from Interactions). Playwright cannot even click it without `force` — it never stands still | UI, code | dev, 2026-11-17, — | intended → 1.3 |
| O-2 | Every route has the footer — a `contentinfo` landmark outside `main` — with the owner's full name in the page's language ("Kostiantyn Bielozorov" / "Костянтин Бєлозьоров") and the current year (2026, from the visitor's clock); white text on dark grey                                                                               | UI, code | dev, 2026-11-17, — | intended → 1.1 |
| O-3 | On every route the back-to-top button is absent at the top; it appears once the page scrolls; activating it scrolls the page to the top, where it disappears again                                                                                                                                                                       | UI       | dev, 2026-11-17, — | intended → 1.2 |

## Scenarios

### 1. Footer and call to action

#### 1.1 The footer on every route

**Steps:**

1. Open `/`, `/my-resume` and the 404 page in English, then in Ukrainian; read the footer.

**Expected:**

- Every route has one footer — a `contentinfo` landmark outside `main` — showing the owner's full name in the page's language (from `../src/info/{en,uk}.js`) and the current year; nothing else (O-2; confirmed by the site owner, 2026-11-17).

#### 1.2 The back-to-top button on every route

**Steps:**

1. On each route: read whether the button is there; scroll down; activate it.

**Expected:**

- On every route the back-to-top button is absent at the top, appears once the page scrolls, and activating it scrolls the page to the top, where it disappears again (O-3; confirmed by the site owner, 2026-11-17).

#### 1.3 The back-to-top button and reduced motion

**Steps:**

1. With reduced motion requested, open `/` and scroll down; read the button's animation.

**Expected:**

- The button keeps bouncing (`bounce` animation) — also when reduced motion is requested; this is intended (O-1; confirmed by the site owner, 2026-11-17).
