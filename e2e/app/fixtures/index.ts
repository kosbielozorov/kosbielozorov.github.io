import { test as base } from '@playwright/test';
import ControllersManager from '../api/controllers/ControllersManager';
import type { HomePage } from '../ui/pages/Home.page';
import type { NotFoundPage } from '../ui/pages/NotFound.page';
import PageManager from '../ui/pages/PageManager';
import type { ResumePage } from '../ui/pages/Resume.page';

export const { expect } = base;

type MyFixtures = {
  pageManager: PageManager;
  controllersManager: ControllersManager;
  /**
   * The home page, already opened (`/`) in the test's context (its `locale`, `viewport`, …). For a
   * test that must set something up before the page loads (a stored language, a fixed clock,
   * watching for console errors) or opens another path, use `pageManager.homePage` and `open()`.
   */
  openedHomePage: HomePage;
  /** The resume page, already opened (`/my-resume`) — see `openedHomePage`. */
  openedResumePage: ResumePage;
  /** The not-found page, already opened (an unknown path) — see `openedHomePage`. */
  openedNotFoundPage: NotFoundPage;
};

export const test = base.extend<MyFixtures>({
  pageManager: async ({ page }, use) => {
    await use(new PageManager(page));
  },
  controllersManager: async ({ request }, use) => {
    await use(new ControllersManager(request));
  },
  openedHomePage: async ({ pageManager: { homePage } }, use) => {
    await homePage.open();
    await use(homePage);
  },
  openedResumePage: async ({ pageManager: { resumePage } }, use) => {
    await resumePage.open();
    await use(resumePage);
  },
  openedNotFoundPage: async ({ pageManager: { notFoundPage } }, use) => {
    await notFoundPage.open();
    await use(notFoundPage);
  },
});

export default { test, expect };
