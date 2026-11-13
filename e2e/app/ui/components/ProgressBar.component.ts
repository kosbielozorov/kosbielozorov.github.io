import test, { expect, type Locator } from '@playwright/test';
import { Component } from '@components/Base.component';

/** Backend-driven spinners routinely outlive the default expect timeout. */
const PROGRESS_TIMEOUT = 60_000;

/**
 * Opt-in progress indicator. Compose it into a page **only if the app has one** —
 * it is deliberately not on `Component`, so pages without a spinner never inherit
 * a selector that silently times out.
 *
 * @example
 * private readonly progressBar = new ProgressBarComponent(
 *   this.page.getByRole('progressbar'),
 * );
 */
export class ProgressBarComponent extends Component {
  constructor(private readonly root: Locator) {
    super(root.page());
  }

  /**
   * Asserts the progress indicator is present.
   *
   * @param {string} [message='Progress bar should be visible'] - Optional custom assertion message. Defaults to 'Progress bar should be visible'.
   * @returns {Promise<void>} Resolves once the indicator is confirmed visible.
   */
  async expectLoaded(
    message = 'Progress bar should be visible',
  ): Promise<void> {
    await expect(this.root, message).toBeVisible({ timeout: PROGRESS_TIMEOUT });
  }

  /**
   * Asserts the progress indicator is hidden.
   *
   * @param {string} [message='Progress bar should be hidden'] - Optional custom assertion message. Defaults to 'Progress bar should be hidden'.
   * @returns {Promise<void>} Resolves once the indicator is confirmed hidden.
   */
  async expectHidden(message = 'Progress bar should be hidden'): Promise<void> {
    await test.step('Assert progress bar is hidden', async () => {
      await expect(this.root, message).toBeHidden({
        timeout: PROGRESS_TIMEOUT,
      });
    });
  }

  /**
   * Asserts the progress indicator is visible.
   *
   * @returns {Promise<void>} Resolves once the indicator is confirmed visible.
   *
   * @remarks
   *  - Delegates to `expectLoaded()`, wrapped in its own `test.step()` for reporting.
   */
  async expectVisible(): Promise<void> {
    await test.step('Assert progress bar is visible', async () => {
      await this.expectLoaded();
    });
  }

  /**
   * Waits for a full load cycle by asserting the indicator shows, then hides.
   *
   * @returns {Promise<void>} Resolves once the indicator has been visible and then hidden.
   */
  async expectCycle(): Promise<void> {
    await test.step('Wait for progress bar cycle', async () => {
      await expect(async () => {
        await this.expectVisible();
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: PROGRESS_TIMEOUT,
      });

      await expect(async () => {
        await this.expectHidden();
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: PROGRESS_TIMEOUT,
      });
    });
  }
}
