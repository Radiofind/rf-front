import type { Locator, Page } from '@playwright/test';

export class MediaLibraryPage {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly rows: Locator;
  public readonly search: Locator;
  public readonly emptyTitle: Locator;
  public readonly emptySteps: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-media-library-page');
    this.title = this.root.getByRole('heading', { level: 1 });
    this.rows = this.root.locator('.tracks-table__row');
    this.search = this.root.getByRole('searchbox', { name: 'Search by track title or artist' });
    this.emptyTitle = this.root.locator('.empty-library__title');
    this.emptySteps = this.root.locator('.empty-library__step-title');
  }
}
