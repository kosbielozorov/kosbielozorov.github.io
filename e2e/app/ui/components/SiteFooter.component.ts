import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/**
 * The site footer shown on every route: the owner's name and the current year. Requirement:
 * `specs/footer.md` 1.1 (zone Z-7 of `specs/app-map.md`).
 */
export class SiteFooter extends Component {
  private readonly footer: Locator = this.page.getByRole('contentinfo');
  /** Every `<footer>` element, landmark or not (one inside `main` is no landmark). */
  private readonly footerElements: Locator = this.page.locator('footer');

  /**
   * Asserts the footer is shown.
   *
   * @param {string} [message='Footer should be visible'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the footer is visible.
   */
  async expectLoaded(message = 'Footer should be visible'): Promise<void> {
    await expect(this.footer, message).toBeVisible();
  }

  /**
   * Asserts there is one footer (one `<footer>`, a landmark outside `main`) showing exactly the name
   * and the year, with no links, icons or images.
   *
   * @param {string} name - The owner's full name in the page's language.
   * @param {string} year - The current year, e.g. `2026`.
   * @returns {Promise<void>} Resolves once the footer shows those two lines and nothing else.
   */
  async expectContent(name: string, year: string): Promise<void> {
    await expect(this.footer, 'One footer landmark').toHaveCount(1);
    await expect(this.footerElements, 'One footer element').toHaveCount(1);
    expect(
      await this.footer.evaluate(el => el.closest('main') === null),
      'The footer should be outside main',
    ).toBe(true);
    await expect(this.footer, 'Footer content').toHaveText(`${name} ${year}`, {
      useInnerText: true,
    });
    /* "Nothing else" includes things without text: icons, images, links, buttons. */
    await expect(
      this.footer.locator('a, button, img, svg, input'),
      'Nothing but the two text lines in the footer',
    ).toHaveCount(0);
  }
}
