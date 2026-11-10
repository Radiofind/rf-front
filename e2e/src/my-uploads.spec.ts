import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { bearer, OWN_TRACKS_URL, setRadioMode, uploadTitled } from '../fixtures/tracks';
import { MyUploadsPage } from '../pages/my-uploads.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';

interface IOwnTrack {
  id: number;
  title: string;
  status: string;
  audioUrl: string;
}

interface IOwnTracksPage {
  items: IOwnTrack[];
  totalElements: number;
}

const ownTracks = async (
  request: APIRequestContext,
  token: string,
  params: Record<string, string> = {},
): Promise<IOwnTracksPage> => {
  const response: APIResponse = await request.get(OWN_TRACKS_URL, {
    headers: bearer(token),
    params: params,
  });

  expect(response.status()).toBe(200);

  return (await response.json()) as IOwnTracksPage;
};

const absolute = (url: string): string => new URL(url, API_URL).toString();

test.describe('my uploads', () => {
  test.describe('GET /users/me/tracks', () => {
    test('lists only the own uploads, newest first', async ({ request, user }) => {
      const stranger = await registerUser();
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await uploadTitled(request, user.token, 'Lost in Space');
      await uploadTitled(request, stranger.token, 'Neon Skyline');

      const page: IOwnTracksPage = await ownTracks(request, user.token);

      expect(page.items.map((track: IOwnTrack) => track.title)).toEqual([
        'Lost in Space',
        'Midnight Dreams',
      ]);
      expect(page.totalElements).toBe(2);
    });

    test('filters by status', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');

      const processing: IOwnTracksPage = await ownTracks(request, user.token, {
        status: 'PENDING_REVIEW',
      });
      const published: IOwnTracksPage = await ownTracks(request, user.token, {
        status: 'APPROVED',
      });

      expect(processing.totalElements).toBe(1);
      expect(published.totalElements).toBe(0);
    });

    test('searches titles ignoring case and takes wildcards literally', async ({
      request,
      user,
    }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await uploadTitled(request, user.token, '100% Neon');

      const byWord: IOwnTracksPage = await ownTracks(request, user.token, { search: 'DREAM' });
      const byPercent: IOwnTracksPage = await ownTracks(request, user.token, { search: '%' });

      expect(byWord.items.map((track: IOwnTrack) => track.title)).toEqual(['Midnight Dreams']);
      expect(byPercent.items.map((track: IOwnTrack) => track.title)).toEqual(['100% Neon']);
    });

    test('rejects a request without a token', async ({ request }) => {
      const response: APIResponse = await request.get(OWN_TRACKS_URL);

      expect(response.status()).toBe(401);
    });
  });

  test.describe('GET /tracks/{id}/audio', () => {
    test('streams the requested bytes of an own upload through its link', async ({
      request,
      user,
    }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const [track] = (await ownTracks(request, user.token)).items;

      const response: APIResponse = await request.get(absolute(track?.audioUrl ?? ''), {
        headers: { Range: 'bytes=0-3' },
      });

      expect(response.status()).toBe(206);
      expect(response.headers()['content-type']).toBe('audio/wav');
      expect((await response.body()).toString('ascii')).toBe('RIFF');
    });

    test('refuses the link of one track for another track', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await uploadTitled(request, user.token, 'Lost in Space');
      const [newer, older] = (await ownTracks(request, user.token)).items;
      const token: string =
        new URL(absolute(newer?.audioUrl ?? '')).searchParams.get('token') ?? '';

      const response: APIResponse = await request.get(
        `${API_URL}/tracks/${String(older?.id)}/audio`,
        {
          params: { token: token },
        },
      );

      expect(response.status()).toBe(403);
    });

    test('refuses a login token as audio link', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const [track] = (await ownTracks(request, user.token)).items;

      const response: APIResponse = await request.get(
        `${API_URL}/tracks/${String(track?.id)}/audio`,
        {
          params: { token: user.token },
        },
      );

      expect(response.status()).toBe(403);
    });
  });

  test.describe('in the application shell', () => {
    test('invites an artist without uploads to upload the first track', async ({
      authenticatedPage,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);

      await authenticatedPage.goto('/my-uploads');

      await expect(uploads.firstUploadTitle).toHaveText('Your stage is still empty');
      await expect(uploads.search).toBeHidden();

      await uploads.uploadFirstTrackButton.click();

      await expect(authenticatedPage).toHaveURL(/\/upload-track$/);
    });

    test('shows an upload as processing with its genre', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams', 'GRUNGE');

      await authenticatedPage.goto('/my-uploads');

      const row = uploads.row('Midnight Dreams');
      await expect(row.locator('.uploads__artist')).toHaveText('Ada Lovelace');
      await expect(row.locator('.uploads__genre')).toHaveText('Grunge');
      await expect(row.locator('.uploads__status')).toHaveText('Processing');
      await expect(uploads.range).toHaveText('Showing 1–1 of 1');
    });

    test('explains an empty status tab and leads back to all uploads', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');
      await expect(uploads.titles).toHaveText(['Midnight Dreams']);

      await uploads.tab('Published').click();

      await expect(uploads.emptyTitle).toHaveText('No published tracks yet');

      await uploads.root.getByRole('button', { name: 'Show all uploads' }).click();

      await expect(uploads.titles).toHaveText(['Midnight Dreams']);
      await expect(uploads.tab('All')).toHaveAttribute('aria-pressed', 'true');
    });

    test('finds uploads by title and explains a search without results', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await uploadTitled(request, user.token, 'Lost in Space');
      await authenticatedPage.goto('/my-uploads');
      await expect(uploads.titles).toHaveCount(2);

      await uploads.search.fill('space');

      await expect(uploads.titles).toHaveText(['Lost in Space']);

      await uploads.search.fill('zzz');

      await expect(uploads.emptyTitle).toHaveText('Nothing found for "zzz"');

      await uploads.clearSearchButton.click();

      await expect(uploads.titles).toHaveCount(2);
    });

    test('plays an upload from its cover and pauses it with a second click', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await setRadioMode(request, user.token, false);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.playButton('Midnight Dreams').click();

      await expect(uploads.playerTitle).toHaveText('Midnight Dreams');
      await expect(uploads.playerPlayButton).toHaveAttribute('aria-label', 'Pause');

      await uploads.pauseButton('Midnight Dreams').click();

      await expect(uploads.playerPlayButton).toHaveAttribute('aria-label', 'Play');
      await expect(uploads.playButton('Midnight Dreams')).toBeVisible();
    });

    test('continues with the next upload and stops after the last one', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await setRadioMode(request, user.token, false);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await uploadTitled(request, user.token, 'Lost in Space');
      await authenticatedPage.goto('/my-uploads');
      await expect(uploads.titles).toHaveText(['Lost in Space', 'Midnight Dreams']);

      await uploads.playButton('Lost in Space').click();
      await expect(uploads.playerSeek).toBeEnabled();
      await uploads.playerSeek.fill('19.5');

      await expect(uploads.playerTitle).toHaveText('Midnight Dreams');
      await expect(uploads.pauseButton('Midnight Dreams')).toBeVisible();

      await expect(uploads.playerSeek).toBeEnabled();
      await uploads.playerSeek.fill('19.5');

      await expect(uploads.playerPlayButton).toHaveAttribute('aria-label', 'Play');
      await expect(uploads.playerTitle).toHaveText('Midnight Dreams');
    });

    test('offers no playback on the covers while radio mode is on', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await setRadioMode(request, user.token, true);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await expect(uploads.titles).toHaveText(['Midnight Dreams']);
      await expect(uploads.radioHint).toBeVisible();
      await expect(uploads.playButton('Midnight Dreams')).toHaveCount(0);
    });
  });
});
