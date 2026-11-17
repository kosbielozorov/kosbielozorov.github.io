import { Component } from '@components/Base.component';
import { LanguageSwitcher } from '@components/LanguageSwitcher.component';
import { expect, type Locator } from '@playwright/test';

/** Tab presses allowed before giving up on reaching the drawer toggle from the keyboard. */
const MAX_TAB_STOPS_TO_TOGGLE = 25;
/** Tab presses allowed before giving up on reaching a header-menu item from the keyboard. */
const MAX_TAB_STOPS_TO_MENU_ITEM = 25;
/** Upper bound on a page's Tab stops when walking all of them. */
const MAX_TAB_STOPS_ON_PAGE = 120;
/** The toggle's old placeholder name (its image alt before NAV-1 was fixed) — not a real name. */
const PLACEHOLDER_TOGGLE_NAME = /^drawer item$/i;
/** Shift+Tab / Tab presses checked while the drawer is open — more than its controls. */
const DRAWER_TAB_WALK = 15;
/** The drawer's container — it has no landmark of its own apart from its header. */
const DRAWER = '.diagonal-drawer';

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
  /** Clicking the image reaches the toggle button's handler. */
  private readonly drawerToggleImage: Locator = this.header.locator(
    'img[src$="/drawer.png"]',
  );
  /**
   * The toggle: the header's button holding the image.
   */
  private readonly drawerToggleButton: Locator = this.header
    .getByRole('button')
    .filter({ has: this.toggleImage });
  /** The drawer's container is the stable hook ({@link DRAWER}). */
  private readonly drawer: Locator = this.page.locator(DRAWER);
  private readonly drawerNavigation: Locator =
    this.drawer.getByRole('navigation');
  /**
   * The home page's Contact Me section — the reference the drawer's social links must match
   * (`specs/smoke.md` 1.6). Only on `/`.
   */
  private readonly contactSection: Locator = this.page.locator('#contact-me');

  /**
   * The header's `EN | UA` switcher. Found including hidden: on narrow screens the header menu is
   * hidden but its switcher still holds the state.
   */
  public readonly languages = new LanguageSwitcher(
    this.header
      .getByRole('navigation', { includeHidden: true })
      .getByRole('group', { includeHidden: true }),
  );
  /** The drawer's `EN | UA` switcher (the closed drawer is `inert`, hence including hidden). */
  public readonly drawerLanguages = new LanguageSwitcher(
    this.drawer.getByRole('group', { includeHidden: true }),
  );

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
      const focus = await this.focusStop();
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

  /**
   * Asserts the site header sits at the top of the screen (it is fixed while the page scrolls).
   *
   * @returns {Promise<void>} Resolves once the header is in the viewport with its top at 0.
   */
  async expectHeaderAtTop(): Promise<void> {
    await expect(
      this.header,
      'Site header should be on screen',
    ).toBeInViewport();
    await expect
      .poll(
        async () => Math.round((await this.header.boundingBox())?.y ?? -1),
        {
          message: 'Site header should be at the top of the screen',
        },
      )
      .toBe(0);
  }

  /**
   * Asserts exactly one header-menu item is marked as current, and that it is `item`.
   *
   * @param {string} item - Item text in the page's language.
   * @returns {Promise<void>} Resolves once only `item` carries the marked state.
   */
  async expectMarked(item: string): Promise<void> {
    /* The app marks the current item with `aria-current` (what a screen reader reads) as well as
     * colour; the attribute is the stable signal. */
    await this.expectCurrentAnnounced(item);
  }

  /**
   * Asserts the current header-menu item is announced as current (`aria-current`) and no other is;
   * `aria-current="false"` counts as not current.
   *
   * @param {string} item - Item text in the page's language.
   * @returns {Promise<void>} Resolves once only `item` has a non-false `aria-current`.
   */
  async expectCurrentAnnounced(item: string): Promise<void> {
    const current = /^(?!false$).+/;
    await this.expectOnlyItem(
      item,
      link =>
        expect(
          link,
          `"${item}" should be announced as current`,
        ).toHaveAttribute('aria-current', current),
      link =>
        expect(link, `Only "${item}" should be current`).not.toHaveAttribute(
          'aria-current',
          current,
        ),
    );
  }

  /**
   * Asserts the drawer toggle is hidden — wide screens use the header menu.
   *
   * @returns {Promise<void>} Resolves once the toggle is hidden.
   */
  async expectDrawerToggleHidden(): Promise<void> {
    await expect(
      this.drawerToggleImage,
      'Drawer toggle should be hidden',
    ).toBeHidden();
  }

  /**
   * Asserts the drawer toggle is shown.
   *
   * @returns {Promise<void>} Resolves once the toggle is visible.
   */
  async expectDrawerToggleShown(): Promise<void> {
    await expect(
      this.drawerToggleImage,
      'Drawer toggle should be shown',
    ).toBeVisible();
  }

  /**
   * Asserts the keyboard focus is on the drawer's close button.
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Close menu`.
   * @returns {Promise<void>} Resolves once that button is focused.
   */
  async expectFocusOnClose(name: string): Promise<void> {
    await expect(
      this.drawer.getByRole('button', { name, exact: true }),
      `"${name}" should be focused`,
    ).toBeFocused();
  }

  /**
   * Asserts the open drawer's close button has this name (it follows the page's language).
   *
   * @param {string} name - The expected accessible name, e.g. `Close menu`.
   * @returns {Promise<void>} Resolves once that button is visible in the drawer.
   */
  async expectCloseButtonNamed(name: string): Promise<void> {
    await expect(
      this.drawer.getByRole('button', { name, exact: true }),
      `Drawer close button "${name}"`,
    ).toBeVisible();
  }

  /**
   * Asserts the drawer shows exactly these items, in this order (it follows the page's language).
   *
   * @param {readonly string[]} items - Item texts in the page's language (the drawer capitalises
   *   them with CSS only).
   * @returns {Promise<void>} Resolves once the drawer's links match `items`.
   */
  async expectDrawerItems(items: readonly string[]): Promise<void> {
    await expect(
      this.drawerNavigation.getByRole('link'),
      'Drawer items',
    ).toHaveText([...items]);
  }

  /**
   * Asserts the keyboard focus is on the drawer toggle ("Open menu").
   *
   * @returns {Promise<void>} Resolves once the toggle is focused.
   */
  async expectFocusOnToggle(): Promise<void> {
    await expect(
      this.drawerToggleButton,
      '"Open menu" should be focused',
    ).toBeFocused();
  }

  /**
   * Asserts the toggle tells whether the drawer is open (`aria-expanded`).
   *
   * @param {boolean} expanded - Whether the drawer should be reported open.
   * @returns {Promise<void>} Resolves once `aria-expanded` is `"true"` / `"false"`.
   */
  async expectToggleExpanded(expanded: boolean): Promise<void> {
    await expect(
      this.drawerToggleButton,
      'Drawer toggle state',
    ).toHaveAttribute('aria-expanded', String(expanded));
  }

  /**
   * Presses Escape.
   *
   * @returns {Promise<void>} Resolves once Escape is pressed.
   */
  async closeDrawerWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  /**
   * Activates the drawer's close button from the keyboard (Enter).
   *
   * @param {string} name - Its accessible name in the page's language, e.g. `Close menu`.
   * @returns {Promise<void>} Resolves once Enter is pressed on that button.
   */
  async closeDrawerWithCloseButton(name: string): Promise<void> {
    await this.drawer.getByRole('button', { name, exact: true }).press('Enter');
  }

  /**
   * Walks Tab, then Shift+Tab, {@link DRAWER_TAB_WALK} times each from the open drawer and asserts
   * the focus never lands on a page control outside it. Passing through the browser's own controls
   * (focus on `body`, as `inert` on the page allows) is fine — `specs/navigation.md` 1.4, Q-3.
   *
   * @returns {Promise<void>} Resolves once no stop was outside the drawer and some were inside.
   */
  async expectFocusTrappedInDrawer(): Promise<void> {
    await this.expectDrawerOpen();
    const outside: string[] = [];
    let inside = 0;
    for (const key of ['Tab', 'Shift+Tab'])
      for (let stop = 0; stop < DRAWER_TAB_WALK; stop++) {
        await this.page.keyboard.press(key);
        const focus = await this.focusStop();
        if (focus.inDrawer) inside++;
        else if (focus.onPage) outside.push(`${key}: ${focus.label}`);
      }
    expect(
      outside,
      'The focus should not reach the page behind the open drawer',
    ).toEqual([]);
    expect(inside, 'The focus should move through the drawer').toBeGreaterThan(
      0,
    );
  }

  /**
   * From the top of the page, presses Tab once per name and asserts each focused control has that
   * accessible name and draws a keyboard focus indicator: it matches `:focus-visible` and has an
   * outline (not `none`, wider than 0) or a box shadow.
   *
   * @param {readonly (string | RegExp)[]} names - Accessible names (or patterns) in the expected
   *   Tab order.
   * @returns {Promise<void>} Resolves once every Tab stop matched.
   */
  async expectTabOrder(names: readonly (string | RegExp)[]): Promise<void> {
    const focused = this.page.locator(':focus');
    for (const name of names) {
      await this.page.keyboard.press('Tab');
      await expect(focused, `Tab stop "${name}"`).toHaveAccessibleName(name);
      await expect(
        focused,
        `Tab stop "${name}" should show focus`,
      ).toBeInViewport();
      const indicator = await focused.evaluate(el => {
        const style = getComputedStyle(el);
        const outline =
          style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        return (
          el.matches(':focus-visible') &&
          (outline || style.boxShadow !== 'none')
        );
      });
      expect(
        indicator,
        `Tab stop "${name}" should draw a focus indicator`,
      ).toBe(true);
    }
  }

  /**
   * Reaches a header-menu item with Tab from the top of the page and presses Enter on it.
   *
   * @param {string} item - Item text in the page's language.
   * @returns {Promise<void>} Resolves once Enter is pressed on the focused item.
   */
  async goToWithKeyboard(item: string): Promise<void> {
    const link = this.headerNavigation.getByRole('link', {
      name: item,
      exact: true,
    });
    for (let stop = 0; stop < MAX_TAB_STOPS_TO_MENU_ITEM; stop++) {
      await this.page.keyboard.press('Tab');
      if (await link.evaluate(el => el === document.activeElement)) break;
    }
    await expect(link, `"${item}" should be reachable with Tab`).toBeFocused();
    await this.page.keyboard.press('Enter');
  }

  /** Where the keyboard focus is now: its label, whether it is in the drawer, whether on the page. */
  private async focusStop(): Promise<FocusStop> {
    return this.page.evaluate(drawer => {
      const el = document.activeElement;
      return {
        label: `${el?.tagName ?? '?'} "${(el?.textContent ?? '').trim().slice(0, 20)}"`,
        inDrawer: Boolean(el?.closest(drawer)),
        onPage: Boolean(el) && el !== document.body,
      };
    }, DRAWER);
  }

  /**
   * Asserts the header menu has items, exactly one of them is `item`, and runs one check on it and
   * another on every other item.
   */
  private async expectOnlyItem(
    item: string,
    onItem: (link: Locator) => Promise<void>,
    onOthers: (link: Locator) => Promise<void>,
  ): Promise<void> {
    const links = this.headerNavigation.getByRole('link');
    await expect(links, 'Header menu items').not.toHaveCount(0);
    let matched = 0;
    for (const link of await links.all()) {
      if ((await link.textContent())?.trim() === item) {
        matched++;
        await onItem(link);
      } else await onOthers(link);
    }
    expect(matched, `Header menu item "${item}"`).toBe(1);
  }
}
