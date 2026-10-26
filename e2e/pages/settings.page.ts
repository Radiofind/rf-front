import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
  public readonly root: Locator;
  public readonly navigation: Locator;
  public readonly language: Locator;
  public readonly radioMode: Locator;
  public readonly profileVisibility: Locator;
  public readonly notifications: Locator;
  public readonly audioQuality: Locator;
  public readonly accentColors: Locator;

  public constructor(private readonly page: Page) {
    this.root = page.locator('app-settings-page');
    this.navigation = page.getByRole('navigation', { name: 'Settings sections' });
    this.language = page.getByRole('button', { name: 'Language' });
    this.radioMode = page.getByRole('switch', { name: 'Radio-mode' });
    this.profileVisibility = page.getByRole('button', { name: 'Profile Visibility' });
    this.notifications = page.getByRole('switch', { name: 'Notifications' });
    this.audioQuality = page.getByRole('button', { name: 'Audio Quality' });
    this.accentColors = page.getByRole('radiogroup', { name: 'Accent Color' });
  }

  public async choose(control: Locator, label: string): Promise<void> {
    await control.click();
    await this.page.getByRole('menuitemradio', { name: label, exact: true }).click();
  }

  public accentColor(label: string): Locator {
    return this.accentColors.getByRole('radio', { name: label, exact: true });
  }

  public section(label: string): Locator {
    return this.navigation.getByRole('link', { name: label });
  }

  public cssVariable(name: string): Promise<string> {
    return this.page.evaluate(
      (property: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
      name,
    );
  }
}
