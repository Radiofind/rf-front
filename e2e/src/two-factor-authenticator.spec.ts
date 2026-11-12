import { expect, test } from '../fixtures/test';
import { API_URL, TOKEN_KEY } from '../fixtures/api';
import { bearer } from '../fixtures/tracks';
import { currentStep, totpAt } from '../fixtures/totp';
import { LoginPage } from '../pages/login.page';
import { TwoFactorModal } from '../pages/modals';

import type { APIRequestContext } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const ENROLLMENT_URL: string = `${API_URL}/users/me/security/two-factor/enrollment`;

interface IEnrolledAuthenticator {
  secret: string;
  confirmedStep: number;
}

const enrollAuthenticator = async (
  request: APIRequestContext,
  user: ITestUser,
): Promise<IEnrolledAuthenticator> => {
  const started = await request.post(ENROLLMENT_URL, {
    headers: bearer(user.token),
    data: { method: 'AUTHENTICATOR', password: user.password },
  });
  const { secret } = (await started.json()) as { secret: string };
  const confirmedStep: number = currentStep();

  const confirmed = await request.post(`${ENROLLMENT_URL}/confirm`, {
    headers: bearer(user.token),
    data: { code: totpAt(secret, confirmedStep) },
  });
  expect(confirmed.ok()).toBe(true);

  return { secret: secret, confirmedStep: confirmedStep };
};

test.describe('two-factor verification with an authenticator app', () => {
  test('asks for the app code and signs in with it', async ({ page, request, user }) => {
    const { secret, confirmedStep } = await enrollAuthenticator(request, user);
    const loginPage: LoginPage = new LoginPage(page);
    const modal: TwoFactorModal = new TwoFactorModal(page);

    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    await expect(modal.description).toContainText('authenticator app');
    await expect(modal.cells).toHaveCount(6);
    await expect(modal.resend).toHaveCount(0);

    await modal.enterCode(totpAt(secret, confirmedStep + 1));
    await modal.verify.click();

    await expect(page).not.toHaveURL(/\/auth\//);
    expect(
      await page.evaluate((key: string) => localStorage.getItem(key), TOKEN_KEY),
    ).not.toBeNull();
  });

  test('rejects the code that was already used to connect the app', async ({
    page,
    request,
    user,
  }) => {
    const { secret, confirmedStep } = await enrollAuthenticator(request, user);
    const loginPage: LoginPage = new LoginPage(page);
    const modal: TwoFactorModal = new TwoFactorModal(page);

    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await modal.enterCode(totpAt(secret, confirmedStep));
    await modal.verify.click();

    await expect(modal.errors).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
