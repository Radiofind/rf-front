import type { Locator, Page } from '@playwright/test';

export class HeaderPage {
  public readonly root: Locator;
  public readonly profileButton: Locator;
  public readonly profileMenu: Locator;

  public constructor(page: Page) {
    this.root = page.locator('header.header');
    this.profileButton = this.root.getByRole('button', { name: 'Profile', exact: true });
    this.profileMenu = page.getByRole('menu', { name: 'Account menu' });
  }

  // The icon glyph is part of the accessible name, so match on the visible label instead.
  public menuItem(label: string): Locator {
    return this.profileMenu.getByRole('menuitem').filter({
      has: this.profileMenu.page().locator('.header-menu-item-label', { hasText: label }),
    });
  }
}
