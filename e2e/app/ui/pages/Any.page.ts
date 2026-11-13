import { expect, type Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

/**
 * Characterization scaffolding only (`tests/characterization/`): opens any path of a legacy zone so
 * its page-level ARIA snapshot can be taken before the zone has Page Objects of its own. It knows no
 * elements of any page — functional tests use the real Page Object instead
 * **[lint: `contract/characterization`]**.
 */
export class AnyPage extends BasePage {
  public readonly pagePath = '/';

  private readonly body: Locator = this.page.locator('body');

  /**
   * Asserts some page has finished loading — its body is visible. Says nothing about which page.
   *
   * @param {string} [message='Page should be loaded'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the page body is visible.
   */
  async expectLoaded(message = 'Page should be loaded'): Promise<void> {
    await expect(this.body, message).toBeVisible();
  }
}
