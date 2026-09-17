import { expect, test } from '../fixtures/test';
import { uniqueEmail } from '../fixtures/api';
import { LoginPage } from '../pages/login.page';
import { ForgetPasswordModal } from '../pages/modals';
import { fillWhenHydrated } from '../pages/field';

test.describe('forgot password', () => {
  let loginPage: LoginPage;
  let modal: ForgetPasswordModal;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    modal = new ForgetPasswordModal(page);

    await loginPage.goto();
    await loginPage.forgotPasswordLink.click();
    await modal.title.waitFor();
  });

  test('opens with an empty email and a disabled submit', async () => {
    await expect(modal.email).toHaveValue('');
    await expect(modal.submit).toBeDisabled();
  });

  test('keeps submit disabled for a malformed email', async () => {
    await fillWhenHydrated(modal.email, 'not-an-email');

    await expect(modal.submit).toBeDisabled();
  });

  test('enables submit for a valid email', async () => {
    await fillWhenHydrated(modal.email, 'ada@example.com');

    await expect(modal.submit).toBeEnabled();
  });

  test('confirms the request and closes', async ({ page }) => {
    await fillWhenHydrated(modal.email, uniqueEmail('nobody'));
    await modal.submit.click();

    await expect(page.locator('.snackbar__text')).toHaveText('Email sent successfully');
    await expect(modal.root).toBeHidden();
  });
});
