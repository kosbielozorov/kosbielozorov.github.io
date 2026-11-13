import type { Page } from '@playwright/test';

/**
 * Root abstract base for the POM hierarchy (`Component` → `BasePage` → pages).
 * All page objects receive Playwright `page` through this constructor.
 */
export abstract class PageHolder {
  constructor(protected readonly page: Page) {}
}
