import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/** The two buttons, by the code they show — it stays visible after LANG-3 adds the language name. */
type LanguageButton = 'EN' | 'UA';

/** The accessible names the buttons must have (`specs/language-switching.md` 1.5, Q-3). */
const LANGUAGE_NAME: Record<LanguageButton, string> = {
  EN: 'English (EN)',
  UA: 'Українська (UA)',
};

/**
 * Hidden or `inert` switchers (the closed drawer, the header on a narrow screen) still carry the
 * state the tests read, so the buttons are found including hidden ones.
 */
const INCLUDE_HIDDEN = { includeHidden: true } as const;

/**
 * An `EN | UA` language switcher — the header's or the drawer's. Requirement:
 * `specs/language-switching.md` (zone Z-2 of `specs/app-map.md`).
 */
export class LanguageSwitcher extends Component {
  /**
   * @param {Locator} group - The switcher's group. Found by its role, not its name: the name is
   *   being translated (LANG-2).
   */
  constructor(private readonly group: Locator) {
    super(group.page());
  }

  /**
   * Asserts the switcher is shown.
   *
   * @param {string} [message='Language switcher should be visible'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the switcher is visible.
   */
  async expectLoaded(
    message = 'Language switcher should be visible',
  ): Promise<void> {
    await expect(this.group, message).toBeVisible();
  }

  /**
   * Clicks a language button.
   *
   * @param {LanguageButton} language - `EN` or `UA`.
   * @returns {Promise<void>} Resolves once the button is clicked.
   */
  async choose(language: LanguageButton): Promise<void> {
    await this.button(language).click();
  }

  /**
   * Asserts which language the switcher marks as active, the way it shows it today: the active
   * button carries the `underline` class, the other does not. (Assistive technology gets no state
   * until LANG-1 is fixed — `expectPressed`.)
   *
   * @param {LanguageButton} language - The language that should be marked.
   * @returns {Promise<void>} Resolves once only that button is marked.
   */
  async expectActive(language: LanguageButton): Promise<void> {
    await expect(
      this.button(language),
      `${language} should be marked`,
    ).toContainClass('underline');
    await expect(
      this.button(this.other(language)),
      `Only ${language} should be marked`,
    ).not.toContainClass('underline');
  }

  /**
   * Asserts the active language's button is announced as pressed and the other as not pressed.
   *
   * @param {LanguageButton} language - The active language.
   * @returns {Promise<void>} Resolves once `aria-pressed` is `true` / `false` accordingly.
   */
  async expectPressed(language: LanguageButton): Promise<void> {
    await expect(this.button(language), `${language} pressed`).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(
      this.button(this.other(language)),
      `${this.other(language)} not pressed`,
    ).toHaveAttribute('aria-pressed', 'false');
  }

  /**
   * Asserts each button's accessible name says its language and keeps its visible code:
   * "English (EN)" and "Українська (UA)".
   *
   * @returns {Promise<void>} Resolves once both buttons have those names.
   */
  async expectButtonsNameLanguages(): Promise<void> {
    for (const language of ['EN', 'UA'] as const)
      await expect(
        this.button(language),
        `${language} names its language`,
      ).toHaveAccessibleName(LANGUAGE_NAME[language]);
  }

  /**
   * Asserts the switcher group's accessible name.
   *
   * @param {string} label - The expected label, e.g. `Language` / `Мова`.
   * @returns {Promise<void>} Resolves once the group's name is `label`.
   */
  async expectGroupLabel(label: string): Promise<void> {
    await expect(this.group, 'Language switcher label').toHaveAccessibleName(
      label,
    );
  }

  /** A language button, found by the code it shows (its visible text). */
  private button(language: LanguageButton): Locator {
    return this.group
      .getByRole('button', INCLUDE_HIDDEN)
      .filter({ hasText: language });
  }

  /** The other language. */
  private other(language: LanguageButton): LanguageButton {
    return language === 'EN' ? 'UA' : 'EN';
  }
}
