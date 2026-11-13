import { test as base } from '@playwright/test';
import ControllersManager from '../api/controllers/ControllersManager';
import PageManager from '../ui/pages/PageManager';

export const { expect } = base;

type MyFixtures = {
  pageManager: PageManager;
  controllersManager: ControllersManager;
};

export const test = base.extend<MyFixtures>({
  pageManager: async ({ page }, use) => {
    await use(new PageManager(page));
  },
  controllersManager: async ({ request }, use) => {
    await use(new ControllersManager(request));
  },
});

export default { test, expect };
