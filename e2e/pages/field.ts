import { expect } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

export class Field {
  public readonly control: Locator;
  public readonly wrapper: Locator;
  public readonly errors: Locator;
  public readonly actionButton: Locator;

  public constructor(page: Page, placeholder: string) {
    this.control = page.locator(`[placeholder="${placeholder}"]`);
    this.wrapper = page
      .locator('.field')
      .filter({ has: page.locator(`[placeholder="${placeholder}"]`) });
    this.errors = this.wrapper.locator('.error-message div');
    this.actionButton = this.wrapper.locator('button.action-icon');
  }

  public async fill(value: string): Promise<void> {
    await fillWhenHydrated(this.control, value);
  }

  public async touchAndClear(): Promise<void> {
    await this.fill('x');
    await this.fill('');
    await this.control.blur();
  }
}

export const fillWhenHydrated = async (control: Locator, value: string): Promise<void> => {
  await expect(async () => {
    await control.fill(value);
    await expect(control).toHaveValue(value, { timeout: 1_000 });
  }).toPass({ timeout: 20_000 });
};
