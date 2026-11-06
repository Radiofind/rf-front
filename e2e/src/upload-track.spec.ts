import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { melodyWav, randomSeed } from '../fixtures/audio';
import { fillWhenHydrated } from '../pages/field';
import { LatestActivityPage } from '../pages/latest-activity.page';
import { SidebarPage } from '../pages/sidebar.page';
import { UploadTrackPage } from '../pages/upload-track.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';

const TRACKS_URL: string = `${API_URL}/tracks`;

const ACTIVITIES_URL: string = `${API_URL}/users/me/activities`;

const NOTIFICATIONS_URL: string = `${API_URL}/users/me/notifications`;
const FAKE_MP3_BYTES: Buffer = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(64)]);

const PNG_BYTES: Buffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
  'base64',
);

const bearer = (token: string): Record<string, string> => ({ Authorization: `Bearer ${token}` });

const uploadTrack = (
  request: APIRequestContext,
  token: string,
  fields: Record<string, string> = { title: 'Midnight Dreams', genres: 'GRUNGE' },
  audio: Buffer = melodyWav(randomSeed()),
): Promise<APIResponse> =>
  request.post(TRACKS_URL, {
    headers: bearer(token),
    multipart: {
      ...fields,
      audio: { name: 'song.wav', mimeType: 'audio/wav', buffer: audio },
      cover: { name: 'cover.png', mimeType: 'image/png', buffer: PNG_BYTES },
    },
  });

test.describe('upload track', () => {
  test.describe('POST /tracks', () => {
    test('stores the track as pending review under the account name', async ({ request, user }) => {
      const response: APIResponse = await uploadTrack(request, user.token);

      expect(response.status()).toBe(201);
      expect(await response.json()).toMatchObject({
        title: 'Midnight Dreams',
        artistName: 'Ada Lovelace',
        genres: ['GRUNGE'],
        status: 'PENDING_REVIEW',
        audioFormat: 'WAV',
        durationSeconds: 20,
      });
    });

    test('rejects a genre group as genre', async ({ request, user }) => {
      const response: APIResponse = await uploadTrack(request, user.token, {
        title: 'Midnight Dreams',
        genres: 'ROCK',
      });

      expect(response.status()).toBe(400);
    });

    test('rejects an upload without a token', async ({ request }) => {
      const response: APIResponse = await request.post(TRACKS_URL, {
        multipart: { title: 'Midnight Dreams', genres: 'GRUNGE' },
      });

      expect(response.status()).toBe(401);
    });

    test('serves the cover without a token', async ({ request, user }) => {
      const track = (await (await uploadTrack(request, user.token)).json()) as {
        coverUrl: string;
      };

      const response: APIResponse = await request.get(new URL(track.coverUrl, API_URL).toString());

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
    });

    test('records the upload as activity and as an unread notification', async ({
      request,
      user,
    }) => {
      await uploadTrack(request, user.token);

      const activities = (await (
        await request.get(ACTIVITIES_URL, { headers: bearer(user.token) })
      ).json()) as { items: { type: string; track: { title: string } }[] };
      const unread = (await (
        await request.get(`${NOTIFICATIONS_URL}/unread-count`, { headers: bearer(user.token) })
      ).json()) as { count: number };

      expect(activities.items).toEqual([
        expect.objectContaining({
          type: 'TRACK_UPLOADED',
          track: expect.objectContaining({ title: 'Midnight Dreams' }),
        }),
      ]);
      expect(unread.count).toBe(1);
    });
  });

  test.describe('duplicates', () => {
    test('rejects a track the user has already uploaded', async ({ request, user }) => {
      const song: Buffer = melodyWav(randomSeed());
      await uploadTrack(request, user.token, undefined, song);

      const response: APIResponse = await uploadTrack(request, user.token, undefined, song);

      expect(response.status()).toBe(409);
    });

    test('recognises the same track in another sample rate', async ({ request, user }) => {
      const seed: number = randomSeed();
      await uploadTrack(request, user.token, undefined, melodyWav(seed, 22050));

      const response: APIResponse = await uploadTrack(
        request,
        user.token,
        undefined,
        melodyWav(seed, 16000),
      );

      expect(response.status()).toBe(409);
    });

    test('accepts a different track of the same user', async ({ request, user }) => {
      await uploadTrack(request, user.token);

      const response: APIResponse = await uploadTrack(request, user.token);

      expect(response.status()).toBe(201);
    });

    test('accepts the same track from another user for review', async ({ request, user }) => {
      const song: Buffer = melodyWav(randomSeed());
      const otherUser = await registerUser();
      await uploadTrack(request, user.token, undefined, song);

      const response: APIResponse = await uploadTrack(request, otherUser.token, undefined, song);

      expect(response.status()).toBe(201);
    });

    test('rejects a file that only looks like audio', async ({ request, user }) => {
      const response: APIResponse = await request.post(TRACKS_URL, {
        headers: bearer(user.token),
        multipart: {
          title: 'Midnight Dreams',
          genres: 'GRUNGE',
          audio: { name: 'song.mp3', mimeType: 'audio/mpeg', buffer: FAKE_MP3_BYTES },
        },
      });

      expect(response.status()).toBe(415);
    });
  });

  test.describe('in the application shell', () => {
    test('uploads a track and shows it in the latest activity and the notifications', async ({
      authenticatedPage,
    }) => {
      const uploadPage: UploadTrackPage = new UploadTrackPage(authenticatedPage);
      const activity: LatestActivityPage = new LatestActivityPage(authenticatedPage);

      await authenticatedPage.goto('/upload-track');
      await expect(uploadPage.artist).toHaveValue('Ada Lovelace');
      await uploadPage.audioInput.setInputFiles({
        name: 'song.wav',
        mimeType: 'audio/wav',
        buffer: melodyWav(randomSeed()),
      });
      await uploadPage.coverInput.setInputFiles({
        name: 'cover.png',
        mimeType: 'image/png',
        buffer: PNG_BYTES,
      });
      await fillWhenHydrated(uploadPage.title, 'Midnight Dreams');
      await uploadPage.addGenre('Rock', 'Grunge');
      await uploadPage.uploadButton.click();

      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText(
        'Track uploaded and sent for quality review',
      );
      await expect(authenticatedPage).toHaveURL(/\/my-uploads$/);

      await authenticatedPage.goto('/profile');
      await expect(authenticatedPage.locator('.stats__item', { hasText: 'Uploads' })).toContainText(
        '1',
      );
      await expect(activity.root.locator('.activity__name')).toHaveText('Midnight Dreams');
      await expect(activity.root.locator('.activity__artist')).toHaveText('Ada Lovelace');

      const bell = authenticatedPage.getByRole('button', { name: 'Notifications, unread' });
      await bell.click();

      await expect(authenticatedPage.locator('.notification-list__text')).toHaveText(
        'Your track "Midnight Dreams" was uploaded and sent for quality review',
      );
      await expect(authenticatedPage.getByRole('button', { name: 'Notifications' })).toBeVisible();
    });

    test('asks before leaving a started upload', async ({ authenticatedPage }) => {
      const uploadPage: UploadTrackPage = new UploadTrackPage(authenticatedPage);

      await authenticatedPage.goto('/upload-track');
      await fillWhenHydrated(uploadPage.title, 'Midnight Dreams');
      await new SidebarPage(authenticatedPage).item('Media Library').click();

      await expect(authenticatedPage.locator('.confirm__message')).toHaveText(
        'You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.',
      );

      await authenticatedPage.locator('.confirm').getByRole('button', { name: 'No' }).click();

      await expect(authenticatedPage).toHaveURL(/\/upload-track$/);
      await expect(uploadPage.title).toHaveValue('Midnight Dreams');
    });
  });
});
