import { test as base, expect } from '@playwright/test';
import { registerUser, TOKEN_KEY } from './api';

import type { Page } from '@playwright/test';
import type { ITestUser } from './api';

interface IFixtures {
  user: ITestUser;
  authenticatedPage: Page;
}

export const test = base.extend<IFixtures>({
  user: async ({}, use) => {
    await use(await registerUser());
  },

  authenticatedPage: async ({ page, user }, use) => {
    const storageEntry: [string, string] = [TOKEN_KEY, user.token];

    await page.addInitScript(([key, token]) => {
      window.localStorage.setItem(key, token);
    }, storageEntry);

    await use(page);
  },
});

export { expect };
