import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/** Upper bound on a page's Tab stops when looking for the button. */
const MAX_TAB_STOPS_ON_PAGE = 120;

/**
 * The back-to-top button shown bottom right once the page is scrolled (zone Z-7, taken into
 * `specs/navigation.md` 1.7).
 */
export class BackToTop extends Component {
  /**
   * The button, by its accessible name — translated, so the caller passes it.
   *
   * @param {string} name - Accessible name, e.g. `Back to top`.
   * @returns {Locator} The button with that name.
   */
  private button(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  /**
   * Asserts the back-to-top control is shown, found by its tooltip in either language
   * (`cta.backToTop`) — it has no role today (NAV-7).
   *
   * @param {string} [message='Back-to-top should be shown'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the control is visible.
   */
  async expectLoaded(message = 'Back-to-top should be shown'): Promise<void> {
    await expect(
      this.page.getByTitle(/^(Back to top|Нагору)$/),
      message,
    ).toBeVisible();
  }

  /**
   * Reaches the button with Tab and presses Enter on it.
   *
   * @param {string} name - Accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once Enter is pressed on the focused button.
   *
   * @remarks
   *  - Fails when the button is not shown, or not focused after {@link MAX_TAB_STOPS_ON_PAGE} Tabs.
   */
  async useWithKeyboard(name: string): Promise<void> {
    const button = this.button(name);
    await expect(button, `"${name}" should be a visible button`).toBeVisible();
    for (let stop = 0; stop < MAX_TAB_STOPS_ON_PAGE; stop++) {
      await this.page.keyboard.press('Tab');
      if (await button.evaluate(el => el === document.activeElement)) break;
    }
    await expect(
      button,
      `"${name}" should be reachable with Tab`,
    ).toBeFocused();
    await this.page.keyboard.press('Enter');
  }
}
