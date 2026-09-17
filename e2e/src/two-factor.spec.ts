import { expect, test } from '../fixtures/test';
import { LoginPage } from '../pages/login.page';
import { TwoFactorModal } from '../pages/modals';

test.describe('two-factor verification', () => {
  let loginPage: LoginPage;
  let modal: TwoFactorModal;

  test.beforeEach(async ({ page, user }) => {
    loginPage = new LoginPage(page);
    modal = new TwoFactorModal(page);

    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await modal.title.waitFor();
  });

  test('opens with the account address and an empty code', async ({ user }) => {
    await expect(modal.title).toHaveText('Two-Factor Authentication');
    await expect(modal.description).toContainText(user.email);
    await expect(modal.cells).toHaveCount(6);

    for (let index = 0; index < 6; index++) {
      await expect(modal.cells.nth(index)).toHaveValue('');
    }
  });

  test('keeps verification disabled until all six digits are entered', async () => {
    await expect(modal.verify).toBeDisabled();

    await modal.enterCode('12345');
    await expect(modal.verify).toBeDisabled();

    await modal.cells.nth(5).fill('6');
    await expect(modal.verify).toBeEnabled();
  });

  test('spreads a pasted code across the cells', async () => {
    await modal.pasteCode('13-57 90');

    await expect(modal.cells.nth(0)).toHaveValue('1');
    await expect(modal.cells.nth(1)).toHaveValue('3');
    await expect(modal.cells.nth(4)).toHaveValue('9');
    await expect(modal.cells.nth(5)).toHaveValue('0');
    await expect(modal.verify).toBeEnabled();
  });

  test('rejects a wrong code and stays open', async ({ page }) => {
    await modal.enterCode('000000');
    await modal.verify.click();

    await expect(modal.errors).toHaveText('Invalid verification code, please try again');
    await expect(modal.root).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('blocks resending while the countdown runs', async () => {
    await expect(modal.resend).toBeDisabled();
    await expect(modal.resend).toContainText(/\(00:\d{2}\)/);
  });
});
