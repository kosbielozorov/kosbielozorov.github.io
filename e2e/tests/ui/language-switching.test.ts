import { test } from '@fixtures';

/**
 * Language switching — which language a first visit gets, the stored choice, the header and drawer
 * switchers on every route, `<html lang>`, the switcher for assistive technology. Requirement: the
 * confirmed observations of `specs/language-switching.md` (characterization flow, zone Z-2). No
 * Testomatio ids yet: `@unlinked`.
 */

const WIDE = { width: 1440, height: 900 };
const NARROW = { width: 375, height: 812 };

const HOME_HEADING = { en: "I'm Kostiantyn", uk: 'Я — Костянтин' } as const;

/** The Ukrainian page titles and menu — texts outside the page headings, to catch a half switch. */
const UK = {
  homeTitle:
    'Костянтин Бєлозьоров | Інженер з ручного та автоматизованого тестування',
  resumeTitle:
    'Костянтин Бєлозьоров – Інженер з ручного та автоматизованого тестування | Моє резюме',
  notFoundTitle: '404 | Сторінку не знайдено',
  menu: ['Головна', 'Досвід', 'Про мене', 'Контакти'],
} as const;

/** First visit, nothing stored: the browser's language → the site's language. */
const FIRST_VISITS = [
  { browser: 'uk-UA', language: 'uk', stored: 'uk-UA' },
  { browser: 'uk', language: 'uk', stored: 'uk' },
  { browser: 'en-US', language: 'en', stored: 'en-US' },
  { browser: 'de-DE', language: 'en', stored: 'en' },
] as const;

/** A stored choice against the browser's language. */
const STORED = [
  { stored: 'uk', browser: 'en-US', language: 'uk' },
  { stored: 'en', browser: 'uk-UA', language: 'en' },
  { stored: 'de', browser: 'uk-UA', language: 'uk' },
] as const;

for (const { browser, language, stored } of FIRST_VISITS)
  test.describe(`First visit with the browser in ${browser}`, () => {
    test.use({ locale: browser, viewport: WIDE });

    test(
      `a ${browser} browser gets the ${language} site and the language is stored`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.1' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.expectHeading(HOME_HEADING[language]);
        await homePage.expectLanguage(language);
        await homePage.expectStoredLanguage(stored);
      },
    );
  });

for (const { stored, browser, language } of STORED)
  test.describe(`"${stored}" stored with the browser in ${browser}`, () => {
    test.use({ locale: browser, viewport: WIDE });

    test(
      `a stored "${stored}" with a ${browser} browser gives the ${language} site`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.2' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.storeLanguageBeforeLoad(stored);

        await homePage.open();

        await homePage.expectHeading(HOME_HEADING[language]);
        await homePage.expectLanguage(language);
      },
    );
  });

test.describe('Switching in the header', () => {
  test.use({ locale: 'en-US', viewport: WIDE });

  test(
    'UA on the home page switches the page without a reload and stores the choice',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.3' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.markDocument();

      await homePage.menu.languages.choose('UA');

      await homePage.expectHeading(HOME_HEADING.uk);
      await homePage.expectTitle(UK.homeTitle);
      await homePage.menu.expectItems(UK.menu);
      await homePage.expectLanguage('uk');
      await homePage.expectStoredLanguage('uk');
      await homePage.expectSameDocument();
    },
  );

  test(
    'UA on the resume page switches the page without a reload and stores the choice',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.3' },
      ],
    },
    async ({ pageManager: { resumePage } }) => {
      await resumePage.open();
      await resumePage.markDocument();

      await resumePage.menu.languages.choose('UA');

      await resumePage.expectName('Костянтин Бєлозьоров');
      await resumePage.expectTitle(UK.resumeTitle);
      await resumePage.menu.expectItems(UK.menu);
      await resumePage.expectLanguage('uk');
      await resumePage.expectStoredLanguage('uk');
      await resumePage.expectSameDocument();
    },
  );

  test(
    'UA on the not-found page switches the page without a reload and stores the choice',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.3' },
      ],
    },
    async ({ pageManager: { notFoundPage } }) => {
      await notFoundPage.open();
      await notFoundPage.markDocument();

      await notFoundPage.menu.languages.choose('UA');

      await notFoundPage.expectHeading('Сторінку не знайдено');
      await notFoundPage.expectTitle(UK.notFoundTitle);
      await notFoundPage.menu.expectItems(UK.menu);
      await notFoundPage.expectLanguage('uk');
      await notFoundPage.expectStoredLanguage('uk');
      await notFoundPage.expectSameDocument();
    },
  );

  test(
    'the chosen language holds after a reload',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.3' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.menu.languages.choose('UA');

      await homePage.reload();

      await homePage.expectHeading(HOME_HEADING.uk);
      await homePage.expectLanguage('uk');
    },
  );

  test(
    'the chosen language holds on the other routes',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.3' },
      ],
    },
    async ({ pageManager: { homePage, resumePage, notFoundPage } }) => {
      await homePage.open();
      await homePage.menu.languages.choose('UA');

      await resumePage.open();
      await resumePage.expectName('Костянтин Бєлозьоров');
      await resumePage.expectLanguage('uk');
      await notFoundPage.open();
      await notFoundPage.expectHeading('Сторінку не знайдено');
      await notFoundPage.expectLanguage('uk');
    },
  );
});

test.describe('Switching in the drawer', () => {
  test.use({ locale: 'en-US', viewport: NARROW });

  test(
    'UA in the drawer switches the page, keeps the drawer open and both switchers agree',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/language-switching.md#1.4' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.markDocument();
      await homePage.menu.openDrawer();

      await homePage.menu.drawerLanguages.choose('UA');

      await homePage.expectHeading(HOME_HEADING.uk);
      await homePage.expectTitle(UK.homeTitle);
      await homePage.expectLanguage('uk');
      await homePage.expectStoredLanguage('uk');
      await homePage.expectSameDocument();
      await homePage.menu.expectDrawerItems(UK.menu);
      await homePage.menu.expectDrawerOpen();
      await homePage.menu.expectCloseButtonNamed('Закрити меню');
      await homePage.menu.drawerLanguages.expectActive('UA');
      await homePage.menu.languages.expectActive('UA');
    },
  );
});

test.describe('The switcher for assistive technology', () => {
  test.use({ viewport: WIDE });

  test.describe('in English', () => {
    test.use({ locale: 'en-US' });

    test(
      'the active language is announced as pressed in both switchers, before and after switching',
      {
        tag: ['@unlinked', '@bug-LANG-1'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.5' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        /* Pinned product defect LANG-1 (specs/known-defects/LANG-1-active-language-not-announced.md). */
        test.fail();
        await homePage.open();

        await homePage.menu.languages.expectPressed('EN');
        await homePage.menu.drawerLanguages.expectPressed('EN');

        await homePage.menu.languages.choose('UA');

        await homePage.menu.languages.expectPressed('UA');
        await homePage.menu.drawerLanguages.expectPressed('UA');
      },
    );

    test(
      'the buttons are named after their languages',
      {
        tag: ['@unlinked', '@bug-LANG-3'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.5' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        /* Pinned product defect LANG-3 (specs/known-defects/LANG-3-buttons-do-not-name-the-language.md). */
        test.fail();
        await homePage.open();

        await homePage.menu.languages.expectButtonsNameLanguages();
      },
    );
  });

  test.describe('group label in English', () => {
    test.use({ locale: 'en-US' });

    test(
      'the switcher group is labelled "Language" in English',
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.5' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.menu.languages.expectGroupLabel('Language');
      },
    );
  });

  test.describe('group label in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test(
      'the switcher group is labelled "Мова" in Ukrainian',
      {
        tag: ['@unlinked', '@bug-LANG-2'],
        annotation: [
          { type: 'source', description: 'specs/language-switching.md#1.5' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        /* Pinned product defect LANG-2 (specs/known-defects/LANG-2-switcher-label-not-translated.md). */
        test.fail();
        await homePage.open();

        await homePage.menu.languages.expectGroupLabel('Мова');
      },
    );
  });
});
