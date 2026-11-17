import { expect, type Locator } from '@playwright/test';
import { BackToTop } from '@components/BackToTop.component';
import { HeadMetadata } from '@components/HeadMetadata.component';
import { SiteFooter } from '@components/SiteFooter.component';
import { SiteMenu } from '@components/SiteMenu.component';
import { BasePage } from '@pages/BasePage';

/**
 * Not-found page — what any unknown path shows: "404", a heading, an explanation and "Back to home".
 * Requirement: `specs/not-found-page.md` (zone Z-6), and `specs/smoke.md` 1.1, 1.7.
 */
export class NotFoundPage extends BasePage {
  /** Any path the app does not route; this one is never a real page. */
  public readonly pagePath = '/no-such-page';

  /** The header menu and the drawer. */
  public readonly menu = new SiteMenu(this.page);

  /** The document head: meta tags, links, JSON-LD. */
  public readonly head = new HeadMetadata(this.page);

  /** The site footer. */
  public readonly footer = new SiteFooter(this.page);

  /** The back-to-top button (after scrolling). */
  public readonly backToTop = new BackToTop(this.page);

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

  /**
   * Asserts the page's message inside `main`: its paragraphs and heading are exactly "404", the
   * heading and the explanation, in this order; its one link reads `link` and leads to `/`.
   *
   * @param {{ heading: string; text: string; link: string }} content - The texts in the page's
   *   language.
   * @returns {Promise<void>} Resolves once those texts and the link match.
   */
  async expectContent(content: {
    heading: string;
    text: string;
    link: string;
  }): Promise<void> {
    await expect(
      this.main.locator(':scope p, :scope h1'),
      'Not-found message',
    ).toHaveText(['404', content.heading, content.text]);
    await expect(this.backToHomeLink, 'Link home').toHaveText(content.link);
    await expect(this.backToHomeLink, 'Link home target').toHaveAttribute(
      'href',
      '/',
    );
  }
}
