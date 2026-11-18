import { expect, type Locator } from '@playwright/test';
import { BackToTop } from '@components/BackToTop.component';
import { Skills } from '@components/Skills.component';
import { HeadMetadata } from '@components/HeadMetadata.component';
import { SiteFooter } from '@components/SiteFooter.component';
import { SiteMenu } from '@components/SiteMenu.component';
import type { ShownJob } from '@constants/portfolio';
import { BasePage } from '@pages/BasePage';

/** Pixels a section's top may sit off the viewport's top after scrolling to it. */
const AT_TOP_TOLERANCE = 2;

/**
 * Home page (`/`): the sections Home, Experience, About Me, Contact Me, and the links to the
 * resume. Requirement: `specs/smoke.md` (confirmed observations, zone Z-0 of `specs/app-map.md`).
 */
export class HomePage extends BasePage {
  public readonly pagePath = '/';

  /** The header menu and the drawer. */
  public readonly menu = new SiteMenu(this.page);

  /** The document head: meta tags, links, JSON-LD. */
  public readonly head = new HeadMetadata(this.page);

  /** The site footer. */
  public readonly footer = new SiteFooter(this.page);

  /** The About Me skills: cards, panel, arrows. */
  public readonly skills = new Skills(this.page);

  /** The back-to-top button (after scrolling). */
  public readonly backToTop = new BackToTop(this.page);

  private readonly heroHeading: Locator = this.page
    .locator('#home')
    .getByRole('heading', { level: 1 });
  private readonly footerLandmark: Locator = this.page.getByRole('contentinfo');
  private readonly homeSection: Locator = this.page.locator('#home');
  private readonly contactSection: Locator = this.page.locator('#contact-me');

  /**
   * Asserts the home page has loaded — its first section's heading is shown.
   *
   * @param {string} [message='Home page should be loaded'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the heading of `#home` is visible.
   */
  async expectLoaded(message = 'Home page should be loaded'): Promise<void> {
    await expect(this.heroHeading, message).toBeVisible();
  }

  /**
   * Asserts the hero heading's text.
   *
   * @param {string} text - Heading in the page's language, e.g. `I'm Kostiantyn`.
   * @returns {Promise<void>} Resolves once the heading of `#home` reads `text`.
   */
  async expectHeading(text: string): Promise<void> {
    await expect(this.heroHeading, 'Home heading').toHaveText(text);
  }

  /**
   * Asserts the page holds exactly these sections in this order — each shown with a non-empty
   * heading — plus the site header and a footer.
   *
   * @param {readonly string[]} sectionIds - Section `id`s in page order, e.g. `home`.
   * @returns {Promise<void>} Resolves once the sections, header and footer are confirmed.
   */
  async expectMainParts(sectionIds: readonly string[]): Promise<void> {
    const sections = this.page.locator(
      sectionIds.map(id => `#${id}`).join(', '),
    );
    await expect
      .poll(() => sections.evaluateAll(found => found.map(el => el.id)), {
        message: 'Home sections in page order',
      })
      .toEqual([...sectionIds]);
    for (const id of sectionIds) {
      const section = this.page.locator(`#${id}`);
      await expect(section, `Section #${id}`).toBeVisible();
      await expect(
        /* Any level: the Home heading is the page's `h1`, the other sections' are `h2`. */
        section.getByRole('heading').first(),
        `Heading of section #${id}`,
      ).toHaveText(/\S/);
    }
    await this.menu.expectLoaded();
    await expect(this.footerLandmark, 'Footer should be visible').toBeVisible();
  }

  /**
   * Asserts the page has scrolled to a section: its top is at the top of the viewport, or — for a
   * section near the end shorter than the screen — the page is scrolled to the bottom with the
   * section in view.
   *
   * @param {string} sectionId - Section `id`, e.g. `experience`.
   * @returns {Promise<void>} Resolves once the scroll (smooth) has brought the section up.
   */
  async expectSectionAtTop(sectionId: string): Promise<void> {
    const section = this.page.locator(`#${sectionId}`);
    await expect
      .poll(
        () =>
          section.evaluate((el, tolerance) => {
            const top = el.getBoundingClientRect().top;
            const atBottom =
              window.scrollY + window.innerHeight >=
              document.documentElement.scrollHeight - 1;
            return (
              Math.abs(top) <= tolerance ||
              (atBottom && top >= 0 && top < window.innerHeight)
            );
          }, AT_TOP_TOLERANCE),
        { message: `Section #${sectionId} should be at the top of the screen` },
      )
      .toBe(true);
  }

  /**
   * Clicks a link to the resume page.
   *
   * @param {string} link - Link text in the page's language, e.g. `My resume`.
   * @returns {Promise<void>} Resolves once the link is clicked.
   */
  async openResume(link: string): Promise<void> {
    await this.page.getByRole('link', { name: link, exact: true }).click();
  }

  /**
   * Uses the back-to-top button from the keyboard: Tab to it, Enter.
   *
   * @param {string} name - The button's accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once Enter is pressed on the button.
   */
  async useBackToTopWithKeyboard(name: string): Promise<void> {
    await this.backToTop.useWithKeyboard(name);
  }

  /**
   * Asserts the Home section's position heading.
   *
   * @param {string} position - The position in the page's language.
   * @returns {Promise<void>} Resolves once the `h2` of `#home` reads `position`.
   */
  async expectPosition(position: string): Promise<void> {
    const heading = this.homeSection.getByRole('heading', { level: 2 });
    await expect(heading, 'Position').toBeVisible();
    /* `toBeVisible` ignores opacity; a transparent position is not shown either. */
    await expect(heading, 'Position should not be transparent').not.toHaveCSS(
      'opacity',
      '0',
    );
    await expect(heading, 'Position').toHaveText(position);
  }

  /**
   * Asserts the Home section shows a photo with a text alternative.
   *
   * @returns {Promise<void>} Resolves once the photo is visible and named.
   */
  async expectPhoto(): Promise<void> {
    const photo = this.homeSection.getByRole('img');
    await expect(photo, 'Photo').toBeVisible();
    await expect(photo, 'Photo text alternative').toHaveAccessibleName(/\S/);
  }

  /**
   * Clicks the Home section's link to the Experience section.
   *
   * @param {string} label - The link text in the page's language, e.g. `Experience`.
   * @returns {Promise<void>} Resolves once the link is clicked.
   */
  async goToExperience(label: string): Promise<void> {
    await this.homeSection
      .getByRole('link', { name: label, exact: true })
      .click();
  }

  /**
   * Asserts the Experience section shows exactly these jobs, in this order: each with its title,
   * its period and non-empty achievements and responsibilities lists.
   *
   * @param {readonly ShownJob[]} jobs - Title and period of each job, as the site's data gives them.
   * @returns {Promise<void>} Resolves once the section's jobs match `jobs`.
   */
  async expectJobs(jobs: readonly ShownJob[]): Promise<void> {
    /* A job is a direct item of the section's first list; its own lists are nested inside it. */
    const items = this.page
      .locator('#experience')
      .getByRole('list')
      .first()
      .locator(':scope > li');
    await expect(items, 'Jobs shown').toHaveCount(jobs.length);
    for (const [index, { title, period }] of jobs.entries()) {
      const job = items.nth(index);
      const heading = job.getByRole('heading', { level: 3 });
      await expect(heading, `Job ${index + 1} title`).toBeVisible();
      await expect(heading, `Job ${index + 1} title`).toHaveText(title);
      /* The period has no role of its own; `.job__period` is its only hook (the dates beside the
       * job are a decorative, `aria-hidden` copy). */
      await expect(
        job.locator('.job__period'),
        `Job ${index + 1} period`,
      ).toHaveText(period);
      const lists = job.getByRole('list');
      await expect(lists, `Job ${index + 1} lists`).toHaveCount(2);
      for (const list of await lists.all())
        await expect(
          list.getByRole('listitem').first(),
          'List item',
        ).toBeVisible();
    }
  }

  /**
   * Asserts the Contact Me links: each name leads to its address, and none opens a new tab.
   *
   * @param {Readonly<Record<string, string>>} links - Link name → `href`.
   * @returns {Promise<void>} Resolves once every link matches.
   */
  async expectContactLinks(
    links: Readonly<Record<string, string>>,
  ): Promise<void> {
    for (const [name, href] of Object.entries(links)) {
      const link = this.contactSection.getByRole('link', { name, exact: true });
      await expect(link, `Contact link "${name}"`).toHaveAttribute(
        'href',
        href,
      );
      await expect(
        link,
        `Contact link "${name}" should open in the same tab`,
        /* Any `target` other than `_self` (`_blank`, `_new`, a named window) opens a new tab. */
      ).not.toHaveAttribute('target', /^(?!_self$).+/);
    }
  }

  /**
   * Asserts the page has one `main` landmark and the sections are inside it.
   *
   * @param {readonly string[]} sectionIds - Section `id`s, e.g. `home`.
   * @returns {Promise<void>} Resolves once there is one `main` holding every section.
   */
  async expectOneMainWithSections(
    sectionIds: readonly string[],
  ): Promise<void> {
    const main = this.page.getByRole('main');
    await expect(main, 'One main landmark').toHaveCount(1);
    for (const id of sectionIds)
      await expect(
        main.locator(`#${id}`),
        `Section #${id} inside main`,
      ).toBeAttached();
  }

  /**
   * Asserts the page exposes exactly one `h1`, with this text.
   *
   * @param {string} text - The heading's text in the page's language.
   * @returns {Promise<void>} Resolves once there is a single `h1` reading `text`.
   */
  async expectSingleH1(text: string): Promise<void> {
    const h1 = this.page.getByRole('heading', { level: 1 });
    await expect(h1, 'One h1').toHaveCount(1);
    await expect(h1, 'The h1').toHaveText(text);
  }

  /**
   * Asserts each section other than Home has a visible level-2 heading — the section headings sit
   * below the page's single `h1`.
   *
   * @param {readonly string[]} sectionIds - Section `id`s other than `home`.
   * @returns {Promise<void>} Resolves once every section shows an `h2`.
   */
  async expectSectionHeadingsBelowH1(
    sectionIds: readonly string[],
  ): Promise<void> {
    for (const id of sectionIds)
      await expect(
        this.page.locator(`#${id}`).getByRole('heading', { level: 2 }).first(),
        `Section #${id} heading at level 2`,
      ).toBeVisible();
  }

  /**
   * Asserts a decorative background text of the About Me section is hidden from assistive
   * technology: the text is there, no element other than a heading shows it unhidden, and at most
   * one heading does — in Ukrainian the section heading reads the same as the background text
   * ("Про мене"), and that heading must stay exposed.
   *
   * @param {string} text - The background text in the page's language, e.g. `About Me`.
   * @returns {Promise<void>} Resolves once only the section's own heading (if any) exposes that text.
   */
  async expectBackgroundTextHidden(text: string): Promise<void> {
    const shown = this.page
      .locator('#about-me')
      .getByText(text, { exact: true });
    /* The text must be there — hidden, not missing (a typo or another translation would pass). */
    await expect(shown.first(), `Background "${text}"`).toBeAttached();
    const exposed = (headings: boolean) =>
      shown.evaluateAll(
        (elements, wantHeadings) =>
          elements.filter(
            element =>
              !element.closest('[aria-hidden="true"]') &&
              /^H[1-6]$/.test(element.tagName) === wantHeadings,
          ).length,
        headings,
      );
    await expect
      .poll(() => exposed(false), {
        message: `Background "${text}" should be hidden`,
      })
      .toBe(0);
    expect(
      await exposed(true),
      `At most the section heading may read "${text}"`,
    ).toBeLessThanOrEqual(1);
  }
}
