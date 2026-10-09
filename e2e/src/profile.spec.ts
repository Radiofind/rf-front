import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { HeaderPage } from '../pages/header.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const PROFILE_URL: string = `${API_URL}/users/me/profile`;

const AVATAR_URL: string = `${API_URL}/users/me/avatar`;

const AVATAR_PATH: string = new URL(AVATAR_URL).pathname;

// The smallest valid PNG: a single red pixel.
const PNG_BYTES: Buffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

const ISO_DATE_TIME: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const bearer = (token: string): Record<string, string> => ({ Authorization: `Bearer ${token}` });

const uploadAvatar = (
  request: APIRequestContext,
  token: string,
  file: { name: string; mimeType: string; buffer: Buffer } = {
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: PNG_BYTES,
  },
): Promise<APIResponse> =>
  request.post(AVATAR_URL, { headers: bearer(token), multipart: { file: file } });

test.describe('profile', () => {
  test.describe('GET /users/me/profile', () => {
    test('returns the profile of the signed-in user', async ({ request, user }) => {
      const response: APIResponse = await request.get(PROFILE_URL, { headers: bearer(user.token) });

      expect(response.status()).toBe(200);

      const body = (await response.json()) as Record<string, unknown>;

      expect(body).toMatchObject({
        name: user.name,
        surname: user.surname,
        dateOfBirth: user.dateOfBirth,
        artistType: 'ARTIST',
        artistName: null,
        description: null,
        avatarUrl: null,
      });
      expect(body['registeredAt']).toMatch(ISO_DATE_TIME);
    });

    test('exposes exactly the fields the client models', async ({ request, user }) => {
      const response: APIResponse = await request.get(PROFILE_URL, { headers: bearer(user.token) });

      const body = (await response.json()) as Record<string, unknown>;

      expect(Object.keys(body).sort()).toEqual(
        [
          'name',
          'surname',
          'dateOfBirth',
          'artistType',
          'artistName',
          'description',
          'registeredAt',
          'avatarUrl',
        ].sort(),
      );
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: APIResponse = await request.get(PROFILE_URL);

      expect([401, 403]).toContain(response.status());
    });

    test('rejects a malformed token', async ({ request }) => {
      const response: APIResponse = await request.get(PROFILE_URL, {
        headers: bearer('not-a-jwt'),
      });

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('/users/me/avatar', () => {
    test('has no avatar right after registration', async ({ request, user }) => {
      const response: APIResponse = await request.get(AVATAR_URL, { headers: bearer(user.token) });

      expect(response.status()).toBe(404);
    });

    test('uploads an avatar and returns its url', async ({ request, user }) => {
      const response: APIResponse = await uploadAvatar(request, user.token);

      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ avatarUrl: AVATAR_PATH });
    });

    test('serves the uploaded avatar byte for byte', async ({ request, user }) => {
      await uploadAvatar(request, user.token);

      const response: APIResponse = await request.get(AVATAR_URL, { headers: bearer(user.token) });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      expect(Buffer.compare(await response.body(), PNG_BYTES)).toBe(0);
    });

    test('links the uploaded avatar from the profile', async ({ request, user }) => {
      await uploadAvatar(request, user.token);

      const response: APIResponse = await request.get(PROFILE_URL, { headers: bearer(user.token) });

      expect(((await response.json()) as { avatarUrl: string | null }).avatarUrl).toBe(AVATAR_PATH);
    });

    test('deletes the avatar and unlinks it from the profile', async ({ request, user }) => {
      await uploadAvatar(request, user.token);

      const deleted: APIResponse = await request.delete(AVATAR_URL, {
        headers: bearer(user.token),
      });

      expect(deleted.status()).toBe(204);

      const avatar: APIResponse = await request.get(AVATAR_URL, { headers: bearer(user.token) });
      const profile: APIResponse = await request.get(PROFILE_URL, { headers: bearer(user.token) });

      expect(avatar.status()).toBe(404);
      expect(((await profile.json()) as { avatarUrl: string | null }).avatarUrl).toBeNull();
    });

    test('treats deleting a missing avatar as a no-op', async ({ request, user }) => {
      const response: APIResponse = await request.delete(AVATAR_URL, {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(204);
    });

    test('keeps the avatars of different users apart', async ({ request, user }) => {
      const otherUser: ITestUser = await registerUser();

      await uploadAvatar(request, user.token);

      const response: APIResponse = await request.get(AVATAR_URL, {
        headers: bearer(otherUser.token),
      });

      expect(response.status()).toBe(404);
    });

    test('rejects an upload without the file part', async ({ request, user }) => {
      const response: APIResponse = await request.post(AVATAR_URL, {
        headers: bearer(user.token),
        multipart: { other: 'value' },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects a file that is not an image as a client error', async ({ request, user }) => {
      test.fail(true, 'Backend currently answers a non-image upload with 500 instead of 4xx');

      const response: APIResponse = await uploadAvatar(request, user.token, {
        name: 'avatar.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello'),
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });

    test('rejects every avatar operation without a token', async ({ request }) => {
      const responses: APIResponse[] = await Promise.all([
        request.get(AVATAR_URL),
        request.post(AVATAR_URL, {
          multipart: { file: { name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES } },
        }),
        request.delete(AVATAR_URL),
      ]);

      for (const response of responses) {
        expect([401, 403]).toContain(response.status());
      }
    });
  });

  test.describe('in the application shell', () => {
    test('blocks the profile page for an anonymous visitor', async ({ page }) => {
      await page.goto('/profile');

      await expect(page).toHaveURL(/\/auth\/login$/);
    });

    test('lets a signed-in user open the profile page directly', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/profile');

      await expect(authenticatedPage).toHaveURL(/\/profile$/);
      await expect(authenticatedPage.locator('app-profile-page .profile')).toBeAttached();
    });

    test('opens the profile page from the account menu', async ({ authenticatedPage }) => {
      const header: HeaderPage = new HeaderPage(authenticatedPage);

      await authenticatedPage.goto('/my-uploads');

      await header.profileButton.click();
      await expect(header.profileMenu).toBeVisible();

      await header.menuItem('Profile').click();

      await expect(authenticatedPage).toHaveURL(/\/profile$/);
      await expect(header.profileMenu).toBeHidden();
      await expect(authenticatedPage.locator('app-profile-page')).toBeAttached();
    });
  });
});
