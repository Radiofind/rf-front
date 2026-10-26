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
    this.navigation = page.locator('nav.settings__nav');
    this.language = this.control('settings-language');
    this.radioMode = this.control('settings-radio-mode');
    this.profileVisibility = this.control('settings-profile-visibility');
    this.notifications = this.control('settings-notifications');
    this.audioQuality = this.control('settings-audio-quality');
    this.accentColors = this.control('settings-accent-color');
  }

  public async choose(control: Locator, label: string): Promise<void> {
    await control.click();
    await this.page.getByRole('menuitemradio', { name: label, exact: true }).click();
  }

  public accentColor(value: string): Locator {
    return this.accentColors.locator(`input[value="${value}"]`);
  }

  public title(): Locator {
    return this.page.locator('#general-settings-title');
  }

  public section(label: string): Locator {
    return this.navigation.getByRole('link', { name: label });
  }

  private control(rowId: string): Locator {
    return this.page.locator(`[aria-labelledby^="${rowId}-title"]`);
  }

  public cssVariable(name: string): Promise<string> {
    return this.page.evaluate(
      (property: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
      name,
    );
  }
}
