# RESUME-2 — On a phone, the Ukrainian surname overflows the screen

- **Severity:** medium — the resume page scrolls sideways on a phone in
  Ukrainian.
- **Found:** 2026-11-12, characterization of zone Z-1
  (`e2e/specs/resume-page.md`, O-2 → F-2).
- **Pinned test:** `e2e/tests/ui/resume-page.test.ts` → _Resume page on a phone
  › in Ukrainian › fits the screen in Ukrainian_ (`test.fail`, `@bug-RESUME-2`),
  scenario 1.7.

## Expected (confirmed by the site owner)

> At 375 px wide the page fits the screen in both languages — no horizontal
> scroll (1.7).

## Actual

At 375 × 812, Ukrainian: the name heading `h1.header__name` ends at x = 392 px,
so the document is 392 px wide (17 px of sideways scroll). The overflowing part
is the surname span `БЄЛОЗЬОРОВ` (uppercase, one unbreakable word). English
(`BIELOZOROV`) fits.

## Reproduce

```bash
cd e2e && npx playwright test tests/ui/resume-page.test.ts --project=chromium -g "fits the screen"
```

The pinned test fails inside with `Received: 17` (page wider than the viewport).
Manually: DevTools → 375 px, `localStorage.i18nextLng = 'uk'`, open
`/my-resume`, scroll sideways.

## Where

`src/components/Resume/resume.css`:

```css
.header__name {
  /* ~line 136 */
  margin-left: 1rem;
  font-size: 1.5em;
  text-transform: uppercase;
  @media (min-width: 360px) {
    font-size: 2em;
  } /* 375 px lands here */
  @media (min-width: 1110px) {
    font-size: 2.2em;
  }
}
```

The heading sits next to the photo (`.header__wrapper`), so at 360–~420 px the
remaining width is smaller than the Ukrainian surname at `2em` uppercase.

## Suggested fix

Pick the smallest change that keeps the desktop look:

- scale the name with the viewport below ~480 px, e.g.
  `font-size: clamp(1.5em, 7vw, 2em)` for the range that is now `2em`; or
- let the flex child shrink and wrap: `min-width: 0; overflow-wrap: anywhere;`
  on `.header__name` (a hyphen-less break in a surname looks worse — prefer
  scaling); or
- stack photo and name vertically below ~420 px.

Check 320, 360, 375, 414 px and 1280 px in **both** languages; the print styles
(`@media print`) must stay unchanged.

## Done when

- The pinned test is reported _"expected to fail, but passed"_ → un-pinned (see
  `tasks/README.md`); _fits the screen in English_ stays green.
- No sideways scroll at 320 px either (check by hand or extend 1.7 only with the
  owner's OK).
- Desktop (1280 px) resume header looks the same as before (screenshot before /
  after in the PR).
