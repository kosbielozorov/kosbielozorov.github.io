import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/** Upper bound on a page's Tab stops when looking for a skill control. */
const MAX_TAB_STOPS_ON_PAGE = 120;

/**
 * The skills of the home page's About Me section: six cards (wide screens), the panel showing the
 * chosen skill, and the "previous" / "next" arrows (narrow screens). Requirement:
 * `specs/home-page.md` 1.3–1.5, 1.7 (zone Z-3 of `specs/app-map.md`).
 */
export class Skills extends Component {
  /** A card is the button holding a skill's `h4` title. */
  private readonly cards: Locator = this.page.locator('button:has(h4)');
  private readonly cardTitles: Locator = this.cards.getByRole('heading', {
    level: 4,
  });
  /** The panel has no landmark or label of its own; its container class is the stable hook. */
  private readonly panel: Locator = this.page.locator('.shadow-accent-color');
  private readonly panelTitle: Locator = this.panel.getByRole('heading', {
    level: 2,
  });
  /** The flip card showing the chosen skill's number, e.g. `*1`. */
  private readonly number: Locator = this.panel.locator('.card-inner');
  /** The arrows: the panel's buttons holding an icon — "previous" first, "next" last. */
  private readonly arrows: Locator = this.panel.locator('button:has(svg)');

  /**
   * Asserts the skills panel is shown.
   *
   * @param {string} [message='Skills panel should be visible'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the panel is visible.
   */
  async expectLoaded(
    message = 'Skills panel should be visible',
  ): Promise<void> {
    await expect(this.panel, message).toBeVisible();
  }

  /**
   * Asserts the cards show exactly these skills, in this order (wide screens).
   *
   * @param {readonly string[]} names - Skill titles in the page's language.
   * @returns {Promise<void>} Resolves once the card titles match `names`.
   */
  async expectSkills(names: readonly string[]): Promise<void> {
    await expect(this.cardTitles, 'Skill cards').toHaveText([...names]);
  }

  /**
   * Asserts the panel shows a skill: the "My skills in" label, its title, a non-empty list and its
   * number on the flip card.
   *
   * @param {string} label - The panel's label in the page's language, e.g. `My skills in`.
   * @param {string} name - The skill's title.
   * @param {number} position - Its number, 1–6.
   * @returns {Promise<void>} Resolves once the panel shows that skill.
   */
  async expectShown(
    label: string,
    name: string,
    position: number,
  ): Promise<void> {
    await expect(
      this.panel.getByText(label, { exact: true }),
      'Skills panel label',
    ).toBeVisible();
    await expect(this.panelTitle, 'Shown skill').toHaveText(name);
    await expect(
      this.panel.getByRole('listitem').first(),
      'Skill list',
    ).toBeVisible();
    await expect(this.number, 'Shown skill number').toHaveText(
      new RegExp(`^\\*?\\s*${position}$`),
    );
  }

  /**
   * Clicks a skill card (wide screens).
   *
   * @param {string} name - The skill's title in the page's language.
   * @returns {Promise<void>} Resolves once the card is clicked.
   */
  async choose(name: string): Promise<void> {
    await this.card(name).click();
  }

  /**
   * Clicks "next" (narrow screens).
   *
   * @returns {Promise<void>} Resolves once the arrow is clicked.
   */
  async next(): Promise<void> {
    await this.arrows.last().click();
  }

  /**
   * Clicks "previous" (narrow screens).
   *
   * @returns {Promise<void>} Resolves once the arrow is clicked.
   */
  async previous(): Promise<void> {
    await this.arrows.first().click();
  }

  /**
   * Presses "next" once per skill and asserts each step shows the following skill, ending back at
   * the first (narrow screens).
   *
   * @param {string} label - The panel's label, e.g. `My skills in`.
   * @param {readonly string[]} names - All skill titles in order.
   * @returns {Promise<void>} Resolves once the cycle returned to the first skill.
   */
  async expectNextCycle(
    label: string,
    names: readonly string[],
  ): Promise<void> {
    for (let step = 1; step <= names.length; step++) {
      await this.next();
      const index = step % names.length;
      await this.expectShown(label, names[index], index + 1);
    }
  }

  /**
   * Reaches a skill card with Tab and presses a key on it (wide screens).
   *
   * @param {string} name - The skill's title in the page's language.
   * @param {'Enter' | 'Space'} key - The key that should choose it.
   * @returns {Promise<void>} Resolves once the key is pressed on the focused card.
   */
  async chooseWithKeyboard(
    name: string,
    key: 'Enter' | 'Space',
  ): Promise<void> {
    await this.pressOnFocused(this.cardButton(name), `"${name}" card`, key);
  }

  /**
   * Asserts the chosen card is announced as chosen (`aria-pressed="true"` or a non-false
   * `aria-current`) and no other card is.
   *
   * @param {string} name - The chosen skill's title.
   * @returns {Promise<void>} Resolves once only that card is announced as chosen.
   */
  async expectChosenAnnounced(name: string): Promise<void> {
    await expect
      .poll(
        () =>
          this.cards.evaluateAll(cards =>
            cards
              .filter(
                card =>
                  card.getAttribute('aria-pressed') === 'true' ||
                  /^(?!false$).+/.test(card.getAttribute('aria-current') ?? ''),
              )
              .map(card => card.querySelector('h4')?.textContent.trim()),
          ),
        { message: 'The card announced as chosen' },
      )
      .toEqual([name]);
  }

  /**
   * Asserts "previous" and "next" are buttons with accessible names (narrow screens).
   *
   * @returns {Promise<void>} Resolves once both arrows are named buttons.
   */
  async expectArrowsNamed(): Promise<void> {
    const buttons = this.panel.getByRole('button');
    await expect(buttons, 'Skill arrows as buttons').toHaveCount(2);
    for (const button of await buttons.all())
      await expect(button, 'Skill arrow name').toHaveAccessibleName(/\S/);
  }

  /**
   * Reaches "next" with Tab and presses a key on it (narrow screens).
   *
   * @param {'Enter' | 'Space'} key - The key that should move on.
   * @returns {Promise<void>} Resolves once the key is pressed on the focused arrow.
   */
  async nextWithKeyboard(key: 'Enter' | 'Space'): Promise<void> {
    await this.pressOnFocused(
      this.panel.getByRole('button').last(),
      '"next"',
      key,
    );
  }

  /**
   * Asserts every skill icon is decorative (`alt=""`).
   *
   * @returns {Promise<void>} Resolves once all six icons have an empty `alt`.
   */
  async expectDecorativeIcons(): Promise<void> {
    const icons = this.cards.locator('img');
    await expect(icons, 'Skill icons').toHaveCount(6);
    for (const icon of await icons.all())
      await expect(icon, 'Skill icon should be decorative').toHaveAttribute(
        'alt',
        '',
      );
  }

  /** The card with this title. */
  private card(name: string): Locator {
    return this.cards.filter({
      has: this.page.getByRole('heading', { level: 4, name, exact: true }),
    });
  }

  /** The card with this title, as a button. */
  private cardButton(name: string): Locator {
    return this.page.getByRole('button').filter({
      has: this.page.getByRole('heading', { level: 4, name, exact: true }),
    });
  }

  /** Tabs from the top until `target` is focused (bounded), then presses `key`. */
  private async pressOnFocused(
    target: Locator,
    what: string,
    key: 'Enter' | 'Space',
  ): Promise<void> {
    await expect(target, `${what} should be a visible button`).toBeVisible();
    for (let stop = 0; stop < MAX_TAB_STOPS_ON_PAGE; stop++) {
      await this.page.keyboard.press('Tab');
      if (await target.evaluate(el => el === document.activeElement)) break;
    }
    await expect(target, `${what} should be reachable with Tab`).toBeFocused();
    await this.page.keyboard.press(key);
  }
}
