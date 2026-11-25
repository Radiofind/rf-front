import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { publicIdOf } from '../fixtures/database';
import {
  bearer,
  GENERAL_SETTINGS_URL,
  PNG_BYTES,
  TRACKS_URL,
  uploadApprovedTrack,
  uploadTitled,
} from '../fixtures/tracks';
import { PublicProfilePage } from '../pages/public-profile.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const USERS_URL: string = `${API_URL}/users`;

const UNKNOWN_PUBLIC_ID: string = '00000000-0000-4000-8000-000000000000';

type Visibility = 'EVERYONE' | 'FOLLOWERS' | 'ONLY_ME';

interface IPublicProfileBody {
  publicId: string;
  displayName: string;
  avatarUrl: string | null;
  access: string;
  own: boolean;
  following: boolean;
  canFollow: boolean;
  details: Record<string, unknown> | null;
}

const profileUrl = (publicId: string): string => `${USERS_URL}/${publicId}/profile`;

const tracksUrl = (publicId: string): string => `${USERS_URL}/${publicId}/tracks`;

const followUrl = (publicId: string): string => `${USERS_URL}/${publicId}/follow`;

const avatarUrl = (publicId: string): string => `${USERS_URL}/${publicId}/avatar`;

const readProfile = async (
  request: APIRequestContext,
  viewer: ITestUser,
  publicId: string,
): Promise<IPublicProfileBody> => {
  const response: APIResponse = await request.get(profileUrl(publicId), {
    headers: bearer(viewer.token),
  });

  expect(response.status()).toBe(200);

  return (await response.json()) as IPublicProfileBody;
};

const setVisibility = async (
  request: APIRequestContext,
  owner: ITestUser,
  visibility: Visibility,
): Promise<void> => {
  const response: APIResponse = await request.put(GENERAL_SETTINGS_URL, {
    headers: bearer(owner.token),
    data: {
      language: 'EN',
      radioMode: false,
      profileVisibility: visibility,
      audioQuality: 'HIGH',
      accentColor: 'VIOLET',
    },
  });

  expect(response.status()).toBe(200);
};

const nameArtist = async (
  request: APIRequestContext,
  owner: ITestUser,
  artistName: string,
): Promise<void> => {
  const response: APIResponse = await request.put(`${USERS_URL}/me/profile`, {
    headers: bearer(owner.token),
    data: {
      name: owner.name,
      surname: owner.surname,
      email: owner.email,
      recoveryEmail: null,
      artistType: 'BAND',
      artistName: artistName,
      shortDescription: 'Analytical soundscapes',
      description: null,
      mainGenres: [],
      additionalGenres: [],
      socialLinks: null,
    },
  });

  expect(response.status()).toBe(200);
};

test.describe('public profile', () => {
  test.describe('GET /users/{publicId}/profile', () => {
    test('shows a public artist with published counters and no personal data', async ({
      request,
      user,
    }) => {
      const artist: ITestUser = await registerUser();
      await nameArtist(request, artist, 'The Engines');

      const profile: IPublicProfileBody = await readProfile(
        request,
        user,
        publicIdOf(artist.email),
      );

      expect(profile).toMatchObject({
        displayName: 'The Engines',
        access: 'FULL',
        own: false,
        following: false,
        canFollow: true,
      });
      expect(Object.keys(profile.details ?? {}).sort()).toEqual(
        [
          'artistType',
          'mainGenres',
          'additionalGenres',
          'shortDescription',
          'description',
          'socialLinks',
          'followersCount',
          'tracksCount',
          'likesCount',
          'joinedAt',
        ].sort(),
      );
      expect(profile.details?.['joinedAt']).toMatch(/^\d{4}-\d{2}$/);
      expect(JSON.stringify(profile)).not.toContain(artist.email);
      expect(JSON.stringify(profile)).not.toContain(artist.dateOfBirth);
      expect(JSON.stringify(profile)).not.toContain(artist.surname);
    });

    test('names an artist without an artist name by first name and initial', async ({
      request,
      user,
    }) => {
      const artist: ITestUser = await registerUser({ name: 'Grace', surname: 'Hopper' });

      const profile: IPublicProfileBody = await readProfile(
        request,
        user,
        publicIdOf(artist.email),
      );

      expect(profile.displayName).toBe('Grace H.');
    });

    test('marks the profile of the viewer as their own', async ({ request, user }) => {
      const profile: IPublicProfileBody = await readProfile(request, user, publicIdOf(user.email));

      expect(profile.own).toBe(true);
      expect(profile.canFollow).toBe(false);
    });

    test('does not find an unknown profile', async ({ request, user }) => {
      const response: APIResponse = await request.get(profileUrl(UNKNOWN_PUBLIC_ID), {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(404);
    });

    test('does not address a profile by its database id', async ({ request, user }) => {
      const response: APIResponse = await request.get(profileUrl('42'), {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(400);
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: APIResponse = await request.get(profileUrl(UNKNOWN_PUBLIC_ID));

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('visibility', () => {
    test('shows a followers-only profile to a stranger without its details', async ({
      request,
      user,
    }) => {
      const artist: ITestUser = await registerUser();
      await setVisibility(request, artist, 'FOLLOWERS');
      const publicId: string = publicIdOf(artist.email);

      const profile: IPublicProfileBody = await readProfile(request, user, publicId);
      const tracks: APIResponse = await request.get(tracksUrl(publicId), {
        headers: bearer(user.token),
      });

      expect(profile).toMatchObject({ access: 'RESTRICTED', canFollow: true, details: null });
      expect(tracks.status()).toBe(403);
    });

    test('opens a followers-only profile once the viewer follows it', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      await setVisibility(request, artist, 'FOLLOWERS');
      const publicId: string = publicIdOf(artist.email);

      await request.put(followUrl(publicId), { headers: bearer(user.token) });

      const profile: IPublicProfileBody = await readProfile(request, user, publicId);
      const tracks: APIResponse = await request.get(tracksUrl(publicId), {
        headers: bearer(user.token),
      });

      expect(profile).toMatchObject({ access: 'FULL', following: true });
      expect(tracks.status()).toBe(200);
    });

    test('hides a private profile even from its followers', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      await request.post(`${USERS_URL}/me/avatar`, {
        headers: bearer(artist.token),
        multipart: { file: { name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES } },
      });
      await request.put(followUrl(publicId), { headers: bearer(user.token) });
      await setVisibility(request, artist, 'ONLY_ME');

      const profile: IPublicProfileBody = await readProfile(request, user, publicId);
      const avatar: APIResponse = await request.get(avatarUrl(publicId), {
        headers: bearer(user.token),
      });

      expect(profile).toMatchObject({
        access: 'HIDDEN',
        canFollow: false,
        avatarUrl: null,
        details: null,
      });
      expect(avatar.status()).toBe(404);
    });

    test('serves the avatar of a visible profile', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      await request.post(`${USERS_URL}/me/avatar`, {
        headers: bearer(artist.token),
        multipart: { file: { name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES } },
      });

      const profile: IPublicProfileBody = await readProfile(request, user, publicId);
      const avatar: APIResponse = await request.get(avatarUrl(publicId), {
        headers: bearer(user.token),
      });

      expect(profile.avatarUrl).toBe(`/api/users/${publicId}/avatar`);
      expect(avatar.headers()['content-type']).toBe('image/png');
      expect(Buffer.compare(await avatar.body(), PNG_BYTES)).toBe(0);
    });
  });

  test.describe('following', () => {
    test('counts a follower once however often they follow', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);

      const first: APIResponse = await request.put(followUrl(publicId), {
        headers: bearer(user.token),
      });
      await request.put(followUrl(publicId), { headers: bearer(user.token) });

      expect(first.status()).toBe(204);
      expect((await readProfile(request, user, publicId)).details?.['followersCount']).toBe(1);
    });

    test('stops counting a follower who unfollows', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      await request.put(followUrl(publicId), { headers: bearer(user.token) });

      const response: APIResponse = await request.delete(followUrl(publicId), {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(204);
      expect(await readProfile(request, user, publicId)).toMatchObject({ following: false });
      expect((await readProfile(request, user, publicId)).details?.['followersCount']).toBe(0);
    });

    test('shows the followers on the own profile of the artist', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      await request.put(followUrl(publicIdOf(artist.email)), { headers: bearer(user.token) });

      const own: APIResponse = await request.get(`${USERS_URL}/me/profile`, {
        headers: bearer(artist.token),
      });

      expect(((await own.json()) as { followersCount: number }).followersCount).toBe(1);
    });

    test('rejects following yourself', async ({ request, user }) => {
      const response: APIResponse = await request.put(followUrl(publicIdOf(user.email)), {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(400);
    });

    test('rejects following a private profile', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      await setVisibility(request, artist, 'ONLY_ME');

      const response: APIResponse = await request.put(followUrl(publicIdOf(artist.email)), {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(403);
    });

    test('forgets the follows of a deleted account', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      const fan: ITestUser = await registerUser();
      await request.put(followUrl(publicId), { headers: bearer(fan.token) });

      await request.delete(`${USERS_URL}/me`, {
        headers: bearer(fan.token),
        data: { password: fan.password },
      });

      expect((await readProfile(request, user, publicId)).details?.['followersCount']).toBe(0);
    });
  });

  test.describe('GET /users/{publicId}/tracks', () => {
    test('lists only the published tracks of the artist', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      await uploadApprovedTrack(request, artist.token, 'Published Song');
      await uploadTitled(request, artist.token, 'Draft Song');

      const response: APIResponse = await request.get(tracksUrl(publicId), {
        headers: bearer(user.token),
      });
      const page = (await response.json()) as {
        items: { title: string; own: boolean; artistPublicId: string }[];
      };

      expect(page.items.map((track) => track.title)).toEqual(['Published Song']);
      expect(page.items[0]).toMatchObject({ own: false, artistPublicId: publicId });
    });

    test('counts only published tracks and their likes', async ({ request, user }) => {
      const artist: ITestUser = await registerUser();
      const publicId: string = publicIdOf(artist.email);
      const trackId: number = await uploadApprovedTrack(request, artist.token, 'Liked Song');
      await uploadTitled(request, artist.token, 'Draft Song');
      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(user.token) });

      const profile: IPublicProfileBody = await readProfile(request, user, publicId);

      expect(profile.details).toMatchObject({ tracksCount: 1, likesCount: 1 });
    });
  });

  test.describe('in the application shell', () => {
    test('shows another artist without editing controls or a date of birth', async ({
      authenticatedPage,
      request,
    }) => {
      const artist: ITestUser = await registerUser();
      await nameArtist(request, artist, 'The Engines');
      await uploadApprovedTrack(request, artist.token, 'Analytical Engine');
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);

      await authenticatedPage.goto(`/users/${publicIdOf(artist.email)}`);

      await expect(profile.name).toHaveText('The Engines');
      await expect(profile.trackNames).toHaveText(['Analytical Engine']);
      await expect(profile.stat('Tracks')).toHaveText('1');
      await expect(profile.editButton).toHaveCount(0);
      await expect(authenticatedPage.getByText('Date of Birth')).toHaveCount(0);
    });

    test('follows and unfollows an artist', async ({ authenticatedPage }) => {
      const artist: ITestUser = await registerUser();
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);
      await authenticatedPage.goto(`/users/${publicIdOf(artist.email)}`);

      await profile.followButton.click();

      await expect(profile.followButton).toHaveText('Unfollow');
      await expect(profile.stat('Followers')).toHaveText('1');

      await profile.followButton.click();

      await expect(profile.followButton).toHaveText('Follow');
      await expect(profile.stat('Followers')).toHaveText('0');
    });

    test('unlocks a followers-only profile by following it', async ({
      authenticatedPage,
      request,
    }) => {
      const artist: ITestUser = await registerUser();
      await setVisibility(request, artist, 'FOLLOWERS');
      await uploadApprovedTrack(request, artist.token, 'Members Only');
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);
      await authenticatedPage.goto(`/users/${publicIdOf(artist.email)}`);

      await expect(profile.restricted).toContainText('This profile is for followers only');
      await expect(profile.stats).toHaveCount(0);

      await profile.followButton.click();

      await expect(profile.restricted).toHaveCount(0);
      await expect(profile.trackNames).toHaveText(['Members Only']);
    });

    test('shows a private profile without a way to follow it', async ({
      authenticatedPage,
      request,
    }) => {
      const artist: ITestUser = await registerUser();
      await setVisibility(request, artist, 'ONLY_ME');
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);

      await authenticatedPage.goto(`/users/${publicIdOf(artist.email)}`);

      await expect(profile.restricted).toContainText('This profile is private');
      await expect(profile.followButton).toHaveCount(0);
    });

    test('says when the profile does not exist', async ({ authenticatedPage }) => {
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);

      await authenticatedPage.goto(`/users/${UNKNOWN_PUBLIC_ID}`);

      await expect(profile.emptyTitle).toHaveText('Profile not found');
    });

    test('sends the user to their own profile page', async ({ authenticatedPage, user }) => {
      await authenticatedPage.goto(`/users/${publicIdOf(user.email)}`);

      await expect(authenticatedPage).toHaveURL(/\/profile$/);
      await expect(authenticatedPage.locator('app-profile-page')).toBeAttached();
    });

    test('opens the artist of a liked track from the media library', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const artist: ITestUser = await registerUser();
      await nameArtist(request, artist, 'The Engines');
      const trackId: number = await uploadApprovedTrack(request, artist.token, 'Liked Song');
      await request.put(`${TRACKS_URL}/${String(trackId)}/like`, { headers: bearer(user.token) });
      const profile: PublicProfilePage = new PublicProfilePage(authenticatedPage);
      await authenticatedPage.goto('/media-library');

      await authenticatedPage.getByRole('link', { name: 'The Engines' }).click();

      await expect(authenticatedPage).toHaveURL(new RegExp(`/users/${publicIdOf(artist.email)}$`));
      await expect(profile.name).toHaveText('The Engines');
    });

    test('blocks the profile of another user for an anonymous visitor', async ({ page }) => {
      await page.goto(`/users/${UNKNOWN_PUBLIC_ID}`);

      await expect(page).toHaveURL(/\/auth\/login$/);
    });
  });
});
