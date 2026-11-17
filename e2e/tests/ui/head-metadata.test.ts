import { PROFILE } from '@constants/portfolio';
import { test } from '@fixtures';

/**
 * Head metadata — what search engines and link previews read: description, Open Graph, Twitter,
 * canonical, robots, the JSON-LD `Person`, icons and the web manifest, with and without JavaScript.
 * Requirement: the confirmed observations of `specs/head-metadata.md` (characterization flow, zone
 * Z-5). Summaries and names come from the site's data (`@constants/portfolio`) — content is not
 * pinned. No Testomatio ids yet: `@unlinked`.
 */

const SITE = 'https://kosbielozorov.github.io';

const LANGUAGES = [
  {
    language: 'English',
    code: 'en',
    locale: 'en-US',
    resume: 'My resume',
    notFound: 'This page does not exist or the link is outdated.',
  },
  {
    language: 'Ukrainian',
    code: 'uk',
    locale: 'uk-UA',
    resume: 'Моє резюме',
    notFound: 'Такої сторінки немає або посилання застаріло.',
  },
] as const;
const [ENGLISH] = LANGUAGES;

for (const { language, code, locale, resume, notFound } of LANGUAGES) {
  const profile = PROFILE[code];
  const homeTitle = `${profile.fullName} | ${profile.position}`;
  const resumeTitle = `${profile.fullName} – ${profile.position} | ${resume}`;

  test.describe(`Head metadata in ${language}`, () => {
    test.use({ locale });

    test(
      `the home page describes the owner for search and previews in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.1' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.head.expectTag('description', profile.summary);
        await homePage.head.expectTag('og:title', homeTitle);
        await homePage.head.expectTag('og:description', profile.summary);
        await homePage.head.expectTag('og:type', 'website');
        await homePage.head.expectTag('twitter:card', 'summary');
        await homePage.head.expectTag('twitter:title', homeTitle);
        await homePage.head.expectTag('twitter:description', profile.summary);
      },
    );

    test(
      `the resume page has its Open Graph profile and JSON-LD person in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.2' },
        ],
      },
      async ({ pageManager: { resumePage } }) => {
        await resumePage.open();

        await resumePage.head.expectTag('og:title', resumeTitle);
        await resumePage.head.expectTag('og:description', profile.summary);
        await resumePage.head.expectTag(
          'profile:first_name',
          profile.firstName,
        );
        await resumePage.head.expectTag('profile:last_name', profile.lastName);
        await resumePage.head.expectPerson({
          name: profile.fullName,
          jobTitle: profile.position,
          email: 'mailto:k.bielozorov@gmail.com',
          telephone: '+380987949507',
          url: `${SITE}/my-resume`,
          image: `${SITE}/images/kos.jpg`,
          sameAs: [
            'https://www.linkedin.com/in/k-bielozorov/',
            'https://github.com/kosbielozorov',
            'https://t.me/kostya_bels',
          ],
          worksFor: profile.currentCompany,
        });
      },
    );

    test(
      `the not-found page is described and kept out of search in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.3' },
        ],
      },
      async ({ pageManager: { notFoundPage } }) => {
        await notFoundPage.open();

        await notFoundPage.head.expectTag('description', notFound);
        await notFoundPage.head.expectTag('robots', 'noindex');
        await notFoundPage.head.expectNoTagsWithPrefixes([
          'og:',
          'twitter:',
          'profile:',
        ]);
        await notFoundPage.head.expectNoLink('canonical');
      },
    );

    test(
      `once the app has run, each preview tag appears once with the page's values in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.4' },
        ],
      },
      async ({ pageManager: { homePage, resumePage } }) => {
        await homePage.open();
        await homePage.head.expectTag('description', profile.summary);
        await homePage.head.expectTag('og:title', homeTitle);
        await homePage.head.expectTag('og:description', profile.summary);

        await resumePage.open();
        await resumePage.head.expectTag(
          'description',
          `${profile.fullName} – ${profile.summary}`,
        );
        await resumePage.head.expectTag('og:title', resumeTitle);
        await resumePage.head.expectTag('og:description', profile.summary);
      },
    );

    test(
      `the resume page has Twitter tags in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.2' },
        ],
      },
      async ({ pageManager: { resumePage } }) => {
        await resumePage.open();

        await resumePage.head.expectTag('twitter:card', 'summary');
        await resumePage.head.expectTag('twitter:title', resumeTitle);
        await resumePage.head.expectTag('twitter:description', profile.summary);
      },
    );
  });
}

test.describe('Canonical, preview image, preview without JavaScript, manifest', () => {
  test.use({ locale: ENGLISH.locale });

  test(
    'the home page has a canonical URL',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.1' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.head.expectLink('canonical', `${SITE}/`);
      await homePage.head.expectTag('og:url', `${SITE}/`);
    },
  );

  test(
    'the home page has a preview image',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.1' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.head.expectImageTag('og:image', SITE);
      await homePage.head.expectImageTag('twitter:image', SITE);
    },
  );

  test(
    'the resume page has a preview image',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.2' },
      ],
    },
    async ({ pageManager: { resumePage } }) => {
      await resumePage.open();

      await resumePage.head.expectImageTag('og:image', SITE);
      await resumePage.head.expectImageTag('twitter:image', SITE);
    },
  );

  for (const path of ['/', '/my-resume'])
    test(
      `the HTML of ${path} has preview tags without JavaScript`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/head-metadata.md#1.4' },
        ],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.head.expectStaticTags(path, [
          'og:title',
          'og:description',
          'og:image',
        ]);
        await homePage.head.expectStaticImageTag(path, SITE);
      },
    );

  test(
    'the web manifest names the site',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.5' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.head.expectManifestNamed();
    },
  );
});

test.describe('Icons on every route', () => {
  test.use({ locale: ENGLISH.locale });

  test(
    'the home page has the viewport, icons and manifest',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.5' },
      ],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.head.expectIcons();
    },
  );

  test(
    'the resume page has the viewport, icons and manifest',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.5' },
      ],
    },
    async ({ pageManager: { resumePage } }) => {
      await resumePage.open();

      await resumePage.head.expectIcons();
    },
  );

  test(
    'the not-found page has the viewport, icons and manifest',
    {
      tag: ['@unlinked'],
      annotation: [
        { type: 'source', description: 'specs/head-metadata.md#1.5' },
      ],
    },
    async ({ pageManager: { notFoundPage } }) => {
      await notFoundPage.open();

      await notFoundPage.head.expectIcons();
    },
  );
});
