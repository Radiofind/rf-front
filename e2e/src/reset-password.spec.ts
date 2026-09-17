import { expect, test } from '../fixtures/test';
import { ResetPasswordPage } from '../pages/reset-password.page';

test.describe('reset password', () => {
  let resetPage: ResetPasswordPage;

  test.beforeEach(({ page }) => {
    resetPage = new ResetPasswordPage(page);
  });

  test('redirects to not-found when no token is supplied', async ({ page }) => {
    await resetPage.goto();

    await expect(page).toHaveURL(/\/not-found$/);
    await expect(page.locator('.error-code')).toHaveText('404');
  });

  test('redirects to not-found for an unknown token', async ({ page }) => {
    await resetPage.goto('definitely-not-a-valid-reset-token');

    await expect(page).toHaveURL(/\/not-found$/);
    await expect(page.locator('.error-code')).toHaveText('404');
  });

  test('redirects to not-found for an empty token parameter', async ({ page }) => {
    await page.goto('/auth/reset-password?token=');

    await expect(page).toHaveURL(/\/not-found$/);
  });
});
