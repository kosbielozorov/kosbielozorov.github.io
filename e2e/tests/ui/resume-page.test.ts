import { expect, test } from '@fixtures';

/**
 * Resume page `/my-resume` — requirement: the confirmed observations of `specs/resume-page.md`
 * (characterization flow, zone Z-1). The language comes from the browser locale; nothing is stored
 * before the test. No Testomatio ids yet: `@unlinked`.
 */

const PDF = {
  en: 'qa-engineer-k.bielozorov-en.pdf',
  uk: 'qa-engineer-k.bielozorov-ua.pdf',
};

const LANGUAGES = [
  {
    language: 'English',
    locale: 'en-US',
    profile: {
      name: 'Kostiantyn Bielozorov',
      position: 'Manual and automation QA engineer',
    },
    sections: ['Summary', 'Experience', 'Education', 'Skills', 'Languages'],
    titleSuffix: 'My resume',
    pdf: PDF.en,
  },
  {
    language: 'Ukrainian',
    locale: 'uk-UA',
    profile: {
      name: 'Костянтин Бєлозьоров',
      position: 'Інженер з ручного та автоматизованого тестування',
    },
    sections: ['Підсумок', 'Досвід', 'Освіта', 'Навички', 'Мови'],
    titleSuffix: 'Моє резюме',
    pdf: PDF.uk,
  },
] as const;

const RESUME_URL = 'https://kosbielozorov.github.io/my-resume';

for (const {
  language,
  locale,
  profile,
  sections,
  titleSuffix,
  pdf,
} of LANGUAGES)
  test.describe(`Resume page in ${language}`, () => {
    test.use({ locale });

    test(
      `shows the profile and its sections in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.1' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectProfileShown(profile);
        await resumePage.expectSections(sections);
      },
    );

    test(
      `contacts lead to the right addresses in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.2' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectContactLinks({
          email: 'mailto:k.bielozorov@gmail.com',
          phone: 'tel:+380987949507',
          linkedin: 'https://www.linkedin.com/in/k-bielozorov/',
          github: 'https://github.com/kosbielozorov',
          telegram: 'https://t.me/kostya_bels',
        });
      },
    );

    test(
      `downloads the ${language} resume PDF`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.3' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectResumeDownload(pdf);
      },
    );

    test(
      `has the resume title, sharing metadata and Person data in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.6' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectResumeTitle({ ...profile, suffix: titleSuffix });
        await resumePage.expectShareMetadata({
          canonical: RESUME_URL,
          ogUrl: RESUME_URL,
          ogType: 'profile',
        });
        await resumePage.expectPersonStructuredData();
      },
    );

    test(
      `loads cleanly in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.8' },
        ],
      },
      async ({ pageManager: { resumePage } }) => {
        const problems = resumePage.watchProblems();
        await resumePage.open();

        await problems.expectNone();
      },
    );

    test(
      `has a single meta description in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.6' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectSingleMetaDescription(profile.name);
      },
    );
  });

test.describe('Resume page — language and navigation', () => {
  test.use({ locale: 'en-US' });

  test(
    'switching the language updates the page without a reload',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/resume-page.md#1.4' }],
    },
    async ({ openedResumePage: resumePage }) => {
      const [english, ukrainian] = LANGUAGES;
      await resumePage.markDocument();

      await resumePage.switchLanguage('UA');
      await resumePage.expectResumeTitle({
        ...ukrainian.profile,
        suffix: ukrainian.titleSuffix,
      });
      await resumePage.expectProfileShown(ukrainian.profile);
      await resumePage.expectSections(ukrainian.sections);
      await resumePage.expectResumeLink(PDF.uk);
      await resumePage.expectStoredLanguage('uk');

      await resumePage.switchLanguage('EN');
      await resumePage.expectResumeTitle({
        ...english.profile,
        suffix: english.titleSuffix,
      });
      await resumePage.expectProfileShown(english.profile);
      await resumePage.expectSections(english.sections);
      await resumePage.expectResumeLink(PDF.en);
      await resumePage.expectStoredLanguage('en');

      await resumePage.expectSameDocument();
    },
  );

  test(
    'back to home leads to the home section',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/resume-page.md#1.5' }],
    },
    async ({ openedResumePage: resumePage }) => {
      await resumePage.backToHome();

      await resumePage.expectUrl('/#home');
    },
  );

  test(
    'the Ukrainian PDF differs from the English one',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/resume-page.md#1.3' }],
    },
    async ({ openedResumePage: resumePage }) => {
      const englishPdf = await resumePage.resumePdf();
      await resumePage.switchLanguage('UA');
      await resumePage.expectResumeLink(PDF.uk);
      const ukrainianPdf = await resumePage.resumePdf();

      expect(
        ukrainianPdf.equals(englishPdf),
        'The Ukrainian PDF should not be a copy of the English one',
      ).toBe(false);
    },
  );
});

test.describe('Resume page on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test(
    'fits the screen in English',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/resume-page.md#1.7' }],
    },
    async ({ openedResumePage: resumePage }) => {
      await resumePage.expectNoHorizontalScroll();
    },
  );

  test.describe('in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test(
      'fits the screen in Ukrainian',
      {
        tag: ['@unlinked'],
        annotation: [
          { type: 'source', description: 'specs/resume-page.md#1.7' },
        ],
      },
      async ({ openedResumePage: resumePage }) => {
        await resumePage.expectNoHorizontalScroll();
      },
    );
  });
});
