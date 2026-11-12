import type { Locator, Page } from '@playwright/test';

export class AccountSettingsPage {
  public readonly twoFactor: Locator;
  public readonly backupCodes: Locator;
  public readonly deleteAccount: Locator;
  public readonly methodModal: MethodModal;
  public readonly passwordModal: PasswordModal;
  public readonly backupCodesModal: Locator;

  public constructor(private readonly page: Page) {
    this.twoFactor = this.row('settings-two-factor');
    this.backupCodes = this.row('settings-backup-codes');
    this.deleteAccount = this.row('settings-delete-account');
    this.methodModal = new MethodModal(page);
    this.passwordModal = new PasswordModal(page);
    this.backupCodesModal = page.locator('app-backup-codes-modal');
  }

  public async goto(): Promise<void> {
    await this.page.goto('/settings/account');
    await this.twoFactor.locator('.account-settings__badge').waitFor();
  }

  public row(rowId: string): Locator {
    return this.page.locator('app-settings-row').filter({
      has: this.page.locator(`#${rowId}-title`),
    });
  }

  public toggle(rowId: string): Locator {
    return this.row(rowId).getByRole('switch');
  }

  public description(row: Locator): Locator {
    return row.locator('.row__description');
  }
}

export class MethodModal {
  public readonly root: Locator;
  public readonly password: Locator;
  public readonly continue: Locator;
  public readonly confirm: Locator;
  public readonly secret: Locator;
  public readonly qrCode: Locator;
  public readonly cells: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-two-factor-method-modal');
    this.password = this.root
      .locator('input[name="current-password"], input[type="password"]')
      .first();
    this.continue = this.root.getByRole('button', { name: 'Continue' });
    this.confirm = this.root.getByRole('button', { name: 'Confirm' });
    this.secret = this.root.locator('.method-modal__secret');
    this.qrCode = this.root.locator('.method-modal__qr');
    this.cells = this.root.locator('.code-field__cell');
  }

  public method(label: string): Locator {
    return this.root.getByRole('radio', { name: label });
  }

  public async enterCode(code: string): Promise<void> {
    await this.cells.first().click();
    await this.cells.first().pressSequentially(code, { delay: 20 });
  }
}

export class PasswordModal {
  public readonly root: Locator;
  public readonly password: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-password-confirm-modal');
    this.password = this.root.locator('input[type="password"]');
  }

  public button(name: string): Locator {
    return this.root.getByRole('button', { name: name, exact: true });
  }
}
