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
   * (`cta.backToTop`).
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

  /**
   * Asserts the button is not on the page (the page is at its top).
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once no such button exists.
   */
  async expectAbsent(name: string): Promise<void> {
    await expect(this.button(name), `"${name}" should be absent`).toHaveCount(
      0,
    );
  }

  /**
   * Asserts the button is shown.
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once the button is visible.
   */
  async expectShown(name: string): Promise<void> {
    await expect(this.button(name), `"${name}" should be shown`).toBeVisible();
  }

  /**
   * Clicks the button with the mouse at its centre. The button keeps bouncing, so it never stands
   * still for Playwright's stability check (`specs/footer.md` 1.3); the bounce moves it by at most a
   * quarter of its height, so its centre is always on it. The keyboard path is `useWithKeyboard`
   * (`specs/navigation.md` 1.7).
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once the mouse has clicked the button.
   */
  async activate(name: string): Promise<void> {
    const button = this.button(name);
    await expect(button, `"${name}" should be shown`).toBeVisible();
    const box = await button.boundingBox();
    expect(box, `"${name}" should have a position`).not.toBeNull();
    if (box)
      await this.page.mouse.click(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
  }

  /**
   * Asserts the button really bounces: the `bounce` animation, endless, running, with a duration —
   * and its position changes between two moments.
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Back to top`.
   * @returns {Promise<void>} Resolves once the animation is running and the button moves.
   */
  async expectBouncing(name: string): Promise<void> {
    const button = this.button(name);
    const animation = await button.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        name: style.animationName,
        iterations: style.animationIterationCount,
        state: style.animationPlayState,
        seconds: parseFloat(style.animationDuration),
      };
    });
    expect(animation, `"${name}" animation`).toMatchObject({
      name: 'bounce',
      iterations: 'infinite',
      state: 'running',
    });
    expect(animation.seconds, `"${name}" animation duration`).toBeGreaterThan(
      0,
    );
    const first = await button.evaluate(el => getComputedStyle(el).transform);
    await expect
      .poll(() => button.evaluate(el => getComputedStyle(el).transform), {
        message: `"${name}" should move`,
      })
      .not.toBe(first);
  }
}
