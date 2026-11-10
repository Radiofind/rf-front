import type { Locator, Page } from '@playwright/test';

export class MyUploadsPage {
  public readonly root: Locator;
  public readonly rows: Locator;
  public readonly titles: Locator;
  public readonly search: Locator;
  public readonly clearSearchButton: Locator;
  public readonly emptyTitle: Locator;
  public readonly firstUploadTitle: Locator;
  public readonly uploadFirstTrackButton: Locator;
  public readonly range: Locator;
  public readonly radioHint: Locator;
  public readonly playerTitle: Locator;
  public readonly playerPlayButton: Locator;
  public readonly playerSeek: Locator;
  public readonly playerLikeButton: Locator;
  public readonly playerLikeTooltip: Locator;
  public readonly pageSizeSelect: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.root = page.locator('app-my-uploads-page');
    this.rows = this.root.locator('.uploads__row');
    this.titles = this.rows.locator('.uploads__title');
    this.search = this.root.getByRole('searchbox', { name: 'Search by track title or artist' });
    this.clearSearchButton = this.root.getByRole('button', { name: 'Clear search', exact: true });
    this.emptyTitle = this.root.locator('.empty__title');
    this.firstUploadTitle = this.root.locator('.first-upload__title');
    this.uploadFirstTrackButton = this.root.getByRole('button', {
      name: 'Upload your first track',
    });
    this.range = this.root.locator('.my-uploads__range');
    this.radioHint = this.root.locator('.my-uploads__radio-hint');
    this.playerTitle = page.locator('app-audio-player .player__title');
    this.playerPlayButton = page.locator('app-audio-player .player__play');
    this.playerSeek = page.locator('app-audio-player .player__seek');
    this.pageSizeSelect = this.root.getByRole('button', { name: /Per page/ });
    this.playerLikeTooltip = page.getByRole('tooltip');
    this.playerLikeButton = page.locator('app-audio-player').getByRole('button', { name: 'Like' });
  }

  public async choosePageSize(size: string): Promise<void> {
    await this.pageSizeSelect.click();
    await this.page.locator('.dropdown-menu__item', { hasText: new RegExp(`^${size}$`) }).click();
  }

  public async tooltipArrowDistanceFromLike(): Promise<number> {
    const like = await this.playerLikeButton.boundingBox();
    const tooltip = await this.playerLikeTooltip.boundingBox();
    const arrow: number = await this.playerLikeTooltip.evaluate((element: Element) =>
      parseFloat(getComputedStyle(element).getPropertyValue('--tooltip-arrow-x')),
    );

    return Math.abs((tooltip?.x ?? 0) + arrow - ((like?.x ?? 0) + (like?.width ?? 0) / 2));
  }

  public tab(label: string): Locator {
    return this.root.getByRole('button', { name: label, exact: true });
  }

  public sortButton(column: string): Locator {
    return this.root.locator('thead').getByRole('button', { name: column, exact: true });
  }

  public header(column: string): Locator {
    return this.root.locator('thead th', {
      has: this.page.getByRole('button', { name: column, exact: true }),
    });
  }

  public row(title: string): Locator {
    return this.rows.filter({ hasText: title });
  }

  public playButton(title: string): Locator {
    return this.root.getByRole('button', { name: `Play "${title}"` });
  }

  public pauseButton(title: string): Locator {
    return this.root.getByRole('button', { name: `Pause "${title}"` });
  }
}
