import { expect, test } from '../fixtures/test';
import { uniqueEmail } from '../fixtures/api';
import { LoginPage } from '../pages/login.page';
import { ForgetPasswordModal } from '../pages/modals';

test.describe('login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('renders the form with both fields empty', async () => {
    await expect(loginPage.email).toHaveValue('');
    await expect(loginPage.password).toHaveValue('');
    await expect(loginPage.submit).toBeDisabled();
  });

  test('keeps submit disabled until the form is valid', async () => {
    await loginPage.email.fill('ada@example.com');
    await expect(loginPage.submit).toBeDisabled();

    await loginPage.password.fill('Passw0rd!');
    await expect(loginPage.submit).toBeEnabled();
  });

  test('reports a required email once the field was touched', async () => {
    await loginPage.emailField.touchAndClear();

    await expect(loginPage.emailField.errors).toHaveText(['Field is required']);
  });

  test('reports a malformed email', async () => {
    await loginPage.email.fill('not-an-email');
    await loginPage.email.blur();

    await expect(loginPage.emailField.errors).toHaveText(['Invalid email']);
  });

  test('clears the email error once it becomes valid', async () => {
    await loginPage.email.fill('not-an-email');
    await loginPage.email.blur();
    await expect(loginPage.emailField.errors).toHaveText(['Invalid email']);

    await loginPage.email.fill('ada@example.com');

    await expect(loginPage.emailField.errors).toHaveCount(0);
  });

  test('toggles the password between hidden and visible', async () => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');

    await loginPage.passwordField.actionButton.click();
    await expect(loginPage.password).toHaveAttribute('type', 'text');

    await loginPage.passwordField.actionButton.click();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('rejects an unknown account and stays on the page', async ({ page }) => {
    await loginPage.login(uniqueEmail('nobody'), 'Passw0rd!');

    await expect(loginPage.serverError).toHaveText('Invalid login or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('rejects a wrong password for an existing account', async ({ user }) => {
    await loginPage.login(user.email, 'WrongPassw0rd!');

    await expect(loginPage.serverError).toHaveText('Invalid login or password');
  });

  test('opens the forgot-password modal', async ({ page }) => {
    const modal: ForgetPasswordModal = new ForgetPasswordModal(page);

    await loginPage.forgotPasswordLink.click();

    await expect(modal.title).toHaveText('Forgot Your Password?');
  });
});
