import type { Locator, Page } from '@playwright/test';

export class ResetPasswordPage {
  public readonly title: Locator;
  public readonly password: Locator;
  public readonly confirmPassword: Locator;
  public readonly submit: Locator;

  public constructor(private readonly page: Page) {
    this.title = page.locator('.reset-password__title');
    this.password = page.getByPlaceholder('Enter your new password');
    this.confirmPassword = page.getByPlaceholder('Confirm your new password');
    this.submit = page.getByRole('button', { name: 'Reset Password' });
  }

  public async goto(token?: string): Promise<void> {
    const query: string = token === undefined ? '' : `?token=${encodeURIComponent(token)}`;
    await this.page.goto(`/auth/reset-password${query}`);
  }
}
