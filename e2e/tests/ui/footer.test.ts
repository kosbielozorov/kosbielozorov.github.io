import { PROFILE } from '@constants/portfolio';
import { test } from '@fixtures';

/**
 * Footer and call to action — the footer on every route and the back-to-top button's life cycle,
 * including under reduced motion. Requirement: the confirmed observations of `specs/footer.md`
 * (characterization flow, zone Z-7). The name comes from the site's data, the year from the clock.
 * No Testomatio ids yet: `@unlinked`.
 */

const WIDE = { width: 1440, height: 900 };
/** The browser's clock is fixed to a known year: the footer must show the visitor's current year. */
const NOW = new Date('2031-06-15T12:00:00Z');
const YEAR = '2031';
/** A short scroll — the button must appear as soon as the page moves. */
const A_LITTLE = 60;
const BACK_TO_TOP = 'Back to top';

const LANGUAGES = [
  { language: 'English', code: 'en', locale: 'en-US' },
  { language: 'Ukrainian', code: 'uk', locale: 'uk-UA' },
] as const;

for (const { language, code, locale } of LANGUAGES) {
  const { fullName } = PROFILE[code];

  test.describe(`Footer in ${language}`, () => {
    test.use({ locale, viewport: WIDE });

    test(
      `the home page footer shows the name and the current year in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/footer.md#1.1' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.fixClockAt(NOW);
        await homePage.open();

        await homePage.footer.expectContent(fullName, YEAR);
      },
    );

    test(
      `the resume page footer shows the name and the current year in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/footer.md#1.1' }],
      },
      async ({ pageManager: { resumePage } }) => {
        await resumePage.fixClockAt(NOW);
        await resumePage.open();

        await resumePage.footer.expectContent(fullName, YEAR);
      },
    );

    test(
      `the not-found page footer shows the name and the current year in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/footer.md#1.1' }],
      },
      async ({ pageManager: { notFoundPage } }) => {
        await notFoundPage.fixClockAt(NOW);
        await notFoundPage.open();

        await notFoundPage.footer.expectContent(fullName, YEAR);
      },
    );
  });
}

test.describe('Back-to-top button', () => {
  test.use({ locale: 'en-US', viewport: WIDE });

  test(
    'on the home page it appears on scrolling and takes the page back to the top',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/footer.md#1.2' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.backToTop.expectAbsent(BACK_TO_TOP);
      await homePage.scrollDown(A_LITTLE);
      await homePage.backToTop.expectShown(BACK_TO_TOP);

      await homePage.backToTop.activate(BACK_TO_TOP);

      await homePage.expectAtTop();
      await homePage.backToTop.expectAbsent(BACK_TO_TOP);
    },
  );

  test(
    'on the resume page it appears on scrolling and takes the page back to the top',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/footer.md#1.2' }],
    },
    async ({ pageManager: { resumePage } }) => {
      await resumePage.open();
      await resumePage.backToTop.expectAbsent(BACK_TO_TOP);
      await resumePage.scrollDown(A_LITTLE);
      await resumePage.backToTop.expectShown(BACK_TO_TOP);

      await resumePage.backToTop.activate(BACK_TO_TOP);

      await resumePage.expectAtTop();
      await resumePage.backToTop.expectAbsent(BACK_TO_TOP);
    },
  );

  test(
    'on the not-found page it appears on scrolling and takes the page back to the top',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/footer.md#1.2' }],
    },
    async ({ pageManager: { notFoundPage } }) => {
      await notFoundPage.open();
      await notFoundPage.backToTop.expectAbsent(BACK_TO_TOP);
      await notFoundPage.scrollDown(A_LITTLE);
      await notFoundPage.backToTop.expectShown(BACK_TO_TOP);

      await notFoundPage.backToTop.activate(BACK_TO_TOP);

      await notFoundPage.expectAtTop();
      await notFoundPage.backToTop.expectAbsent(BACK_TO_TOP);
    },
  );

  test.describe('with reduced motion requested', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test(
      'it keeps bouncing, as intended',
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/footer.md#1.3' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();
        await homePage.expectReducedMotion();
        await homePage.scrollDown();

        await homePage.backToTop.expectBouncing(BACK_TO_TOP);
      },
    );
  });
});
