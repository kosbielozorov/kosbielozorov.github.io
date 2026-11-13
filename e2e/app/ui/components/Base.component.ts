import test from '@playwright/test';
import { PageHolder } from '../pages/PageHolder';

/**
 * Root of every UI class (pages, components, modals).
 *
 * Deliberately minimal: only behaviour that is true for **any** application.
 * App-specific chrome (progress indicators, toasts) lives in opt-in components —
 * `ProgressBar.component.ts`, `Toast.component.ts` — composed into the pages that
 * actually have it. A shared base with placeholder selectors would make every
 * page inherit a locator that times out instead of failing fast.
 */
export abstract class Component extends PageHolder {
  abstract expectLoaded(message?: string): Promise<void>;

  /** Level-1 heading — the one piece of chrome that is safe to assume. */
  public readonly mainTitle = this.page.getByRole('heading', { level: 1 });

  /**
   * Soft check that returns `false` instead of surfacing `expectLoaded()` assertion failures.
   *
   * @returns {Promise<boolean>} `true` if `expectLoaded()` passes, `false` otherwise.
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.expectLoaded();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanctioned `waitForTimeout` wrapper for backend processing when no UI/network signal exists.
   * Do not call `page.waitForTimeout` from tests — use this method only when justified.
   *
   * @param {number} time - Milliseconds to wait.
   * @returns {Promise<void>} Resolves after waiting the given duration.
   */
  async wait(time: number) {
    await test.step(`Wait for ${time} ms`, async () => {
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await this.page.waitForTimeout(time);
    });
  }

  /**
   * Reloads the current page and waits for the load event.
   *
   * @returns {Promise<void>} Resolves once the page has reloaded and reached the `load` state.
   */
  async reload(): Promise<void> {
    await test.step('Reload the page', async () => {
      await this.page.reload();
      await this.page.waitForLoadState('load');
    });
  }
}
