import { test } from '@fixtures';

/**
 * Smoke — the whole site shallowly: every route opens, the entry page shows its main parts, the
 * global navigation reaches each section, the home page leads to the resume. Requirement: the
 * confirmed observations of `specs/smoke.md` (characterization flow, zone Z-0). The language comes
 * from the browser locale. No Testomatio ids yet: `@unlinked`.
 */

const SECTIONS = ['home', 'experience', 'about-me', 'contact-me'] as const;

const LANGUAGES = [
  {
    language: 'English',
    locale: 'en-US',
    homeHeading: "I'm Kostiantyn",
    resumeName: 'Kostiantyn Bielozorov',
    notFound: 'Page not found',
    menu: ['Home', 'Experience', 'About Me', 'Contact Me'],
    resumeLinks: ['My resume', 'View my full resume'],
  },
  {
    language: 'Ukrainian',
    locale: 'uk-UA',
    homeHeading: 'Я — Костянтин',
    resumeName: 'Костянтин Бєлозьоров',
    notFound: 'Сторінку не знайдено',
    menu: ['Головна', 'Досвід', 'Про мене', 'Контакти'],
    resumeLinks: ['Моє резюме', 'Повне резюме'],
  },
] as const;

const SCREENS = [
  { screen: 'wide', viewport: { width: 1440, height: 900 } },
  { screen: 'narrow', viewport: { width: 375, height: 812 } },
] as const;
const [WIDE, NARROW] = SCREENS;

/** Where a menu click starts: every route that carries the header. */
const START_PAGES = ['homePage', 'resumePage', 'notFoundPage'] as const;
/** The routes other than home: a header-menu click there opens `/#<section>`. */
const OTHER_PAGES = ['resumePage', 'notFoundPage'] as const;

/** The drawer's social links: name and target, as the Contact Me section shows them. */
const SOCIAL_LINKS = {
  GitHub: 'https://github.com/kosbielozorov',
  LinkedIn: 'https://www.linkedin.com/in/k-bielozorov/',
  Gmail: 'mailto:k.bielozorov@gmail.com',
  Telegram: 'tg://resolve?domain=kostya_bels',
};

for (const {
  language,
  locale,
  homeHeading,
  resumeName,
  notFound,
  menu,
  resumeLinks,
} of LANGUAGES) {
  /** Each menu item with the section it leads to. */
  const ITEMS = menu.map((item, index) => ({ item, section: SECTIONS[index] }));

  test.describe(`Smoke in ${language}`, () => {
    test.use({ locale });

    for (const { screen, viewport } of SCREENS)
      test.describe(`on a ${screen} screen`, () => {
        test.use({ viewport });

        test(
          `the home page opens cleanly in ${language} on a ${screen} screen`,
          {
            tag: ['@smoke', '@unlinked'],
            annotation: [{ type: 'source', description: 'specs/smoke.md#1.1' }],
          },
          async ({ pageManager: { homePage } }) => {
            const problems = homePage.watchProblems();
            await homePage.open();

            await homePage.expectHeading(homeHeading);
            await problems.expectNone();
            await homePage.expectNoHorizontalScroll();
          },
        );

        test(
          `the resume page opens cleanly in ${language} on a ${screen} screen`,
          {
            tag: ['@smoke', '@unlinked'],
            annotation: [{ type: 'source', description: 'specs/smoke.md#1.1' }],
          },
          async ({ pageManager: { resumePage } }) => {
            const problems = resumePage.watchProblems();
            await resumePage.open();

            await resumePage.expectName(resumeName);
            await problems.expectNone();
            await resumePage.expectNoHorizontalScroll();
          },
        );

        test(
          `an unknown path shows the not-found page in ${language} on a ${screen} screen`,
          {
            tag: ['@smoke', '@unlinked'],
            annotation: [{ type: 'source', description: 'specs/smoke.md#1.1' }],
          },
          async ({ pageManager: { notFoundPage } }) => {
            const problems = notFoundPage.watchProblems();
            await notFoundPage.open();

            await notFoundPage.expectHeading(notFound);
            await problems.expectNone();
            await notFoundPage.expectNoHorizontalScroll();
          },
        );

        for (const link of resumeLinks)
          test(
            `"${link}" opens the resume at its top without a reload on a ${screen} screen`,
            {
              tag: ['@smoke', '@unlinked'],
              annotation: [
                { type: 'source', description: 'specs/smoke.md#1.5' },
              ],
            },
            async ({ pageManager: { homePage, resumePage } }) => {
              await homePage.open();
              await homePage.markDocument();

              await homePage.openResume(link);

              await resumePage.expectOpened();
              await resumePage.expectLoaded();
              await resumePage.expectSameDocument();
              await resumePage.expectAtTop();
            },
          );
      });

    test.describe('header menu on a wide screen', () => {
      test.use({ viewport: WIDE.viewport });

      for (const { item, section } of ITEMS) {
        test(
          `"${item}" on the homePage brings #${section} to the top`,
          {
            tag: ['@smoke', '@unlinked'],
            annotation: [{ type: 'source', description: 'specs/smoke.md#1.3' }],
          },
          async ({ pageManager: { homePage } }) => {
            await homePage.open();
            await homePage.menu.expectItems(menu);

            await homePage.menu.goTo(item);

            /* On `/` the URL is not checked — Q-1 (specs/smoke.md, Open questions). */
            await homePage.expectSectionAtTop(section);
          },
        );

        for (const start of OTHER_PAGES)
          test(
            `"${item}" on the ${start} opens /#${section}`,
            {
              tag: ['@smoke', '@unlinked'],
              annotation: [
                { type: 'source', description: 'specs/smoke.md#1.3' },
              ],
            },
            async ({ pageManager }) => {
              const { homePage } = pageManager;
              const from = pageManager[start];
              await from.open();
              await from.menu.expectItems(menu);

              await from.menu.goTo(item);

              await homePage.expectUrl(`/#${section}`);
              await homePage.expectSectionAtTop(section);
            },
          );
      }
    });

    test.describe('drawer on a narrow screen', () => {
      test.use({ viewport: NARROW.viewport });

      for (const { item, section } of ITEMS)
        for (const start of START_PAGES)
          test(
            `"${item}" in the drawer on the ${start} opens /#${section}`,
            {
              tag: ['@smoke', '@unlinked'],
              annotation: [
                { type: 'source', description: 'specs/smoke.md#1.4' },
              ],
            },
            async ({ pageManager }) => {
              const { homePage } = pageManager;
              const from = pageManager[start];
              await from.open();
              await from.menu.expectHidden();

              await from.menu.openDrawer();
              await from.menu.goToFromDrawer(item);

              await homePage.expectUrl(`/#${section}`);
              await homePage.expectSectionAtTop(section);
              await homePage.menu.expectDrawerClosed();
            },
          );
    });
  });
}

test(
  'the home page shows its sections, header and footer',
  {
    tag: ['@smoke', '@unlinked'],
    annotation: [{ type: 'source', description: 'specs/smoke.md#1.2' }],
  },
  async ({ pageManager: { homePage } }) => {
    await homePage.open();

    await homePage.expectMainParts(SECTIONS);
  },
);

test.describe('Keyboard navigation', () => {
  /* `@keyboard`: Tab-order tests; the webkit project leaves them out (playwright.config.ts). */
  test.describe('on a narrow screen', () => {
    test.use({ viewport: NARROW.viewport });

    for (const key of ['Enter', 'Space'] as const)
      test(
        `the drawer toggle is a named button that ${key} opens`,
        {
          tag: ['@smoke', '@keyboard', '@unlinked'],
          annotation: [{ type: 'source', description: 'specs/smoke.md#1.6' }],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.menu.expectDrawerToggleIsNamedButton();
          await homePage.menu.openDrawerWithKeyboard(key);

          await homePage.menu.expectDrawerOpen();
        },
      );
  });

  for (const { screen, viewport } of SCREENS)
    test.describe(`on a ${screen} screen`, () => {
      test.use({ viewport });

      test(
        `the closed drawer takes no Tab stop on a ${screen} screen`,
        {
          tag: ['@smoke', '@keyboard', '@unlinked'],
          annotation: [{ type: 'source', description: 'specs/smoke.md#1.6' }],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.menu.expectFirstTabStopVisible();
          await homePage.menu.expectClosedDrawerOutOfTabOrder();
        },
      );
    });
});

test.describe('Drawer social links on a narrow screen', () => {
  test.use({ viewport: NARROW.viewport });

  test(
    'the drawer social links are named and point where the Contact Me links point',
    {
      tag: ['@smoke', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/smoke.md#1.6' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.menu.openDrawer();

      await homePage.menu.expectDrawerSocialLinks(SOCIAL_LINKS);
    },
  );
});

test(
  '"Back to home" on the not-found page leads to the home page',
  {
    tag: ['@smoke', '@unlinked'],
    annotation: [{ type: 'source', description: 'specs/smoke.md#1.7' }],
  },
  async ({ pageManager: { notFoundPage, homePage } }) => {
    await notFoundPage.open();

    await notFoundPage.backToHome();

    await homePage.expectUrl('/');
    await homePage.expectLoaded();
  },
);
