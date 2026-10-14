import type { Locator, Page } from '@playwright/test';

export class LatestActivityPage {
  public readonly root: Locator;
  public readonly list: Locator;
  public readonly emptyTitle: Locator;
  public readonly emptyDescription: Locator;
  public readonly uploadFirstTrackButton: Locator;

  public constructor(page: Page) {
    this.root = page.getByRole('region', { name: 'Latest Activity' });
    this.list = this.root.locator('.activity__list');
    this.emptyTitle = this.root.locator('.empty__title');
    this.emptyDescription = this.root.locator('.empty__description');
    this.uploadFirstTrackButton = this.root.getByRole('button', {
      name: 'Upload your first track',
    });
  }
}
