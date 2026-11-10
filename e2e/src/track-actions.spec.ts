import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { bearer, OWN_TRACKS_URL, uploadTitled } from '../fixtures/tracks';
import { fillWhenHydrated } from '../pages/field';
import { MyUploadsPage } from '../pages/my-uploads.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';

interface IOwnTrack {
  id: number;
  title: string;
  status: string;
  audioUrl: string;
}

const firstOwnTrack = async (request: APIRequestContext, token: string): Promise<IOwnTrack> => {
  const page = (await (await request.get(OWN_TRACKS_URL, { headers: bearer(token) })).json()) as {
    items: IOwnTrack[];
  };

  return page.items[0]!;
};

const trackUrl = (track: IOwnTrack, path: string = ''): string =>
  `${OWN_TRACKS_URL}/${String(track.id)}${path}`;

test.describe('track actions', () => {
  test.describe('API', () => {
    test('withdraws a track from review into the drafts and submits it again', async ({
      request,
      user,
    }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const cancelled: APIResponse = await request.post(trackUrl(track, '/cancel-submission'), {
        headers: bearer(user.token),
      });
      const asDraft: IOwnTrack = await firstOwnTrack(request, user.token);
      const submitted: APIResponse = await request.post(trackUrl(track, '/submit'), {
        headers: bearer(user.token),
      });
      const inReview: IOwnTrack = await firstOwnTrack(request, user.token);

      expect(cancelled.status()).toBe(204);
      expect(asDraft.status).toBe('DRAFT');
      expect(submitted.status()).toBe(204);
      expect(inReview.status).toBe('PENDING_REVIEW');
    });

    test('refuses actions that do not fit the status', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const resubmit: APIResponse = await request.post(trackUrl(track, '/submit'), {
        headers: bearer(user.token),
      });
      const schedule: APIResponse = await request.get(trackUrl(track, '/schedule'), {
        headers: bearer(user.token),
      });
      const rejection: APIResponse = await request.get(trackUrl(track, '/rejection'), {
        headers: bearer(user.token),
      });

      expect(resubmit.status()).toBe(409);
      expect(schedule.status()).toBe(409);
      expect(rejection.status()).toBe(409);
    });

    test('hides the tracks of other users', async ({ request, user }) => {
      const stranger = await registerUser();
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const response: APIResponse = await request.get(trackUrl(track), {
        headers: bearer(stranger.token),
      });

      expect(response.status()).toBe(404);
    });

    test('edits the details and keeps the track in review', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const response: APIResponse = await request.put(trackUrl(track), {
        headers: bearer(user.token),
        multipart: {
          title: 'Midnight Dreams (Remaster)',
          genres: 'AMBIENT',
          description: 'Remastered',
          removeCover: 'true',
        },
      });

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({
        title: 'Midnight Dreams (Remaster)',
        genres: ['AMBIENT'],
        description: 'Remastered',
        status: 'PENDING_REVIEW',
        uploadedBy: 'Ada Lovelace',
        coverUrl: null,
      });
    });

    test('offers the audio as a named download', async ({ request, user }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const response: APIResponse = await request.get(
        `${new URL(track.audioUrl, API_URL).toString()}&download=true`,
      );

      expect(response.headers()['content-disposition']).toContain(
        "filename*=UTF-8''Ada%20Lovelace%20-%20Midnight%20Dreams.wav",
      );
    });

    test('replaces the history of a deleted track with one deletion entry', async ({
      request,
      user,
    }) => {
      await uploadTitled(request, user.token, 'Midnight Dreams');
      const track: IOwnTrack = await firstOwnTrack(request, user.token);

      const deleted: APIResponse = await request.delete(trackUrl(track), {
        headers: bearer(user.token),
      });
      const tracks = (await (
        await request.get(OWN_TRACKS_URL, { headers: bearer(user.token) })
      ).json()) as { totalElements: number };
      const activities = (await (
        await request.get(`${API_URL}/users/me/activities`, { headers: bearer(user.token) })
      ).json()) as { items: { type: string; track: { title: string } }[] };
      const notifications = (await (
        await request.get(`${API_URL}/users/me/notifications`, { headers: bearer(user.token) })
      ).json()) as { items: { type: string; track: { title: string } }[] };

      expect(deleted.status()).toBe(204);
      expect(tracks.totalElements).toBe(0);
      expect(activities.items).toEqual([
        expect.objectContaining({
          type: 'TRACK_DELETED',
          track: expect.objectContaining({ title: 'Midnight Dreams' }),
        }),
      ]);
      expect(notifications.items).toEqual([
        expect.objectContaining({
          type: 'TRACK_DELETED',
          track: expect.objectContaining({ title: 'Midnight Dreams' }),
        }),
      ]);
    });
  });

  test.describe('in the application shell', () => {
    test('offers the actions of a track in review', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.actionsButton('Midnight Dreams').click();

      await expect(uploads.menuItems()).toHaveText([
        'Track Details',
        'Edit Details',
        'Download Track',
        'Cancel Submission',
        'Delete Track',
      ]);
    });

    test('keeps the actions reachable on a phone', async ({ authenticatedPage, request, user }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await authenticatedPage.setViewportSize({ width: 390, height: 844 });
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.actionsButton('Midnight Dreams').click();

      await expect(uploads.menuItems().first()).toBeVisible();
    });

    test('shows who uploaded the track in its details', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.chooseAction('Midnight Dreams', 'Track Details');

      await expect(uploads.dialog()).toContainText('Uploaded by');
      await expect(uploads.dialog()).toContainText('Ada Lovelace');
    });

    test('renames a track through its details', async ({ authenticatedPage, request, user }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.chooseAction('Midnight Dreams', 'Edit Details');
      await fillWhenHydrated(
        uploads.dialog().getByPlaceholder('Enter track title...'),
        'Midnight Dreams Remaster',
      );
      await uploads.dialog().getByRole('button', { name: 'Save Changes' }).click();

      await expect(uploads.dialog()).toBeHidden();
      await expect(uploads.titles).toHaveText(['Midnight Dreams Remaster']);
      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText('Track details saved');
    });

    test('moves a withdrawn track to the drafts and back to review', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.chooseAction('Midnight Dreams', 'Cancel Submission');
      await uploads.confirm('Cancel Submission');

      await expect(uploads.row('Midnight Dreams').locator('.uploads__status')).toHaveText('Draft');

      await uploads.tab('Drafts').click();
      await expect(uploads.titles).toHaveText(['Midnight Dreams']);

      await uploads.chooseAction('Midnight Dreams', 'Submit for Review');
      await uploads.confirm('Submit for Review');

      await expect(uploads.emptyTitle).toHaveText('No drafts');
    });

    test('downloads the audio file', async ({ authenticatedPage, request, user }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');
      const download = authenticatedPage.waitForEvent('download');

      await uploads.chooseAction('Midnight Dreams', 'Download Track');

      expect((await download).suggestedFilename()).toBe('Ada Lovelace - Midnight Dreams.wav');
    });

    test('deletes a track after confirmation', async ({ authenticatedPage, request, user }) => {
      const uploads: MyUploadsPage = new MyUploadsPage(authenticatedPage);
      await uploadTitled(request, user.token, 'Midnight Dreams');
      await authenticatedPage.goto('/my-uploads');

      await uploads.chooseAction('Midnight Dreams', 'Delete Track');
      await uploads.confirm('Delete Track');

      await expect(uploads.firstUploadTitle).toHaveText('Your stage is still empty');
      await expect(authenticatedPage.locator('.snackbar__text')).toHaveText('Track deleted');
    });
  });
});
