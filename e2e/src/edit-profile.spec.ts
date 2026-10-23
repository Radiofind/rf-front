import { expect, test } from '../fixtures/test';
import { API_URL, registerUser, uniqueEmail } from '../fixtures/api';

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const PROFILE_URL: string = `${API_URL}/users/me/profile`;

const LOGIN_URL: string = `${API_URL}/auth/login`;

const NO_SOCIAL_LINKS: Record<string, string | null> = {
  telegram: null,
  instagram: null,
  youtube: null,
  facebook: null,
  spotify: null,
  appleMusic: null,
  soundcloud: null,
  bandcamp: null,
  icloud: null,
  tiktok: null,
};

interface IProfileUpdate {
  name: string;
  surname: string;
  email: string;
  recoveryEmail: string | null;
  artistType: string | null;
  artistName: string | null;
  description: string | null;
  shortDescription: string | null;
  socialLinks: Record<string, string | null> | null;
  mainGenres: string[];
  additionalGenres: string[];
}

interface IUpdatedProfile {
  profile: Record<string, unknown>;
  emailChanged: boolean;
  requiresReauthentication: boolean;
}

const bearer = (token: string): Record<string, string> => ({ Authorization: `Bearer ${token}` });

const profileUpdate = (
  user: ITestUser,
  overrides: Partial<IProfileUpdate> = {},
): IProfileUpdate => ({
  name: 'Grace',
  surname: 'Hopper',
  email: user.email,
  recoveryEmail: uniqueEmail('e2e-recovery'),
  artistType: 'BAND',
  artistName: 'The Compilers',
  description: 'Debugging the charts since 1947.',
  shortDescription: 'Debuggers',
  socialLinks: { ...NO_SOCIAL_LINKS, telegram: 'https://t.me/compilers' },
  mainGenres: ['ROCK'],
  additionalGenres: ['JAZZ'],
  ...overrides,
});

const updateProfile = (
  request: APIRequestContext,
  token: string,
  data: IProfileUpdate,
): Promise<APIResponse> => request.put(PROFILE_URL, { headers: bearer(token), data: data });

const readProfile = async (
  request: APIRequestContext,
  token: string,
): Promise<Record<string, unknown>> => {
  const response: APIResponse = await request.get(PROFILE_URL, { headers: bearer(token) });

  expect(response.status()).toBe(200);

  return (await response.json()) as Record<string, unknown>;
};

test.describe('edit profile', () => {
  test.describe('PUT /users/me/profile', () => {
    test('saves the editable fields and returns the saved profile', async ({ request, user }) => {
      const update: IProfileUpdate = profileUpdate(user);

      const response: APIResponse = await updateProfile(request, user.token, update);

      expect(response.status()).toBe(200);

      const body = (await response.json()) as IUpdatedProfile;

      expect(body.emailChanged).toBe(false);
      expect(body.requiresReauthentication).toBe(false);
      expect(body.profile).toMatchObject({ ...update });
    });

    test('persists the update for later reads', async ({ request, user }) => {
      const update: IProfileUpdate = profileUpdate(user);

      await updateProfile(request, user.token, update);

      expect(await readProfile(request, user.token)).toMatchObject({ ...update });
    });

    test('returns the profile in the same shape as the read endpoint', async ({
      request,
      user,
    }) => {
      const response: APIResponse = await updateProfile(request, user.token, profileUpdate(user));

      const body = (await response.json()) as IUpdatedProfile;

      expect(Object.keys(body).sort()).toEqual(
        ['profile', 'emailChanged', 'requiresReauthentication'].sort(),
      );
      expect(body.profile).toEqual(await readProfile(request, user.token));
    });

    test('keeps the fields that are not editable', async ({ request, user }) => {
      const before: Record<string, unknown> = await readProfile(request, user.token);

      await request.put(PROFILE_URL, {
        headers: bearer(user.token),
        data: { ...profileUpdate(user), dateOfBirth: '2000-01-01', registeredAt: '2000-01-01' },
      });

      const after: Record<string, unknown> = await readProfile(request, user.token);

      expect(after['dateOfBirth']).toBe(user.dateOfBirth);
      expect(after['registeredAt']).toBe(before['registeredAt']);
      expect(after['avatarUrl']).toBe(before['avatarUrl']);
    });

    test('clears the optional fields when they are sent as null', async ({ request, user }) => {
      await updateProfile(request, user.token, profileUpdate(user));

      const response: APIResponse = await updateProfile(
        request,
        user.token,
        profileUpdate(user, {
          recoveryEmail: null,
          artistType: 'ARTIST',
          artistName: null,
          description: null,
          mainGenres: [],
          additionalGenres: [],
        }),
      );

      expect(response.status()).toBe(200);
      expect(await readProfile(request, user.token)).toMatchObject({
        recoveryEmail: null,
        artistName: null,
        description: null,
        mainGenres: [],
        additionalGenres: [],
      });
    });

    test('flags an email change as requiring a new sign-in', async ({ request, user }) => {
      const newEmail: string = uniqueEmail();

      const response: APIResponse = await updateProfile(
        request,
        user.token,
        profileUpdate(user, { email: newEmail }),
      );

      expect(response.status()).toBe(200);

      const body = (await response.json()) as IUpdatedProfile;

      expect(body.emailChanged).toBe(true);
      expect(body.requiresReauthentication).toBe(true);
      expect(body.profile['email']).toBe(newEmail);
    });

    test('moves the login over to the new email', async ({ request, user }) => {
      const newEmail: string = uniqueEmail();

      await updateProfile(request, user.token, profileUpdate(user, { email: newEmail }));

      const withNewEmail: APIResponse = await request.post(LOGIN_URL, {
        data: { email: newEmail, password: user.password },
      });
      const withOldEmail: APIResponse = await request.post(LOGIN_URL, {
        data: { email: user.email, password: user.password },
      });

      expect(withNewEmail.status()).toBe(200);
      expect(withOldEmail.ok()).toBe(false);
    });

    test('rejects the old token once the email has changed', async ({ request, user }) => {
      test.fail(true, 'Backend currently answers a stale token with 500 instead of 401/403');

      await updateProfile(request, user.token, profileUpdate(user, { email: uniqueEmail() }));

      const response: APIResponse = await request.get(PROFILE_URL, {
        headers: bearer(user.token),
      });

      expect([401, 403]).toContain(response.status());
    });

    test('refuses an email that belongs to another account', async ({ request, user }) => {
      const otherUser: ITestUser = await registerUser();
      const before: Record<string, unknown> = await readProfile(request, user.token);

      const response: APIResponse = await updateProfile(
        request,
        user.token,
        profileUpdate(user, { email: otherUser.email }),
      );

      expect(response.status()).toBe(409);
      expect(await readProfile(request, user.token)).toEqual(before);
    });

    const invalidUpdates: readonly { title: string; overrides: Partial<IProfileUpdate> }[] = [
      { title: 'a blank name', overrides: { name: '' } },
      { title: 'a blank surname', overrides: { surname: '' } },
      { title: 'a malformed email', overrides: { email: 'not-an-email' } },
      { title: 'a malformed recovery email', overrides: { recoveryEmail: 'not-an-email' } },
      { title: 'an unknown artist type', overrides: { artistType: 'DJ' } },
      {
        title: 'a malformed social link',
        overrides: { socialLinks: { ...NO_SOCIAL_LINKS, telegram: 'not a url' } },
      },
    ];

    for (const { title, overrides } of invalidUpdates) {
      test(`rejects ${title} and keeps the profile`, async ({ request, user }) => {
        const before: Record<string, unknown> = await readProfile(request, user.token);

        const response: APIResponse = await updateProfile(
          request,
          user.token,
          profileUpdate(user, overrides),
        );

        expect(response.status()).toBe(400);
        expect(await readProfile(request, user.token)).toEqual(before);
      });
    }

    test('rejects an empty body', async ({ request, user }) => {
      const response: APIResponse = await request.put(PROFILE_URL, {
        headers: bearer(user.token),
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('rejects a request without a token', async ({ request, user }) => {
      const response: APIResponse = await request.put(PROFILE_URL, { data: profileUpdate(user) });

      expect([401, 403]).toContain(response.status());
    });

    test('rejects a malformed token', async ({ request, user }) => {
      const response: APIResponse = await updateProfile(request, 'not-a-jwt', profileUpdate(user));

      expect([401, 403]).toContain(response.status());
    });

    test('leaves the profiles of other users untouched', async ({ request, user }) => {
      const otherUser: ITestUser = await registerUser();
      const before: Record<string, unknown> = await readProfile(request, otherUser.token);

      await updateProfile(request, user.token, profileUpdate(user));

      expect(await readProfile(request, otherUser.token)).toEqual(before);
    });

    test('stores social links without any link as null', async ({ request, user }) => {
      const response: APIResponse = await updateProfile(
        request,
        user.token,
        profileUpdate(user, { socialLinks: NO_SOCIAL_LINKS }),
      );

      expect(((await response.json()) as IUpdatedProfile).profile['socialLinks']).toBeNull();
      expect((await readProfile(request, user.token))['socialLinks']).toBeNull();
    });

    test('accepts the nullable fields back exactly as the read endpoint returns them', async ({
      request,
      user,
    }) => {
      await updateProfile(request, user.token, profileUpdate(user));

      const response: APIResponse = await updateProfile(
        request,
        user.token,
        profileUpdate(user, { shortDescription: null, socialLinks: null }),
      );

      expect(response.status()).toBe(200);
      expect(await readProfile(request, user.token)).toMatchObject({
        shortDescription: null,
        socialLinks: null,
      });
    });
  });

  test.describe('in the application shell', () => {
    test('blocks the edit page for an anonymous visitor', async ({ page }) => {
      await page.goto('/profile/edit');

      await expect(page).toHaveURL(/\/auth\/login$/);
    });

    test('lets a signed-in user open the edit page directly', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/profile/edit');

      await expect(authenticatedPage).toHaveURL(/\/profile\/edit$/);
      await expect(authenticatedPage.locator('app-edit-profile-page')).toBeAttached();
      await expect(authenticatedPage.locator('app-profile-page')).toHaveCount(0);
    });

    test('keeps the edit page after a reload', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/profile/edit');
      await expect(authenticatedPage.locator('app-edit-profile-page')).toBeAttached();

      await authenticatedPage.reload();

      await expect(authenticatedPage).toHaveURL(/\/profile\/edit$/);
      await expect(authenticatedPage.locator('app-edit-profile-page')).toBeAttached();
    });

    test('returns to the profile page with the browser back button', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile');
      await expect(authenticatedPage.locator('app-profile-page')).toBeAttached();

      await authenticatedPage.goto('/profile/edit');
      await expect(authenticatedPage.locator('app-edit-profile-page')).toBeAttached();

      await authenticatedPage.goBack();

      await expect(authenticatedPage).toHaveURL(/\/profile$/);
      await expect(authenticatedPage.locator('app-profile-page')).toBeAttached();
      await expect(authenticatedPage.locator('app-edit-profile-page')).toHaveCount(0);
    });

    test('does not treat a deeper path under the edit page as the editor', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile/edit/unknown');

      await expect(authenticatedPage.locator('app-edit-profile-page')).toHaveCount(0);
    });
  });
});
