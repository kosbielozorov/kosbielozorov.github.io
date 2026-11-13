import { Component } from '@components/Base.component';
import { expect, type Locator } from '@playwright/test';

/** Tab presses allowed before giving up on reaching the drawer toggle from the keyboard. */
const MAX_TAB_STOPS_TO_TOGGLE = 25;
/** Upper bound on a page's Tab stops when walking all of them. */
const MAX_TAB_STOPS_ON_PAGE = 120;
/** The toggle's old placeholder name (its image alt before NAV-1 was fixed) — not a real name. */
const PLACEHOLDER_TOGGLE_NAME = /^drawer item$/i;

/** Where the keyboard focus is: inside the drawer, and whether it has wrapped back to the page. */
interface FocusStop {
  label: string;
  inDrawer: boolean;
  onPage: boolean;
}

/**
 * Site-wide navigation shared by every page: the header menu (wide screens) and the diagonal
 * drawer with its toggle (narrow screens). Requirement: `specs/smoke.md` 1.3, 1.4, 1.6 (zone Z-0 of
 * `specs/app-map.md`).
 */
export class SiteMenu extends Component {
  /** The drawer toggle's image — the toggle is found through it, whatever wraps it. */
  private readonly toggleImage: Locator = this.page.locator(
    'img[src$="/drawer.png"]',
  );
  /**
   * The site header. The drawer renders a header of its own (first in the DOM) and the resume page
   * one more, so the site header is the one holding the drawer toggle's image.
   */
  private readonly header: Locator = this.page
    .getByRole('banner')
    .filter({ has: this.toggleImage });
  private readonly headerNavigation: Locator =
    this.header.getByRole('navigation');
  /** Clicking the image reaches the toggle's handler, whether a `div` (today) or a `<button>`. */
  private readonly drawerToggleImage: Locator = this.header.locator(
    'img[src$="/drawer.png"]',
  );
  /**
   * The toggle: the header's button holding the image.
   */
  private readonly drawerToggleButton: Locator = this.header
    .getByRole('button')
    .filter({ has: this.toggleImage });
  /** The drawer has no landmark of its own apart from its header; its container is the stable hook. */
  private readonly drawer: Locator = this.page.locator('.diagonal-drawer');
  private readonly drawerNavigation: Locator =
    this.drawer.getByRole('navigation');
  /**
   * The home page's Contact Me section — the reference the drawer's social links must match
   * (`specs/smoke.md` 1.6). Only on `/`.
   */
  private readonly contactSection: Locator = this.page.locator('#contact-me');

  /**
   * Asserts the site header is shown.
   *
   * @param {string} [message='Site header should be visible'] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the site header is visible.
   */
  async expectLoaded(message = 'Site header should be visible'): Promise<void> {
    await expect(this.header, message).toBeVisible();
  }

  /**
   * Asserts the header menu shows exactly these items, in this order.
   *
   * @param {readonly string[]} items - Item texts in the page's language.
   * @returns {Promise<void>} Resolves once the header menu's links match `items`.
   */
  async expectItems(items: readonly string[]): Promise<void> {
    await expect(
      this.headerNavigation.getByRole('link'),
      'Header menu items',
    ).toHaveText([...items]);
  }

  /**
   * Clicks a header-menu item (wide screens).
   *
   * @param {string} item - Item text in the page's language.
   * @returns {Promise<void>} Resolves once the item is clicked.
   */
  async goTo(item: string): Promise<void> {
    await this.headerNavigation
      .getByRole('link', { name: item, exact: true })
      .click();
  }

  /**
   * Asserts the header menu is hidden — narrow screens use the drawer instead.
   *
   * @returns {Promise<void>} Resolves once the header menu is hidden.
   */
  async expectHidden(): Promise<void> {
    await expect(
      this.headerNavigation,
      'Header menu should be hidden',
    ).toBeHidden();
  }

  /**
   * Opens the drawer with a click on its toggle and waits until it is fully on screen.
   *
   * @returns {Promise<void>} Resolves once the drawer is open.
   */
  async openDrawer(): Promise<void> {
    await this.drawerToggleImage.click();
    await this.expectDrawerOpen();
  }

  /**
   * Clicks a drawer item. The drawer shows its items in capitals (CSS), so the name matches without
   * regard to case.
   *
   * @param {string} item - Item text in the page's language.
   * @returns {Promise<void>} Resolves once the item is clicked.
   */
  async goToFromDrawer(item: string): Promise<void> {
    await this.drawerNavigation
      .getByRole('link', { name: item, exact: false })
      .click();
  }

  /**
   * Asserts the drawer is fully on screen — its opening animation has finished.
   *
   * @returns {Promise<void>} Resolves once the drawer's menu is wholly in the viewport.
   */
  async expectDrawerOpen(): Promise<void> {
    await expect(this.drawerNavigation, 'Drawer should be open').toBeInViewport(
      { ratio: 1 },
    );
  }

  /**
   * Asserts the drawer is closed — still on the page, moved off screen.
   *
   * @returns {Promise<void>} Resolves once the drawer's menu is attached and out of the viewport.
   */
  async expectDrawerClosed(): Promise<void> {
    await expect(this.drawerNavigation, 'Drawer should exist').toBeAttached();
    await expect(
      this.drawerNavigation,
      'Drawer should be closed',
    ).not.toBeInViewport();
  }

  /**
   * Asserts the drawer toggle is a button with a real accessible name — not the placeholder image
   * alt `drawer item`.
   *
   * @returns {Promise<void>} Resolves once the toggle button is visible and properly named.
   */
  async expectDrawerToggleIsNamedButton(): Promise<void> {
    await expect(
      this.drawerToggleButton,
      'Drawer toggle should be a button',
    ).toBeVisible();
    await expect(
      this.drawerToggleButton,
      'Drawer toggle should have a name',
    ).toHaveAccessibleName(/\S/);
    await expect(
      this.drawerToggleButton,
      'Drawer toggle name should say what it does',
    ).not.toHaveAccessibleName(PLACEHOLDER_TOGGLE_NAME);
  }

  /**
   * Reaches the drawer toggle button with Tab from the top of the page and presses a key on it.
   *
   * @param {'Enter' | 'Space'} key - The key that should open the drawer.
   * @returns {Promise<void>} Resolves once the key is pressed on the focused toggle.
   *
   * @remarks
   *  - Fails when the toggle is not focused after {@link MAX_TAB_STOPS_TO_TOGGLE} Tab presses.
   */
  async openDrawerWithKeyboard(key: 'Enter' | 'Space'): Promise<void> {
    await expect(this.drawerToggleButton, 'Drawer toggle button').toBeVisible();
    for (let stop = 0; stop < MAX_TAB_STOPS_TO_TOGGLE; stop++) {
      await this.page.keyboard.press('Tab');
      const focused = await this.drawerToggleButton.evaluate(
        el => el === document.activeElement,
      );
      if (focused) break;
    }
    await expect(
      this.drawerToggleButton,
      'Drawer toggle should be reachable with Tab',
    ).toBeFocused();
    await this.page.keyboard.press(key);
  }

  /**
   * Asserts the open drawer shows a named link for each social profile, and that it points where
   * the Contact Me section's link of the same name points.
   *
   * @param {Readonly<Record<string, string>>} links - Accessible name → `href`, e.g.
   *   `{ GitHub: 'https://github.com/…' }`, as the Contact Me section shows them.
   * @returns {Promise<void>} Resolves once both links of every name are visible with that `href`.
   */
  async expectDrawerSocialLinks(
    links: Readonly<Record<string, string>>,
  ): Promise<void> {
    for (const [name, href] of Object.entries(links)) {
      const drawerLink = this.drawer.getByRole('link', { name, exact: true });
      await expect(drawerLink, `Drawer link "${name}"`).toBeVisible();
      await expect(drawerLink, `Drawer link "${name}" target`).toHaveAttribute(
        'href',
        href,
      );
      await expect(
        this.contactSection.getByRole('link', { name, exact: true }),
        `Contact Me link "${name}"`,
      ).toHaveAttribute('href', href);
    }
  }

  /**
   * Presses Tab once from the top of the page and asserts the focused control is on screen.
   *
   * @returns {Promise<void>} Resolves once the first Tab stop is in the viewport.
   */
  async expectFirstTabStopVisible(): Promise<void> {
    await this.page.keyboard.press('Tab');
    await expect(
      this.page.locator(':focus'),
      'The first Tab stop should be on screen',
    ).toBeInViewport();
  }

  /**
   * Walks every Tab stop of the page (until the focus leaves the page or
   * {@link MAX_TAB_STOPS_ON_PAGE} presses) and asserts none is inside the closed drawer.
   *
   * @returns {Promise<void>} Resolves once no Tab stop was found in the drawer.
   */
  async expectClosedDrawerOutOfTabOrder(): Promise<void> {
    await this.expectDrawerClosed();
    const inDrawer: string[] = [];
    let leftPage = false;
    for (let stop = 0; stop < MAX_TAB_STOPS_ON_PAGE; stop++) {
      await this.page.keyboard.press('Tab');
      const focus = await this.page.evaluate((): FocusStop => {
        const el = document.activeElement;
        return {
          label: `${el?.tagName ?? '?'} "${(el?.textContent ?? '').trim().slice(0, 20)}"`,
          inDrawer: Boolean(el?.closest('.diagonal-drawer')),
          onPage: Boolean(el) && el !== document.body,
        };
      });
      if (!focus.onPage) {
        leftPage = true;
        break;
      }
      if (focus.inDrawer) inDrawer.push(focus.label);
    }
    expect(
      inDrawer,
      'No control of the closed drawer should take focus',
    ).toEqual([]);
    expect(
      leftPage,
      `The Tab walk should leave the page within ${MAX_TAB_STOPS_ON_PAGE} stops`,
    ).toBe(true);
  }
}
