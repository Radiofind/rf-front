import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { HeaderPage } from '../pages/header.page';
import { SettingsPage } from '../pages/settings.page';

import type { APIResponse, Page } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const GENERAL_SETTINGS_URL: string = `${API_URL}/users/me/settings/general`;

const DEFAULT_SETTINGS: Record<string, unknown> = {
  language: 'EN',
  radioMode: true,
  profileVisibility: 'EVERYONE',
  notificationsEnabled: true,
  audioQuality: 'HIGH',
  accentColor: 'VIOLET',
};

const CUSTOM_SETTINGS: Record<string, unknown> = {
  language: 'DE',
  radioMode: false,
  profileVisibility: 'ONLY_ME',
  notificationsEnabled: false,
  audioQuality: 'LOW',
  accentColor: 'OCEAN',
};

const bearer = (token: string): Record<string, string> => ({ Authorization: `Bearer ${token}` });

const waitForSave = (page: Page): Promise<unknown> =>
  page.waitForResponse(
    (response) =>
      response.url().endsWith('/users/me/settings/general') &&
      response.request().method() === 'PUT',
  );

test.describe('settings', () => {
  test.describe('GET /users/me/settings/general', () => {
    test('returns the defaults to a user who never saved settings', async ({ request, user }) => {
      const response: APIResponse = await request.get(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(DEFAULT_SETTINGS);
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: APIResponse = await request.get(GENERAL_SETTINGS_URL);

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('PUT /users/me/settings/general', () => {
    test('stores the settings and returns them', async ({ request, user }) => {
      const saved: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: CUSTOM_SETTINGS,
      });

      expect(saved.status()).toBe(200);
      expect(await saved.json()).toEqual(CUSTOM_SETTINGS);

      const read: APIResponse = await request.get(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
      });

      expect(await read.json()).toEqual(CUSTOM_SETTINGS);
    });

    test('overwrites previously saved settings', async ({ request, user }) => {
      await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: CUSTOM_SETTINGS,
      });

      const response: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: { ...CUSTOM_SETTINGS, accentColor: 'PLUM' },
      });

      expect(((await response.json()) as { accentColor: string }).accentColor).toBe('PLUM');
    });

    test('keeps the settings of different users apart', async ({ request, user }) => {
      const otherUser: ITestUser = await registerUser();

      await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: CUSTOM_SETTINGS,
      });

      const response: APIResponse = await request.get(GENERAL_SETTINGS_URL, {
        headers: bearer(otherUser.token),
      });

      expect(await response.json()).toEqual(DEFAULT_SETTINGS);
    });

    test('rejects an unknown option', async ({ request, user }) => {
      const response: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: { ...CUSTOM_SETTINGS, language: 'XX' },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects an incomplete settings object', async ({ request, user }) => {
      const response: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: { language: 'EN' },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
        data: CUSTOM_SETTINGS,
      });

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('in the application shell', () => {
    test('blocks the settings page for an anonymous visitor', async ({ page }) => {
      await page.goto('/settings/general');

      await expect(page).toHaveURL(/\/auth\/login$/);
    });

    test('opens the general settings from the account menu', async ({ authenticatedPage }) => {
      const header: HeaderPage = new HeaderPage(authenticatedPage);
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/my-uploads');

      await header.profileButton.click();
      await header.menuItem('Settings').click();

      await expect(authenticatedPage).toHaveURL(/\/settings\/general$/);
      await expect(settings.section('General')).toHaveAttribute('aria-current', 'page');
    });

    test('redirects the bare settings url to the general section', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/settings');

      await expect(authenticatedPage).toHaveURL(/\/settings\/general$/);
    });

    test('switches to the account section', async ({ authenticatedPage }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/settings/general');
      await settings.section('Account').click();

      await expect(authenticatedPage).toHaveURL(/\/settings\/account$/);
      await expect(authenticatedPage.locator('app-account-settings-page')).toBeAttached();
    });

    test('shows the stored settings', async ({ authenticatedPage, request, user }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await request.put(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
        data: CUSTOM_SETTINGS,
      });

      await authenticatedPage.goto('/settings/general');

      await expect(settings.language).toHaveValue('DE');
      await expect(settings.radioMode).not.toBeChecked();
      await expect(settings.profileVisibility).toHaveValue('ONLY_ME');
      await expect(settings.notifications).not.toBeChecked();
      await expect(settings.audioQuality).toHaveValue('LOW');
      await expect(settings.accentColor('Ocean')).toBeChecked();
    });

    test('saves every change and keeps it after a reload', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/settings/general');
      await expect(settings.language).toBeEnabled();

      let saved: Promise<unknown> = waitForSave(authenticatedPage);
      await settings.language.selectOption('FR');
      await saved;

      saved = waitForSave(authenticatedPage);
      await settings.radioMode.click();
      await saved;

      saved = waitForSave(authenticatedPage);
      await settings.profileVisibility.selectOption('FOLLOWERS');
      await saved;

      saved = waitForSave(authenticatedPage);
      await settings.notifications.click();
      await saved;

      saved = waitForSave(authenticatedPage);
      await settings.audioQuality.selectOption('NORMAL');
      await saved;

      saved = waitForSave(authenticatedPage);
      await settings.accentColor('Plum').click();
      await saved;

      await expect(authenticatedPage.getByText('Settings saved').first()).toBeVisible();

      const response: APIResponse = await request.get(GENERAL_SETTINGS_URL, {
        headers: bearer(user.token),
      });

      expect(await response.json()).toEqual({
        language: 'FR',
        radioMode: false,
        profileVisibility: 'FOLLOWERS',
        notificationsEnabled: false,
        audioQuality: 'NORMAL',
        accentColor: 'PLUM',
      });

      await authenticatedPage.reload();

      await expect(settings.language).toHaveValue('FR');
      await expect(settings.accentColor('Plum')).toBeChecked();
    });

    test('applies the accent color across the whole app', async ({ authenticatedPage }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/settings/general');
      await expect(settings.language).toBeEnabled();

      expect(await settings.cssVariable('--first-gradient-color')).toBe('#6a5cff');

      const saved: Promise<unknown> = waitForSave(authenticatedPage);
      await settings.accentColor('Ocean').click();
      await saved;

      expect(await settings.cssVariable('--first-gradient-color')).toBe('#0ea5e9');

      await authenticatedPage.goto('/my-uploads');

      await expect.poll(() => settings.cssVariable('--first-gradient-color')).toBe('#0ea5e9');
    });

    test('rolls the change back when the save fails', async ({ authenticatedPage }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/settings/general');
      await expect(settings.notifications).toBeEnabled();
      await expect(settings.notifications).toBeChecked();

      await authenticatedPage.route('**/users/me/settings/general', (route) =>
        route.request().method() === 'PUT'
          ? route.fulfill({ status: 500, body: '' })
          : route.continue(),
      );

      await settings.notifications.click();

      await expect(
        authenticatedPage.getByText('Could not save settings. Please try again.'),
      ).toBeVisible();
      await expect(settings.notifications).toBeChecked();
    });

    test('updates the document language', async ({ authenticatedPage }) => {
      const settings: SettingsPage = new SettingsPage(authenticatedPage);

      await authenticatedPage.goto('/settings/general');
      await expect(settings.language).toBeEnabled();

      const saved: Promise<unknown> = waitForSave(authenticatedPage);
      await settings.language.selectOption('IT');
      await saved;

      await expect(authenticatedPage.locator('html')).toHaveAttribute('lang', 'it');
    });
  });
});
