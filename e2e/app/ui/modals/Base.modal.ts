import { expect, test } from '@playwright/test';
import { Component } from '../components/Base.component';

export default abstract class BaseModal extends Component {
  /** ARIA default — override in a subclass if the app does not use `role="dialog"`. */
  protected readonly parentLocator = this.page
    .getByRole('dialog')
    .filter({ visible: true });
  readonly continueButton = this.parentLocator.getByRole('button', {
    name: 'Continue',
  });
  readonly cancelButton = this.parentLocator.getByRole('button', {
    name: 'Cancel',
  });

  abstract expectLoaded(message?: string): Promise<void>;

  /**
   * Waits for the modal window to become visible.
   *
   * If a headerText is provided, waits for a heading element within the modal
   * dialog to be visible and contain the specified text. Otherwise, waits for
   * the modal dialog itself to be visible.
   *
   * @param {string} [headerText] - Optional text to match as the modal header.
   * @returns {Promise<void>} A promise that resolves when the modal is visible (and, if headerText is provided, when the header matches).
   *
   * @example
   * // Wait for a modal with a specific header text
   * await modal.waitForOpen("Are you sure?");
   *
   * @example
   * // Wait for any modal to be visible
   * await modal.waitForOpen();
   */
  async waitForOpen(headerText?: string): Promise<void> {
    await test.step('Wait for modal window to be visible', async () => {
      if (headerText) {
        await expect(
          this.parentLocator.getByRole('heading', { name: headerText }),
          `Modal window header should have title ${headerText}`,
        ).toHaveText(`${headerText}`);
      } else {
        await expect(
          this.parentLocator,
          'Modal window should be visible',
        ).toBeVisible();
      }
    });
  }

  /**
   * Waits for the modal window to be hidden.
   *
   * @returns {Promise<void>} A promise that resolves when the modal window is confirmed hidden.
   *
   * @example
   * await modal.waitForClose();
   */
  async waitForClose(): Promise<void> {
    await test.step('Wait for modal to be hidden', async () => {
      await expect(
        this.parentLocator,
        'Modal window should be hidden',
      ).toBeHidden();
    });
  }

  /**
   * Clicks the "Continue" button in the modal.
   *
   * Waiting for the result is the caller's job — assert the observable outcome
   * (modal closed, row updated) or a composed `ProgressBarComponent`. The base
   * modal makes no assumption that the app has a spinner.
   *
   * @returns {Promise<void>} A promise that resolves after the "Continue" button is clicked.
   *
   * @example
   * await modal.continue();
   * await modal.waitForClose();
   */
  async continue(): Promise<void> {
    await test.step('Continue', async () => {
      await this.continueButton.click();
    });
  }

  /**
   * Clicks the "Cancel" button in the modal.
   *
   * As with {@link continue}, asserting the outcome is left to the caller.
   *
   * @returns {Promise<void>} A promise that resolves after the "Cancel" button is clicked.
   *
   * @example
   * await modal.cancel();
   * await modal.waitForClose();
   */
  async cancel(): Promise<void> {
    await test.step('Cancel', async () => {
      await this.cancelButton.click();
    });
  }
}
