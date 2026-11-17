import { test } from '@fixtures';

/**
 * Not-found page — what it says and which paths lead to it (and which do not), also inside the app.
 * Requirement: the confirmed observations of `specs/not-found-page.md` (characterization flow,
 * zone Z-6). No Testomatio ids yet: `@unlinked`.
 */

const LANGUAGES = [
  {
    language: 'English',
    locale: 'en-US',
    content: {
      heading: 'Page not found',
      text: 'This page does not exist or the link is outdated.',
      link: 'Back to home',
    },
  },
  {
    language: 'Ukrainian',
    locale: 'uk-UA',
    content: {
      heading: 'Сторінку не знайдено',
      text: 'Такої сторінки немає або посилання застаріло.',
      link: 'На головну',
    },
  },
] as const;
const [ENGLISH] = LANGUAGES;

const NOT_FOUND = 'Page not found';
const HOME_HEADING = "I'm Kostiantyn";
const RESUME_NAME = 'Kostiantyn Bielozorov';

/** Unknown paths at any depth — they lead to the not-found page. */
const UNKNOWN_PATHS = [
  '/a/b/c',
  '/my-resume/extra',
  '/download/nope.pdf',
] as const;
/** Known routes written differently — they do not. */
const RESUME_VARIANTS = [
  '/My-Resume',
  '/my-resume/',
  '/my-resume?x=1',
] as const;
const HOME_VARIANTS = ['/?x=1', '/#nope'] as const;

for (const { language, locale, content } of LANGUAGES)
  test.describe(`Not-found page in ${language}`, () => {
    test.use({ locale });

    test(
      `the page says what happened and leads home in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/not-found-page.md#1.1' },
        ],
      },
      async ({ openedNotFoundPage: notFoundPage }) => {
        await notFoundPage.expectContent(content);
      },
    );
  });

test.describe('Which paths lead to the not-found page', () => {
  test.use({ locale: 'en-US' });

  for (const path of UNKNOWN_PATHS)
    test(
      `${path} shows the not-found page`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/not-found-page.md#1.2' },
        ],
      },
      async ({ pageManager: { notFoundPage } }) => {
        await notFoundPage.open(path);

        await notFoundPage.expectContent(ENGLISH.content);
      },
    );

  test(
    '/index.html shows the home page',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/not-found-page.md#1.2' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open('/index.html');

      await homePage.expectHeading(HOME_HEADING);
    },
  );

  for (const path of RESUME_VARIANTS)
    test(
      `${path} shows the resume`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/not-found-page.md#1.3' },
        ],
      },
      async ({ pageManager: { resumePage } }) => {
        await resumePage.open(path);

        await resumePage.expectName(RESUME_NAME);
      },
    );

  for (const path of HOME_VARIANTS)
    test(
      `${path} shows the home page`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/not-found-page.md#1.3' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open(path);

        await homePage.expectHeading(HOME_HEADING);
      },
    );

  test(
    'navigating to an unknown path inside the app shows the not-found page at its top',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/not-found-page.md#1.4' },
      ],
    },
    async ({ openedHomePage: homePage, pageManager: { notFoundPage } }) => {
      await homePage.scrollDown();
      await homePage.markDocument();

      await homePage.navigateInApp('/zzz');

      await notFoundPage.expectHeading(NOT_FOUND);
      await notFoundPage.expectSameDocument();
      await notFoundPage.expectAtTop();
    },
  );
});
