import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { bearer, OWN_TRACKS_URL, TRACKS_URL, uploadTitled } from '../fixtures/tracks';
import { MediaLibraryPage } from '../pages/media-library.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';

const LIBRARY_URL: string = `${API_URL}/users/me/library`;

const firstOwnTrackId = async (request: APIRequestContext, token: string): Promise<number> => {
  const response: APIResponse = await request.get(OWN_TRACKS_URL, { headers: bearer(token) });
  const body = (await response.json()) as { items: { id: number }[] };

  return body.items[0]?.id ?? -1;
};

test.describe('media library', () => {
  test.describe('GET /users/me/library', () => {
    test('is empty for an account that has not liked anything', async ({ request, user }) => {
      const response: APIResponse = await request.get(LIBRARY_URL, { headers: bearer(user.token) });

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ items: [], totalElements: 0 });
    });

    test('requires sign-in', async ({ request }) => {
      const response: APIResponse = await request.get(LIBRARY_URL);

      expect(response.status()).toBe(401);
    });

    test('hides the details of a track that is not in the library', async ({ request, user }) => {
      const artist = await registerUser();
      await uploadTitled(request, artist.token, 'Midnight Dreams');
      const trackId: number = await firstOwnTrackId(request, artist.token);

      const response: APIResponse = await request.get(`${LIBRARY_URL}/${String(trackId)}`, {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('POST /tracks/{id}/reports', () => {
    test('refuses a report of a track that is still in review', async ({ request, user }) => {
      const artist = await registerUser();
      await uploadTitled(request, artist.token, 'Midnight Dreams');
      const trackId: number = await firstOwnTrackId(request, artist.token);

      const response: APIResponse = await request.post(`${TRACKS_URL}/${String(trackId)}/reports`, {
        headers: bearer(user.token),
        data: { reason: 'SPAM', comment: null },
      });

      expect(response.status()).toBe(409);
    });

    test('refuses a report of the own track', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const trackId: number = await firstOwnTrackId(request, user.token);

      const response: APIResponse = await request.post(`${TRACKS_URL}/${String(trackId)}/reports`, {
        headers: bearer(user.token),
        data: { reason: 'SPAM', comment: null },
      });

      expect(response.status()).toBe(400);
    });

    test('refuses a report without a reason', async ({ request, user }) => {
      const response: APIResponse = await request.post(`${TRACKS_URL}/1/reports`, {
        headers: bearer(user.token),
        data: { comment: 'Same loop' },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('page', () => {
    test('invites a listener without likes to start collecting', async ({ authenticatedPage }) => {
      const library: MediaLibraryPage = new MediaLibraryPage(authenticatedPage);

      await authenticatedPage.goto('/media-library');

      await expect(library.title).toHaveText('Media Library');
      await expect(library.emptyTitle).toHaveText('Your library is waiting for its first track');
      await expect(library.emptySteps).toHaveText(['Listen', 'Like', 'Collect']);
      await expect(library.search).toHaveCount(0);
    });
  });
});
