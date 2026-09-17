import { expect, test } from '../fixtures/test';

test.describe('routing and guards', () => {
  test('sends an anonymous visitor from the root to the login page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.locator('h2.form-content__title')).toHaveText('Log In');
  });

  test('blocks the uploads page for an anonymous visitor', async ({ page }) => {
    await page.goto('/my-uploads');

    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('rejects a malformed token like a missing one', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('radiofind_token', 'not-a-jwt');
    });

    await page.goto('/my-uploads');

    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('lets a signed-in user open the uploads page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/my-uploads');

    await expect(authenticatedPage).toHaveURL(/\/my-uploads$/);
  });

  test('sends a signed-in user away from the login page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/auth/login');

    await expect(authenticatedPage).toHaveURL(/\/my-uploads$/);
  });

  test('keeps the register page reachable while signed in', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/auth/register');

    await expect(authenticatedPage).toHaveURL(/\/auth\/register$/);
    await expect(authenticatedPage.locator('h2.form-content__title')).toHaveText('Create Your Account');
  });

  test.describe('error pages', () => {
    const cases: readonly { path: string; code: string; title: string }[] = [
      { path: '/not-found', code: '404', title: 'Found' },
      { path: '/forbidden', code: '403', title: 'Denied' },
      { path: '/server-error', code: '500', title: 'Wrong' },
      { path: '/there-is-no-such-page', code: '404', title: 'Found' },
    ];

    for (const { path, code, title } of cases) {
      test(`renders ${code} for ${path}`, async ({ page }) => {
        await page.goto(path);

        await expect(page.locator('.error-code')).toHaveText(code);
        await expect(page.locator('.error-title span')).toHaveText(title);
      });
    }

    test('returns home from the error page', async ({ page }) => {
      await page.goto('/there-is-no-such-page');

      await page.getByRole('button', { name: 'Back to Home' }).click();

      await expect(page).toHaveURL(/\/auth\/login$/);
    });
  });

  test('switches between the login and register pages', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/auth\/register$/);
    await expect(page.locator('h2.form-content__title')).toHaveText('Create Your Account');

    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.locator('h2.form-content__title')).toHaveText('Log In');
  });
});
