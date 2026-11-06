import type { Locator, Page } from '@playwright/test';

export class UploadTrackPage {
  public readonly root: Locator;
  public readonly audioInput: Locator;
  public readonly coverInput: Locator;
  public readonly title: Locator;
  public readonly artist: Locator;
  public readonly addGenreButton: Locator;
  public readonly uploadButton: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.root = page.locator('app-upload-track-page');
    this.audioInput = this.root.locator('#upload-track-audio');
    this.coverInput = this.root.locator('#upload-track-cover');
    this.title = this.root.getByPlaceholder('Enter track title...');
    this.artist = this.root.locator('input[name="artist"]');
    this.addGenreButton = this.root.locator('.chips-field__trigger');
    this.uploadButton = this.root.getByRole('button', { name: 'Upload Track' });
  }

  public async addGenre(group: string, genre: string): Promise<void> {
    await this.addGenreButton.click();
    await this.page.locator('.dropdown-menu__item', { hasText: new RegExp(`^${group}$`) }).click();
    await this.page.locator('.dropdown-menu__item', { hasText: new RegExp(`^${genre}$`) }).click();
  }
}
