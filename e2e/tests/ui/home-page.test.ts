import { RECENT_JOBS } from '@constants/portfolio';
import { test } from '@fixtures';

/**
 * Home page — the four sections' content and behaviour: the introduction, the jobs, the skills
 * (cards on wide screens, arrows on narrow ones), the contacts, the page structure for assistive
 * technology. Requirement: the confirmed observations of `specs/home-page.md` (characterization
 * flow, zone Z-3). Only stable texts are pinned. No Testomatio ids yet: `@unlinked`.
 */

const WIDE = { width: 1440, height: 900 };
const NARROW = { width: 375, height: 812 };

const LANGUAGES = [
  {
    language: 'English',
    code: 'en',
    locale: 'en-US',
    heading: "I'm Kostiantyn",
    watermark: 'About Me',
    position: 'Manual and automation QA engineer',
    experience: 'Experience',
    skillsIn: 'My skills in',
    skills: [
      'QA docs & reports',
      'Front-end testing',
      'Back-end testing',
      'Automation testing',
      'DevOps and VCS',
      'Soft and Tools',
    ],
  },
  {
    language: 'Ukrainian',
    code: 'uk',
    locale: 'uk-UA',
    heading: 'Я — Костянтин',
    watermark: 'Про мене',
    position: 'Інженер з ручного та автоматизованого тестування',
    experience: 'Досвід',
    skillsIn: 'Мої навички в',
    skills: [
      'QA-документація та звіти',
      'Тестування фронтенду',
      'Тестування бекенду',
      'Автоматизація тестування',
      'DevOps та VCS',
      'Програми та інструменти',
    ],
  },
] as const;
const [ENGLISH] = LANGUAGES;

const CONTACT_LINKS = {
  GitHub: 'https://github.com/kosbielozorov',
  LinkedIn: 'https://www.linkedin.com/in/k-bielozorov/',
  Gmail: 'mailto:k.bielozorov@gmail.com',
  /* `tg://` is intended on the home page (specs/home-page.md O-4), unlike the resume page. */
  Telegram: 'tg://resolve?domain=kostya_bels',
};

const SECTIONS = ['home', 'experience', 'about-me', 'contact-me'] as const;

for (const {
  language,
  code,
  locale,
  position,
  experience,
  skillsIn,
  skills,
} of LANGUAGES)
  test.describe(`Home page in ${language}`, () => {
    test.use({ locale, viewport: WIDE });

    test(
      `the Home section shows the position and a described photo in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.1' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.expectPosition(position);
        await homePage.expectPhoto();
      },
    );

    test(
      `"${experience}" in the Home section brings the Experience section up in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.1' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.goToExperience(experience);

        await homePage.expectUrl('/#experience');
        await homePage.expectSectionAtTop('experience');
      },
    );

    test(
      `the Experience section shows the two most recent jobs with their lists in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.2' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.expectJobs(RECENT_JOBS[code]);
      },
    );

    test(
      `six skills are shown in order and the first is chosen in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.3' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.skills.expectSkills(skills);
        await homePage.skills.expectShown(skillsIn, skills[0], 1);
      },
    );

    for (const [index, skill] of skills.entries()) {
      /* Start from another skill, so the panel has to change. */
      const otherIndex = (index + 1) % skills.length;
      const other = skills[otherIndex];
      test(
        `choosing "${skill}" shows its skills in ${language}`,
        {
          tag: ['@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/home-page.md#1.3' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();
          await homePage.skills.choose(other);
          await homePage.skills.expectShown(skillsIn, other, otherIndex + 1);

          await homePage.skills.choose(skill);

          await homePage.skills.expectShown(skillsIn, skill, index + 1);
        },
      );
    }

    test(
      `the Contact Me links lead to the owner's profiles in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.6' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.expectContactLinks(CONTACT_LINKS);
      },
    );
  });

test.describe('Skills on a narrow screen', () => {
  test.use({ locale: ENGLISH.locale, viewport: NARROW });

  test(
    '"next" goes through all six skills and back to the first',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/home-page.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.skills.expectNextCycle(ENGLISH.skillsIn, ENGLISH.skills);
    },
  );

  test(
    '"previous" goes from the first skill to the sixth',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/home-page.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.skills.previous();

      await homePage.skills.expectShown(ENGLISH.skillsIn, ENGLISH.skills[5], 6);
    },
  );

  test(
    '"previous" goes back one skill',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/home-page.md#1.4' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();
      await homePage.skills.next();
      await homePage.skills.next();
      await homePage.skills.expectShown(ENGLISH.skillsIn, ENGLISH.skills[2], 3);

      await homePage.skills.previous();

      await homePage.skills.expectShown(ENGLISH.skillsIn, ENGLISH.skills[1], 2);
    },
  );
});

test.describe('Skills from the keyboard', () => {
  /* `@keyboard`: Tab-order tests; the webkit project leaves them out (playwright.config.ts). */
  test.use({ locale: ENGLISH.locale });

  for (const key of ['Enter', 'Space'] as const) {
    test.describe(`on a wide screen with ${key}`, () => {
      test.use({ viewport: WIDE });

      test(
        `a skill card is a button that ${key} chooses, and the chosen card is announced`,
        {
          tag: ['@keyboard', '@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/home-page.md#1.5' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.skills.chooseWithKeyboard(ENGLISH.skills[2], key);

          await homePage.skills.expectShown(
            ENGLISH.skillsIn,
            ENGLISH.skills[2],
            3,
          );
          await homePage.skills.expectChosenAnnounced(ENGLISH.skills[2]);
        },
      );
    });

    test.describe(`on a narrow screen with ${key}`, () => {
      test.use({ viewport: NARROW });

      test(
        `the arrows are named buttons and ${key} on "next" moves on`,
        {
          tag: ['@keyboard', '@unlinked'],
          annotation: [
            { type: 'source', description: 'specs/home-page.md#1.5' },
          ],
        },
        async ({ pageManager: { homePage } }) => {
          await homePage.open();

          await homePage.skills.expectArrowsNamed();
          await homePage.skills.nextWithKeyboard(key);

          await homePage.skills.expectShown(
            ENGLISH.skillsIn,
            ENGLISH.skills[1],
            2,
          );
        },
      );
    });
  }
});

for (const { language, locale, heading, watermark } of LANGUAGES)
  test.describe(`Structure for assistive technology in ${language}`, () => {
    test.use({ locale, viewport: WIDE });

    test(
      `one main landmark, a single h1, section headings below it and a hidden background text in ${language}`,
      {
        tag: ['@unlinked'],
        annotation: [{ type: 'source', description: 'specs/home-page.md#1.7' }],
      },
      async ({ pageManager: { homePage } }) => {
        await homePage.open();

        await homePage.expectOneMainWithSections(SECTIONS);
        await homePage.expectSingleH1(heading);
        await homePage.expectSectionHeadingsBelowH1(SECTIONS.slice(1));
        await homePage.expectBackgroundTextHidden(watermark);
      },
    );
  });

test.describe('Skill icons', () => {
  test.use({ locale: ENGLISH.locale, viewport: WIDE });

  test(
    'the skill icons are decorative',
    {
      tag: ['@unlinked'],
      annotation: [{ type: 'source', description: 'specs/home-page.md#1.7' }],
    },
    async ({ pageManager: { homePage } }) => {
      await homePage.open();

      await homePage.skills.expectDecorativeIcons();
    },
  );
});
