import { expect, type Locator } from '@playwright/test';
import { HeadMetadata } from '@components/HeadMetadata.component';
import { SiteMenu } from '@components/SiteMenu.component';
import { BasePage } from '@pages/BasePage';

/**
 * Not-found page — what any unknown path shows: a heading and "Back to home". Requirement:
 * `specs/smoke.md` 1.1, 1.7 (zone Z-0 of `specs/app-map.md`).
 */
export class NotFoundPage extends BasePage {
  /** Any path the app does not route; this one is never a real page. */
  public readonly pagePath = '/no-such-page';

  /** The header menu and the drawer. */
  public readonly menu = new SiteMenu(this.page);

  /** The document head: meta tags, links, JSON-LD. */
  public readonly head = new HeadMetadata(this.page);

  private readonly main: Locator = this.page.getByRole('main');
  private readonly heading: Locator = this.main.getByRole('heading', {
    level: 1,
  });
  /** The page's only link; its text is translated. */
  private readonly backToHomeLink: Locator = this.main.getByRole('link');

  /**
   * Asserts the not-found page has loaded — its heading is shown.
   *
   * @param {string} [message='Not-found page should be loaded'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the heading is visible.
   */
  async expectLoaded(
    message = 'Not-found page should be loaded',
  ): Promise<void> {
    await expect(this.heading, message).toBeVisible();
  }

  /**
   * Asserts the page's heading text.
   *
   * @param {string} text - Heading in the page's language, e.g. `Page not found`.
   * @returns {Promise<void>} Resolves once the heading reads `text`.
   */
  async expectHeading(text: string): Promise<void> {
    await expect(this.heading, 'Not-found heading').toHaveText(text);
  }

  /**
   * Clicks "Back to home".
   *
   * @returns {Promise<void>} Resolves once the link is clicked.
   */
  async backToHome(): Promise<void> {
    await this.backToHomeLink.click();
  }
}
