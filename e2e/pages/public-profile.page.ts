import type { Locator, Page } from '@playwright/test';

export class PublicProfilePage {
  public readonly name: Locator;
  public readonly followButton: Locator;
  public readonly stats: Locator;
  public readonly tracks: Locator;
  public readonly trackNames: Locator;
  public readonly restricted: Locator;
  public readonly emptyTitle: Locator;
  public readonly editButton: Locator;

  public constructor(page: Page) {
    const root: Locator = page.locator('app-user-profile-page');

    this.name = root.locator('.hero__name');
    this.followButton = root.locator('app-follow-button button');
    this.stats = root.locator('app-profile-stats');
    this.tracks = root.getByRole('region', { name: 'Tracks' });
    this.trackNames = this.tracks.locator('.tracks__name');
    this.restricted = root.locator('app-profile-restricted');
    this.emptyTitle = root.locator('.empty__title');
    this.editButton = root.getByRole('button', { name: 'Edit Profile' });
  }

  public stat(label: string): Locator {
    return this.stats.locator('.stats__item', { hasText: label }).locator('.stats__value');
  }
}
