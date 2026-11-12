import { expect, test } from '../fixtures/test';
import { API_URL, registerUser, uniqueEmail } from '../fixtures/api';
import { approveTrack } from '../fixtures/database';
import { latestCode } from '../fixtures/mailpit';
import { currentStep, totpAt } from '../fixtures/totp';
import { bearer, OWN_TRACKS_URL, TRACKS_URL, uploadTrack } from '../fixtures/tracks';
import { AccountSettingsPage } from '../pages/account-settings.page';
import { LoginPage } from '../pages/login.page';
import { TwoFactorModal } from '../pages/modals';

import type { APIRequestContext, APIResponse, Page } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const NOTIFICATION_SETTINGS_URL: string = `${API_URL}/users/me/settings/notifications`;
const NOTIFICATIONS_URL: string = `${API_URL}/users/me/notifications`;
const SECURITY_URL: string = `${API_URL}/users/me/security`;
const CURRENT_USER_URL: string = `${API_URL}/users/me`;

interface INotification {
  type: string;
  track: { title: string } | null;
}

const notificationsOf = async (
  request: APIRequestContext,
  user: ITestUser,
): Promise<INotification[]> => {
  const response: APIResponse = await request.get(NOTIFICATIONS_URL, {
    headers: bearer(user.token),
  });
  return ((await response.json()) as { items: INotification[] }).items;
};

const setNotifications = async (
  request: APIRequestContext,
  user: ITestUser,
  settings: { trackUpdates: boolean; radioUpdates: boolean; likes: boolean },
): Promise<void> => {
  const response: APIResponse = await request.put(NOTIFICATION_SETTINGS_URL, {
    headers: bearer(user.token),
    data: settings,
  });
  expect(response.status()).toBe(200);
};

const approvedTrackOf = async (request: APIRequestContext, owner: ITestUser): Promise<number> => {
  const response: APIResponse = await uploadTrack(request, owner.token, {
    title: 'Midnight Dreams',
    genres: 'GRUNGE',
  });
  expect(response.status()).toBe(201);
  const { id } = (await response.json()) as { id: number };
  approveTrack(id);
  return id;
};

const signInWithEmailCode = async (
  page: Page,
  request: APIRequestContext,
  user: ITestUser,
  mailbox: string,
): Promise<TwoFactorModal> => {
  const loginPage: LoginPage = new LoginPage(page);
  const modal: TwoFactorModal = new TwoFactorModal(page);
  const sentAfter: Date = new Date(Date.now() - 1_000);

  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  await modal.title.waitFor();
  await modal.enterCode(await latestCode(request, mailbox, sentAfter));
  return modal;
};

test.describe('account settings', () => {
  test.describe('notifications', () => {
    test('are all switched on for a new account', async ({ request, user }) => {
      const response: APIResponse = await request.get(NOTIFICATION_SETTINGS_URL, {
        headers: bearer(user.token),
      });

      expect(await response.json()).toEqual({
        trackUpdates: true,
        radioUpdates: true,
        likes: true,
      });
    });

    test('keeps a switched category after a reload', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      const saved = authenticatedPage.waitForResponse(
        (response) =>
          response.url().endsWith('/settings/notifications') &&
          response.request().method() === 'PUT',
      );
      await settings.toggle('settings-radio-updates').click();
      await saved;
      await authenticatedPage.reload();

      await expect(settings.toggle('settings-radio-updates')).not.toBeChecked();
      const response: APIResponse = await request.get(NOTIFICATION_SETTINGS_URL, {
        headers: bearer(user.token),
      });
      expect(await response.json()).toEqual({
        trackUpdates: true,
        radioUpdates: false,
        likes: true,
      });
    });

    test('announce an upload while track updates are on', async ({ request, user }) => {
      await uploadTrack(request, user.token);

      expect((await notificationsOf(request, user)).map((item) => item.type)).toEqual([
        'TRACK_SUBMITTED_FOR_REVIEW',
      ]);
    });

    test('stay silent about an upload once track updates are off', async ({ request, user }) => {
      await setNotifications(request, user, {
        trackUpdates: false,
        radioUpdates: true,
        likes: true,
      });

      await uploadTrack(request, user.token);

      expect(await notificationsOf(request, user)).toEqual([]);
    });

    test('tell the owner about a like from another listener', async ({ request, user }) => {
      const trackId: number = await approvedTrackOf(request, user);
      const fan: ITestUser = await registerUser();

      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(fan.token) });

      expect((await notificationsOf(request, user))[0]?.type).toBe('TRACK_LIKED');
    });

    test('announce repeated likes only once while the first is unread', async ({
      request,
      user,
    }) => {
      const trackId: number = await approvedTrackOf(request, user);
      const fan: ITestUser = await registerUser();
      const otherFan: ITestUser = await registerUser();

      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(fan.token) });
      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, {
        headers: bearer(otherFan.token),
      });

      const likes: INotification[] = (await notificationsOf(request, user)).filter(
        (item) => item.type === 'TRACK_LIKED',
      );
      expect(likes).toHaveLength(1);
    });

    test('stay silent about likes once they are off', async ({ request, user }) => {
      const trackId: number = await approvedTrackOf(request, user);
      const fan: ITestUser = await registerUser();
      await setNotifications(request, user, {
        trackUpdates: true,
        radioUpdates: true,
        likes: false,
      });

      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(fan.token) });

      expect((await notificationsOf(request, user)).map((item) => item.type)).not.toContain(
        'TRACK_LIKED',
      );
    });

    test('ignore a like of the own track', async ({ request, user }) => {
      const trackId: number = await approvedTrackOf(request, user);

      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(user.token) });

      expect((await notificationsOf(request, user)).map((item) => item.type)).not.toContain(
        'TRACK_LIKED',
      );
    });
  });

  test.describe('two-factor method', () => {
    test('uses the email code for a new account', async ({ authenticatedPage }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);

      await settings.goto();

      await expect(settings.description(settings.twoFactor)).toHaveText('Current method: Email');
      await expect(settings.twoFactor.locator('.account-settings__badge')).toHaveText('Enabled');
    });

    test('switches to the authenticator app after the first code', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.twoFactor.getByRole('button', { name: 'Manage' }).click();
      await settings.methodModal.method('Authenticator app').check();
      await settings.methodModal.password.fill(user.password);
      await settings.methodModal.continue.click();
      await expect(settings.methodModal.qrCode).toBeVisible();
      const secret: string = (await settings.methodModal.secret.textContent())!.trim();
      await settings.methodModal.enterCode(totpAt(secret, currentStep()));
      await settings.methodModal.confirm.click();

      await expect(settings.methodModal.root).toBeHidden();
      await expect(settings.description(settings.twoFactor)).toHaveText(
        'Current method: Authenticator app',
      );
      const response: APIResponse = await request.get(SECURITY_URL, {
        headers: bearer(user.token),
      });
      expect(((await response.json()) as { twoFactorMethod: string }).twoFactorMethod).toBe(
        'AUTHENTICATOR',
      );
    });

    test('keeps the current method when the password is wrong', async ({ authenticatedPage }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.twoFactor.getByRole('button', { name: 'Manage' }).click();
      await settings.methodModal.method('Authenticator app').check();
      await settings.methodModal.password.fill('Wrong-Passw0rd!');
      await settings.methodModal.continue.click();

      await expect(settings.methodModal.root).toContainText('The password is incorrect');
      await expect(settings.methodModal.qrCode).toBeHidden();
    });

    test('offers no recovery email while the profile has none', async ({ authenticatedPage }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.twoFactor.getByRole('button', { name: 'Manage' }).click();

      await expect(settings.methodModal.method('Recovery email')).toBeDisabled();
    });

    test('switches to the recovery email and then signs in with its code', async ({
      browser,
      request,
    }) => {
      const recoveryEmail: string = uniqueEmail('recovery');
      const user: ITestUser = await registerUser({ recoveryEmail: recoveryEmail });
      const context = await browser.newContext();
      await context.addInitScript((token: string) => {
        window.localStorage.setItem('radiofind_token', token);
      }, user.token);
      const page: Page = await context.newPage();
      const settings: AccountSettingsPage = new AccountSettingsPage(page);
      await settings.goto();

      await settings.twoFactor.getByRole('button', { name: 'Manage' }).click();
      await settings.methodModal.method('Recovery email').check();
      await settings.methodModal.password.fill(user.password);
      const sentAfter: Date = new Date(Date.now() - 1_000);
      await settings.methodModal.continue.click();
      await expect(settings.methodModal.root).toContainText('Enter the 6-digit code we sent to');
      await settings.methodModal.enterCode(await latestCode(request, recoveryEmail, sentAfter));
      await settings.methodModal.confirm.click();
      await expect(settings.description(settings.twoFactor)).toHaveText(
        'Current method: Recovery email',
      );
      await context.close();

      const loginContext = await browser.newContext();
      const loginPage: Page = await loginContext.newPage();
      const modal: TwoFactorModal = await signInWithEmailCode(
        loginPage,
        request,
        user,
        recoveryEmail,
      );
      await expect(modal.description).toContainText('recovery email');
      await modal.verify.click();

      await expect(loginPage).not.toHaveURL(/\/auth\//);
      await loginContext.close();
    });
  });

  test.describe('backup codes', () => {
    test('are generated once the password is confirmed', async ({ authenticatedPage, user }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.backupCodes.getByRole('button', { name: 'Generate' }).click();
      await settings.passwordModal.password.fill(user.password);
      await settings.passwordModal.button('Generate').click();

      await expect(settings.backupCodesModal.locator('.backup-codes__code')).toHaveCount(10);
      await settings.backupCodesModal
        .getByRole('button', { name: 'I have saved my codes' })
        .click();
      await expect(settings.backupCodes).toContainText('10 unused');
      await expect(settings.backupCodes.getByRole('button', { name: 'Regenerate' })).toBeVisible();
    });

    test('sign in instead of the email code, but only once', async ({ page, request, user }) => {
      const generated: APIResponse = await request.post(`${SECURITY_URL}/backup-codes`, {
        headers: bearer(user.token),
        data: { password: user.password },
      });
      const [code] = ((await generated.json()) as { codes: string[] }).codes;
      const loginPage: LoginPage = new LoginPage(page);
      const modal: TwoFactorModal = new TwoFactorModal(page);

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await modal.switchToBackupCode.click();
      await modal.backupCode.fill(code!);
      await modal.verify.click();
      await expect(page).not.toHaveURL(/\/auth\//);

      await page.evaluate(() => {
        window.localStorage.clear();
      });
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await modal.switchToBackupCode.click();
      await modal.backupCode.fill(code!);
      await modal.verify.click();

      await expect(modal.root).toContainText(
        'This backup code is not valid or has already been used',
      );
    });
  });

  test.describe('delete account', () => {
    test('stays when the password is wrong', async ({ authenticatedPage, request, user }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.deleteAccount.getByRole('button', { name: 'Delete Account' }).click();
      await settings.passwordModal.password.fill('Wrong-Passw0rd!');
      await settings.passwordModal.button('Delete Account').click();

      await expect(settings.passwordModal.root).toContainText('The password is incorrect');
      const response: APIResponse = await request.get(CURRENT_USER_URL, {
        headers: bearer(user.token),
      });
      expect(response.status()).toBe(200);
    });

    test('signs out and the account can no longer be used', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const settings: AccountSettingsPage = new AccountSettingsPage(authenticatedPage);
      await settings.goto();

      await settings.deleteAccount.getByRole('button', { name: 'Delete Account' }).click();
      await settings.passwordModal.password.fill(user.password);
      await settings.passwordModal.button('Delete Account').click();

      await expect(authenticatedPage).toHaveURL(/\/auth\/login$/);
      await expect(
        authenticatedPage.getByText('Your account has been deleted').first(),
      ).toBeVisible();
      const current: APIResponse = await request.get(CURRENT_USER_URL, {
        headers: bearer(user.token),
      });
      expect(current.status()).toBe(401);
      const login: APIResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: user.email, password: user.password },
      });
      expect(login.status()).toBe(401);
    });

    test('takes back the likes the account gave', async ({ request, user }) => {
      const trackId: number = await approvedTrackOf(request, user);
      const fan: ITestUser = await registerUser();
      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(fan.token) });

      const deleted: APIResponse = await request.delete(CURRENT_USER_URL, {
        headers: bearer(fan.token),
        data: { password: fan.password },
      });

      expect(deleted.status()).toBe(204);
      const own: APIResponse = await request.get(OWN_TRACKS_URL, { headers: bearer(user.token) });
      const [track] = ((await own.json()) as { items: { likesCount: number }[] }).items;
      expect(track?.likesCount).toBe(0);
    });

    test('removes the tracks of the account', async ({ request, user }) => {
      const uploaded: APIResponse = await uploadTrack(request, user.token);
      const { id } = (await uploaded.json()) as { id: number };

      await request.delete(CURRENT_USER_URL, {
        headers: bearer(user.token),
        data: { password: user.password },
      });

      const cover: APIResponse = await request.get(`${TRACKS_URL}/${String(id)}/cover`);
      expect(cover.status()).toBe(404);
    });
  });
});
