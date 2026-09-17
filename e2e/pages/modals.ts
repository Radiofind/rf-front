import type { Locator, Page } from '@playwright/test';

export class TwoFactorModal {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly description: Locator;
  public readonly cells: Locator;
  public readonly verify: Locator;
  public readonly resend: Locator;
  public readonly errors: Locator;

  public constructor(page: Page) {
    this.root = page.locator('.two-factor');
    this.title = this.root.locator('.two-factor__title');
    this.description = this.root.locator('.two-factor__description');
    this.cells = this.root.locator('.code-field__cell');
    this.verify = this.root.getByRole('button', { name: 'Verify Code' });
    this.resend = this.root.locator('.two-factor__resend-action');
    this.errors = this.root.locator('.code-field__errors');
  }

  public async enterCode(code: string): Promise<void> {
    await this.cells.first().click();
    await this.cells.first().pressSequentially(code, { delay: 20 });
  }

  public async pasteCode(code: string): Promise<void> {
    await this.cells.first().click();
    await this.cells.first().evaluate((cell, text) => {
      const data: DataTransfer = new DataTransfer();
      data.setData('text', text);
      cell.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    }, code);
  }
}

export class ForgetPasswordModal {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly email: Locator;
  public readonly submit: Locator;

  public constructor(page: Page) {
    this.root = page.locator('.forgot-password');
    this.title = this.root.locator('.forgot-password__title');
    this.email = this.root.getByPlaceholder('you@example.com');
    this.submit = this.root.getByRole('button', { name: 'Send Reset Link' });
  }
}
