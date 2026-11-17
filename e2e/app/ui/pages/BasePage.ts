import { expect } from '@playwright/test';
import { Component } from '../components/Base.component';

/** Pixels a scroll must pass before the page counts as scrolled — more than the 96 px header. */
const SCROLLED_PAST = 200;

export abstract class BasePage extends Component {
  /**
   * Path to the page can be relative to the baseUrl defined in playwright.config.ts
   * or absolute (on your own risk).
   */
  public abstract pagePath: string;

  /**
   * Opens the page in the browser and asserts it loaded.
   *
   * @param {string} [path] - Optional path to navigate to instead of `pagePath`.
   * @returns {Promise<void>} Resolves once navigation completes and `expectLoaded()` passes.
   */
  async open(path?: string) {
    await this.page.goto(path ?? this.pagePath);
    await this.expectLoaded();
  }

  /**
   * Asserts the browser is on this page — its URL equals `pagePath` (resolved against `baseURL`).
   * Unlike `expectLoaded()`, which checks visible elements, this proves where the user is.
   *
   * @param {string} [message] - Optional custom assertion message.
   * @returns {Promise<void>} Resolves once the current URL equals this page's `pagePath`.
   */
  async expectOpened(message = `Should be on ${this.pagePath}`): Promise<void> {
    await expect(this.page, message).toHaveURL(this.pagePath);
  }

  /**
   * Characterization scaffolding only (`tests/characterization/`): pins the page's current
   * structure and texts as an ARIA snapshot. Not an oracle — a red result means "behaviour
   * changed", and only a human updates the snapshot (`ai/instructions/02-architecture.md` →
   * **Characterization scaffolding**).
   *
   * @param {string} name - Snapshot name, unique within the test file (stored as `<name>.aria.yml`).
   * @returns {Promise<void>} Resolves once the page body matches the stored snapshot.
   */
  async expectAriaSnapshot(name: string): Promise<void> {
    await expect(this.page.locator('body')).toMatchAriaSnapshot({
      name: `${name}.aria.yml`,
    });
  }

  /**
   * Asserts the current URL, resolved against `baseURL` — for pages reached by a link, where
   * `expectOpened()` (which checks `pagePath`) does not apply.
   *
   * @param {string} path - Expected path, hash included (e.g. `/#home`).
   * @returns {Promise<void>} Resolves once the URL equals `path` resolved against `baseURL`.
   */
  async expectUrl(path: string): Promise<void> {
    await expect(this.page, `Should be on ${path}`).toHaveURL(path);
  }

  /**
   * Scrolls the page down with the mouse wheel and waits until it has moved past the header's
   * height (or `distance`, if smaller, or as far as a short page allows) and the smooth scroll has
   * ended (the browser's `scrollend`; at most 2 s — when nothing scrolls, that is a 2 s wait).
   *
   * @param {number} [distance=1500] - Pixels to scroll.
   * @returns {Promise<void>} Resolves once the page has scrolled by
   *   `min(distance, SCROLLED_PAST, room)` and stopped moving.
   */
  async scrollDown(distance = 1500): Promise<void> {
    /* Smooth scrolling keeps animating after scrollY stops changing (on a short page it sits at the
     * bottom while the animation runs): wait for the browser's `scrollend`, or 2 s at most. */
    const ended = this.page.evaluate(
      () =>
        new Promise<void>(resolve => {
          window.addEventListener('scrollend', () => resolve(), { once: true });
          setTimeout(resolve, 2000);
        }),
    );
    await this.page.mouse.wheel(0, distance);
    await ended;
    await expect
      .poll(
        () =>
          this.page.evaluate(
            past => {
              const room =
                document.documentElement.scrollHeight - window.innerHeight;
              return (
                window.scrollY > 0 && window.scrollY >= Math.min(past, room)
              );
            },
            Math.min(distance, SCROLLED_PAST),
          ),
        { message: 'The page should have scrolled down' },
      )
      .toBe(true);
  }

  /**
   * Asserts the page is scrolled to its top (pages scroll there smoothly).
   *
   * @returns {Promise<void>} Resolves once `window.scrollY` is 0.
   */
  async expectAtTop(): Promise<void> {
    await expect
      .poll(() => this.page.evaluate(() => window.scrollY), {
        message: 'The page should be scrolled to its top',
      })
      .toBe(0);
  }

  /**
   * Asserts the document's language — `<html lang>`.
   *
   * @param {'en' | 'uk'} language - The expected language code.
   * @returns {Promise<void>} Resolves once `<html lang>` is that code.
   */
  async expectLanguage(language: 'en' | 'uk'): Promise<void> {
    await expect(
      this.page.locator('html'),
      'Document language',
    ).toHaveAttribute('lang', language);
  }

  /**
   * Asserts the exact value stored for the next visit (`localStorage.i18nextLng`).
   *
   * @param {string} value - The expected value, e.g. `uk` after a switch or `uk-UA` after a first
   *   visit from a Ukrainian browser.
   * @returns {Promise<void>} Resolves once the stored value is `value`.
   */
  async expectStoredLanguage(value: string): Promise<void> {
    await expect
      .poll(
        () => this.page.evaluate(() => localStorage.getItem('i18nextLng')),
        {
          message: 'Stored language',
        },
      )
      .toBe(value);
  }

  /**
   * Asserts the document title.
   *
   * @param {string} title - The whole expected title.
   * @returns {Promise<void>} Resolves once the title is `title`.
   */
  async expectTitle(title: string): Promise<void> {
    await expect(this.page, 'Document title').toHaveTitle(title);
  }

  /**
   * Stores a language choice before the next page load, as if chosen on an earlier visit. Applied
   * once per tab, so a later switch is not overwritten.
   *
   * @param {string} value - The value for `localStorage.i18nextLng`, e.g. `uk`.
   * @returns {Promise<void>} Resolves once the seed is registered for the next load.
   */
  async storeLanguageBeforeLoad(value: string): Promise<void> {
    await this.page.addInitScript(stored => {
      if (sessionStorage.getItem('language-seeded')) return;
      localStorage.setItem('i18nextLng', stored);
      sessionStorage.setItem('language-seeded', '1');
    }, value);
  }

  /**
   * Fixes the browser's clock to a date before the page loads, so a date the page shows can be
   * checked against a known value.
   *
   * @param {Date} date - The date the page should see as "now".
   * @returns {Promise<void>} Resolves once the clock is fixed for this page.
   */
  async fixClockAt(date: Date): Promise<void> {
    await this.page.clock.setFixedTime(date);
  }

  /**
   * Asserts the browser reports that the visitor asked for reduced motion.
   *
   * @returns {Promise<void>} Resolves once `prefers-reduced-motion: reduce` matches.
   */
  async expectReducedMotion(): Promise<void> {
    expect(
      await this.page.evaluate(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
      'Reduced motion should be requested',
    ).toBe(true);
  }

  /**
   * Presses the browser's Back.
   *
   * @returns {Promise<void>} Resolves once the browser has navigated back (a same-document step in
   *   this single-page app, or a page load).
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Asserts the page is no wider than the viewport — nothing makes it scroll sideways.
   *
   * @returns {Promise<void>} Resolves once the document width fits the viewport width.
   */
  async expectNoHorizontalScroll(): Promise<void> {
    await expect
      .poll(
        () =>
          this.page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        { message: 'The page should not scroll horizontally' },
      )
      .toBeLessThanOrEqual(0);
  }

  /**
   * Starts collecting console errors, uncaught page errors, failed requests and HTTP error
   * responses. Call it before `open()` so the load itself is watched.
   *
   * @returns {{ expectNone: () => Promise<void> }} Handle whose `expectNone()` waits for the `load`
   *   event and asserts nothing was collected.
   */
  watchProblems(): { expectNone: () => Promise<void> } {
    const problems: string[] = [];
    this.page.on('console', message => {
      if (message.type() === 'error')
        problems.push(`console: ${message.text()}`);
    });
    this.page.on('pageerror', error =>
      problems.push(`page error: ${error.message}`),
    );
    this.page.on('requestfailed', request =>
      problems.push(
        `failed: ${request.url()} ${request.failure()?.errorText ?? ''}`,
      ),
    );
    this.page.on('response', response => {
      if (response.status() >= 400)
        problems.push(`${response.status()}: ${response.url()}`);
    });
    return {
      expectNone: async () => {
        /* Problems after `load` are not seen (lint forbids `networkidle`) — a known limit. */
        await this.page.waitForLoadState('load');
        expect(problems, 'No console errors or failed requests').toEqual([]);
      },
    };
  }

  /**
   * Marks the current document so `expectSameDocument()` can prove no reload happened since.
   *
   * @returns {Promise<void>} Resolves once the marker is set on `window`.
   */
  async markDocument(): Promise<void> {
    await this.page.evaluate(() => {
      (window as Window & { __sameDocument?: boolean }).__sameDocument = true;
    });
  }

  /**
   * Asserts the document marked by `markDocument()` is still loaded — the page was not reloaded.
   *
   * @returns {Promise<void>} Resolves once the marker is found on `window`.
   */
  async expectSameDocument(): Promise<void> {
    const same = await this.page.evaluate(
      () =>
        (window as Window & { __sameDocument?: boolean }).__sameDocument ===
        true,
    );
    expect(same, 'The page should not have been reloaded').toBe(true);
  }
}
