# Navigation

## Scope

- In scope: zone Z-4 of `specs/app-map.md` beyond what `specs/smoke.md` already holds — the sticky
  header, the marking of the current menu item, the switch between the header menu and the drawer,
  the drawer and the header menu from the keyboard, the browser's Back after a menu link; English,
  the widths named per scenario.
- Out of scope: what `specs/smoke.md` covers — each menu and drawer item reaches its section from
  every route (1.3, 1.4), the drawer closes after a click (1.4), opening the drawer from the
  keyboard, the closed drawer out of the Tab order, the drawer's named links (1.6); the URL on `/`
  after a menu click (open question `specs/smoke.md` Q-1); the drawer's language switcher (Z-2);
  section content (Z-3); the live deployment.
- In scope although in zone Z-7: the back-to-top button (O-5) — navigation, decided at triage
  (2026-11-13).

## Assumptions

- No requirement exists. Expected lines come only from observations confirmed at Gate 1.
- Colours and the "tick" behind a menu item are presentation; what a test may check is which item
  is marked, not how.

## Risks

- Every visitor uses the header; a menu that hides content or traps the keyboard loses them.

## Test data

- None — a static site. The language is set through `localStorage.i18nextLng` (`en` / `uk`).

## Environments

- `DEV_BASE_APP_URL` = http://localhost:5173 (Vite dev server, started by `webServer`).

## Observations

| Id   | Observation                                                                                                                                                                                                                                                                                                                                                   | Source   | Env, date, account | Triage              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | ------------------- |
| O-1  | ⚠ Between ~620 and ~760 px the home page scrolls sideways (66 px at 640, 36 px at 700): the flip card in the About Me section (`absolute … sm:-right-20`, `src/components/AboutMe/index.jsx`) reaches past the screen — hiding it removes the overflow, hiding the header menu does not; `/my-resume` and the 404 page fit. Smoke checks only 375 and 1440 px | UI, code | dev, 2026-11-13, — | suspected bug → F-1 |
| O-2  | ⚠ The open drawer does not keep the focus: after its last link (Telegram) Tab goes to "Open menu" and to the page's links hidden behind the full-screen drawer                                                                                                                                                                                                | UI       | dev, 2026-11-13, — | suspected bug → F-2 |
| O-3  | ⚠ The marked menu item follows clicks and the `#section` of a loaded URL, not scrolling: after "About Me" and scrolling back to the top, "About Me" stays marked                                                                                                                                                                                              | UI, code | dev, 2026-11-13, — | suspected bug → Q-1 |
| O-4  | ⚠ The current item is marked only visually (colour and tick) — no `aria-current`; a screen reader cannot tell which item is current                                                                                                                                                                                                                           | UI       | dev, 2026-11-13, — | suspected bug → F-3 |
| O-5  | ⚠ The back-to-top button (bottom right, after scrolling) is a `div` with a `title` — no button role, not focusable; the same defect as NAV-1 was (zone Z-7)                                                                                                                                                                                                   | UI, code | dev, 2026-11-13, — | suspected bug → F-4 |
| O-6  | The header stays at the top of the screen while the page scrolls, on every route; from 1280 px, once scrolled, it turns white with a blue shadow and is transparent again at the top                                                                                                                                                                          | UI       | dev, 2026-11-13, — | intended → 1.1      |
| O-7  | The header menu is shown from 1280 px; below it (1279, 1024, 768, 640, 375 px) the drawer toggle is shown instead                                                                                                                                                                                                                                             | UI       | dev, 2026-11-13, — | intended → 1.3      |
| O-8  | Opening the drawer from the keyboard moves the focus to "Close menu" (`aria-expanded` true); Escape or "Close menu" closes it and the focus returns to "Open menu" (`aria-expanded` false)                                                                                                                                                                    | UI       | dev, 2026-11-13, — | intended → 1.4      |
| O-9  | Wide screens: Tab reaches Home, Experience, About Me, Contact Me, then EN, UA, with the browser's focus ring; Enter on an item brings its section to the top                                                                                                                                                                                                  | UI       | dev, 2026-11-13, — | intended → 1.5      |
| O-10 | The marked item: Home on loading `/`; the clicked item after a click; the item of the `#section` when `/#experience` or `/#contact-me` is loaded                                                                                                                                                                                                              | UI       | dev, 2026-11-13, — | intended → 1.2      |
| O-11 | After a header-menu link from `/my-resume` to `/#experience`, the browser's Back returns to `/my-resume`                                                                                                                                                                                                                                                      | UI       | dev, 2026-11-13, — | intended → 1.6      |

## Scenarios

### 1. Navigation

#### 1.1 The header stays on screen while scrolling

**Steps:**

1. Open `/`, `/my-resume` and an unknown path at 1440 px; scroll down, then back to the top.
2. Repeat at 375 px.

**Expected:**

- The site header stays at the top of the screen while the page scrolls, on `/`, `/my-resume` and the 404 page, at 1440 and 375 px (O-6; confirmed by the site owner, 2026-11-13). Its colours are presentation and not checked.

#### 1.2 The header menu marks the current item

**Steps:**

1. At 1440 px open `/`; click "About Me"; scroll back to the top.
2. Load `/#experience`, then `/#contact-me`.

**Expected:**

- The marked item is Home on loading `/`, the clicked item after a click, and the item of the `#section` when `/#experience` or `/#contact-me` is loaded (O-10; confirmed by the site owner, 2026-11-13). What happens on scrolling is open — Q-1.
- The marked item carries `aria-current`; the other items do not (O-4; confirmed by the site owner, 2026-11-13).
- `aria-current="false"` on the other items counts as not carrying it (O-4; confirmed by the site owner (Q-2), 2026-11-13).

#### 1.3 The menu switches between the header and the drawer at 1280 px

**Steps:**

1. Open `/` at 1280, 1279, 1024, 768 and 640 px.

**Expected:**

- The header menu is shown from 1280 px; at 1279, 1024, 768 and 640 px the drawer toggle is shown instead (O-7; confirmed by the site owner, 2026-11-13).
- The home page does not scroll sideways at 640, 700, 768, 1024, 1279 or 1280 px (O-1; confirmed by the site owner, 2026-11-13).

#### 1.4 The drawer from the keyboard

**Steps:**

1. At 375 px open `/`; Tab to "Open menu"; press Enter.
2. Tab through the open drawer; press Escape. Open it again; activate "Close menu".

**Expected:**

- Opening the drawer from the keyboard moves the focus to "Close menu" and sets `aria-expanded` on "Open menu" to true; Escape or "Close menu" closes the drawer, the focus returns to "Open menu" and `aria-expanded` is false (O-8; confirmed by the site owner, 2026-11-13).
- While the drawer is open, Tab and Shift+Tab keep the focus inside it (O-2; confirmed by the site owner, 2026-11-13).
- The focus may pass through the browser's own controls on its way round (as `inert` on the page or a native modal allows), but never lands on a page control outside the drawer (O-2; confirmed by the site owner (Q-3), 2026-11-13).

#### 1.5 The header menu from the keyboard

**Steps:**

1. At 1440 px open `/`; Tab through the header; press Enter on an item.

**Expected:**

- Tab reaches Home, Experience, About Me, Contact Me, then EN, UA, each visibly focused; Enter on an item brings its section to the top (O-9; confirmed by the site owner, 2026-11-13).

#### 1.6 Back after a menu link to another page

**Steps:**

1. At 1440 px open `/my-resume`; click "Experience" in the header; press the browser's Back.

**Expected:**

- The browser's Back returns to `/my-resume` (O-11; confirmed by the site owner, 2026-11-13).

#### 1.7 The back-to-top button

**Steps:**

1. At 1440 px open `/` in English, then in Ukrainian; scroll down; Tab to the back-to-top button; press Enter.

**Expected:**

- After scrolling, a button named "Back to top" (uk "Нагору") is shown, reached by Tab; Enter scrolls the page to the top (O-5; confirmed by the site owner, 2026-11-13).
- Both languages are checked (O-5; confirmed by the site owner (Q-4), 2026-11-13).

## Open questions

- Q-1: Should the marked header-menu item follow scrolling (the section on screen), not only clicks and the loaded `#section` (O-3)? — asked 2026-11-13, owner the site owner

## Known defects

- F-1 / `@bug-NAV-4` (2026-11-13): scenario 1.3 — between ~620 and ~760 px the home page scrolls sideways (66 px at 640) — the About Me flip card → `specs/known-defects/NAV-4-home-scrolls-sideways-at-tablet-widths.md`
- F-2 / `@bug-NAV-5` (2026-11-13): scenario 1.4 — Tab leaves the open drawer for controls hidden behind it → `specs/known-defects/NAV-5-open-drawer-lets-focus-out.md`
- F-3 / `@bug-NAV-6` (2026-11-13): scenario 1.2 — the current menu item is marked only visually, no `aria-current` → `specs/known-defects/NAV-6-current-item-not-announced.md`
- F-4 / `@bug-NAV-7` (2026-11-13): scenario 1.7 — the back-to-top button is a `div`: no role, not focusable → `specs/known-defects/NAV-7-back-to-top-not-a-button.md`
