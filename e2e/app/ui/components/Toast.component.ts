import { Component } from '@components/Base.component';
import test, { expect, type Locator } from '@playwright/test';

/** Toasts are usually rendered after a round trip; keep room for slow backends. */
const TOAST_TIMEOUT = 60_000;

/**
 * Opt-in toast / notification area. Compose it into a page **only if the app has
 * one**, passing a locator that matches an individual message.
 *
 * @example
 * private readonly toast = new ToastComponent(
 *   this.page.getByRole('status'),
 * );
 */
export class ToastComponent extends Component {
  constructor(private readonly messages: Locator) {
    super(messages.page());
  }

  /**
   * Asserts at least one toast is visible.
   *
   * @param {string} [message='Toast should be visible'] - Optional custom assertion message. Defaults to 'Toast should be visible'.
   * @returns {Promise<void>} Resolves once a toast is confirmed visible.
   */
  async expectLoaded(message = 'Toast should be visible'): Promise<void> {
    await expect(this.messages.first(), message).toBeVisible({
      timeout: TOAST_TIMEOUT,
    });
  }

  /**
   * Asserts each expected message is shown.
   *
   * @param {string[]} expected - Message texts that must appear, in any order.
   * @returns {Promise<void>} Resolves once every expected message has been confirmed visible.
   *
   * @remarks
   *  - Throws if `expected` is empty — call with at least one message.
   */
  async expectMessages(expected: string[]): Promise<void> {
    if (expected.length === 0) {
      throw new Error('At least one toast message is required');
    }

    for (const text of expected) {
      await test.step(`Check toast message: ${text}`, async () => {
        await expect(
          this.messages.getByText(text).first(),
          `Message should have text: ${text}`,
        ).toHaveText(text, { timeout: TOAST_TIMEOUT });
      });
    }
  }
}
