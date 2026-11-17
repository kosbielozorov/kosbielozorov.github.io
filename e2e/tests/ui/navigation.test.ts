import { test } from '@fixtures';

/**
 * Navigation — beyond smoke: the sticky header, the marked menu item, the switch between the header
 * menu and the drawer, the drawer and the header menu from the keyboard, Back after a menu link, the
 * back-to-top button. Requirement: the confirmed observations of `specs/navigation.md`
 * (characterization flow, zone Z-4). English (texts are not what this zone is about). No Testomatio
 * ids yet: `@unlinked`.
 */

const WIDE = { width: 1440, height: 900 };
const NARROW = { width: 375, height: 812 };

const MENU = ['Home', 'Experience', 'About Me', 'Contact Me'] as const;
const SECTIONS = ['home', 'experience', 'about-me', 'contact-me'] as const;
const ITEMS = MENU.map((item, index) => ({ item, section: SECTIONS[index] }));

/** Header-menu widths and drawer widths around the 1280 px switch. */
const DRAWER_WIDTHS = [1279, 1024, 768, 640] as const;
/** Widths checked for sideways scrolling. */
const FITTING_WIDTHS = [768, 1024, 1279, 1280] as const;
const OVERFLOWING_WIDTHS = [640, 700] as const;

test.use({ locale: 'en-US' });

for (const [screen, viewport] of [
  ['wide', WIDE],
  ['narrow', NARROW],
] as const)
  test.describe(`Sticky header on a ${screen} screen`, () => {
    test.use({ viewport });

    test(
      `the header stays at the top while the home page scrolls on a ${screen} screen`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.1' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.scrollDown();

        await homePage.menu.expectHeaderAtTop();
      },
    );

    test(
      `the header stays at the top while the resume page scrolls on a ${screen} screen`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.1' },
        ],
      },
      async ({ pageManager: { resumePage } }) => {
        await resumePage.open();

        await resumePage.scrollDown();

        await resumePage.menu.expectHeaderAtTop();
      },
    );

    test(
      `the header stays at the top while the not-found page scrolls on a ${screen} screen`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.1' },
        ],
      },
      async ({ pageManager: { notFoundPage } }) => {
        await notFoundPage.open();

        await notFoundPage.scrollDown();

        await notFoundPage.menu.expectHeaderAtTop();
      },
    );
  });

test.describe('Marked menu item', () => {
  test.use({ viewport: WIDE });

  test(
    'Home is marked on loading the home page',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.2' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.menu.expectMarked('Home');
    },
  );

  for (const { item } of ITEMS)
    test(
      `"${item}" is marked after a click`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.2' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.menu.goTo(item);

        await homePage.menu.expectMarked(item);
      },
    );

  for (const { item, section } of ITEMS.filter(({ section }) =>
    ['experience', 'contact-me'].includes(section),
  ))
    test(
      `"${item}" is marked on loading /#${section}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.2' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open(`/#${section}`);

        await homePage.menu.expectMarked(item);
      },
    );

  test(
    'the marked item is announced as current',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.2' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.menu.goTo('About Me');

      await homePage.menu.expectCurrentAnnounced('About Me');
    },
  );
});

test.describe('Header menu or drawer by width', () => {
  test.describe('at 1280 px', () => {
    test.use({ viewport: { width: 1280, height: 900 } });

    test(
      'the header menu is shown and the drawer toggle is not',
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.3' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.menu.expectItems(MENU);
        await homePage.menu.expectDrawerToggleHidden();
      },
    );
  });

  for (const width of DRAWER_WIDTHS)
    test.describe(`at ${width} px`, () => {
      test.use({ viewport: { width, height: 900 } });

      test(
        `the drawer toggle replaces the header menu at ${width} px`,
        {
          tag: ['@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/navigation.md#1.3' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.menu.expectHidden();
          await homePage.menu.expectDrawerToggleShown();
        },
      );
    });

  for (const width of FITTING_WIDTHS)
    test.describe(`at ${width} px`, () => {
      test.use({ viewport: { width, height: 900 } });

      test(
        `the home page does not scroll sideways at ${width} px`,
        {
          tag: ['@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/navigation.md#1.3' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.expectNoHorizontalScroll();
        },
      );
    });

  for (const width of OVERFLOWING_WIDTHS)
    test.describe(`at ${width} px`, () => {
      test.use({ viewport: { width, height: 900 } });

      test(
        `the home page does not scroll sideways at ${width} px`,
        {
          tag: ['@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/navigation.md#1.3' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.expectNoHorizontalScroll();
        },
      );
    });
});

test.describe('Drawer from the keyboard', () => {
  /* `@keyboard`: Tab-order tests; the webkit project leaves them out (playwright.config.ts). */
  test.use({ viewport: NARROW });

  test(
    'opening the drawer moves the focus to "Close menu"',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.menu.openDrawerWithKeyboard('Enter');

      await homePage.menu.expectDrawerOpen();
      await homePage.menu.expectFocusOnClose('Close menu');
      await homePage.menu.expectToggleExpanded(true);
    },
  );

  test(
    'Escape closes the drawer and returns the focus to "Open menu"',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.menu.openDrawerWithKeyboard('Enter');

      await homePage.menu.closeDrawerWithEscape();

      await homePage.menu.expectDrawerClosed();
      await homePage.menu.expectFocusOnToggle();
      await homePage.menu.expectToggleExpanded(false);
    },
  );

  test(
    '"Close menu" closes the drawer and returns the focus to "Open menu"',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.menu.openDrawerWithKeyboard('Enter');

      await homePage.menu.closeDrawerWithCloseButton('Close menu');

      await homePage.menu.expectDrawerClosed();
      await homePage.menu.expectFocusOnToggle();
      await homePage.menu.expectToggleExpanded(false);
    },
  );

  test(
    'Tab and Shift+Tab keep the focus inside the open drawer',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.menu.openDrawerWithKeyboard('Enter');

      await homePage.menu.expectFocusTrappedInDrawer();
    },
  );
});

test.describe('Header menu from the keyboard', () => {
  test.use({ viewport: WIDE });

  test(
    'Tab reaches the menu items, then the language buttons, each visibly focused',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.5' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      /* The language buttons by the code they show — their full names may grow (LANG-3). */
      await homePage.menu.expectTabOrder([...MENU, /\bEN\b/, /\bUA\b/]);
    },
  );

  test(
    'Enter on a menu item brings its section to the top',
    {
      tag: ['@keyboard', '@unlinked'],
      annotation: [{ type: 'source', description: 'specs/navigation.md#1.5' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.menu.goToWithKeyboard('About Me');

      await homePage.expectSectionAtTop('about-me');
    },
  );
});

test(
  'Back after a menu link from the resume returns to the resume',
  {
    tag: ['@unlinked'],
    annotation: [{ type: 'source', description: 'specs/navigation.md#1.6' }],
  },
  async ({ pageManager: { resumePage, homePage } }) => {
    await resumePage.open();
    await resumePage.menu.goTo('Experience');
    await homePage.expectUrl('/#experience');

    await homePage.goBack();

    await resumePage.expectOpened();
    await resumePage.expectLoaded();
  },
);

for (const { language, locale, heading, name } of [
  {
    language: 'English',
    locale: 'en-US',
    heading: "I'm Kostiantyn",
    name: 'Back to top',
  },
  {
    language: 'Ukrainian',
    locale: 'uk-UA',
    heading: 'Я — Костянтин',
    name: 'Нагору',
  },
] as const)
  test.describe(`Back-to-top button in ${language}`, () => {
    test.use({ viewport: WIDE, locale });

    test(
      `the back-to-top button is a named button that Enter uses in ${language}`,
      {
        tag: ['@keyboard', '@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/navigation.md#1.7' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();
        /* The page is in the language under test, so a missing button is the defect, not the language. */
        await homePage.expectHeading(heading);
        await homePage.scrollDown();

        await homePage.useBackToTopWithKeyboard(name);

        await homePage.expectAtTop();
      },
    );
  });
