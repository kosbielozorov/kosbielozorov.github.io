import { expect, type Locator } from '@playwright/test';
import { BackToTop } from '@components/BackToTop.component';
import { SiteMenu } from '@components/SiteMenu.component';
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

  private readonly backToTop = new BackToTop(this.page);

  private readonly heroHeading: Locator = this.page
    .locator('#home')
    .getByRole('heading', { level: 1 });
  private readonly footer: Locator = this.page.getByRole('contentinfo');

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
        section.getByRole('heading', { level: 1 }).last(),
        `Heading of section #${id}`,
      ).toHaveText(/\S/);
    }
    await this.menu.expectLoaded();
    await expect(this.footer, 'Footer should be visible').toBeVisible();
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
}
