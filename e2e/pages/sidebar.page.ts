import type { Locator, Page } from '@playwright/test';

export class SidebarPage {
  public readonly root: Locator;
  public readonly userCard: Locator;
  public readonly userName: Locator;
  public readonly userEmail: Locator;

  public constructor(page: Page) {
    this.root = page.locator('aside.sidebar');
    this.userCard = this.root.locator('button.sidebar__user');
    this.userName = this.root.locator('.sidebar__user-name');
    this.userEmail = this.root.locator('.sidebar__user-email');
  }

  public item(label: string): Locator {
    return this.root.locator('.sidebar__item', { hasText: label });
  }
}
