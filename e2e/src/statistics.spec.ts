import { expect, test } from '../fixtures/test';
import { API_URL, registerUser } from '../fixtures/api';
import { bearer, TRACKS_URL, uploadApprovedTrack } from '../fixtures/tracks';
import { StatisticsPage } from '../pages/statistics.page';
import { MediaLibraryPage } from '../pages/media-library.page';

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ITestUser } from '../fixtures/api';

const STATISTICS_URL: string = `${API_URL}/users/me/statistics`;

interface IStatisticsBody {
  granularity: string;
  current: { plays: number; downloads: number; likes: number; uniqueListeners: number };
  previous: { plays: number; downloads: number; likes: number; uniqueListeners: number };
  timeline: { start: string; plays: number; downloads: number }[];
  genres: { genre: string; plays: number }[];
  topTracks: { track: { id: number; title: string }; plays: number }[];
}

const statisticsOf = async (
  request: APIRequestContext,
  token: string,
  period: string = 'LAST_7_DAYS',
): Promise<IStatisticsBody> => {
  const response: APIResponse = await request.get(STATISTICS_URL, {
    headers: bearer(token),
    params: { period: period, zone: 'Europe/Zurich' },
  });
  expect(response.status()).toBe(200);

  return (await response.json()) as IStatisticsBody;
};

const engage = async (
  request: APIRequestContext,
  trackId: number,
  fan: ITestUser,
  action: 'plays' | 'downloads' | 'like',
): Promise<void> => {
  const url: string = `${TRACKS_URL}/${String(trackId)}/${action}`;
  const response: APIResponse =
    action === 'like'
      ? await request.put(url, { headers: bearer(fan.token) })
      : await request.post(url, { headers: bearer(fan.token) });

  expect(response.status(), `${action} of track ${String(trackId)} failed`).toBe(204);
};

test.describe('statistics', () => {
  test.describe('GET /users/me/statistics', () => {
    test('requires sign-in', async ({ request }) => {
      const response: APIResponse = await request.get(STATISTICS_URL);

      expect(response.status()).toBe(401);
    });

    test('counts plays, downloads, likes and listeners of the week', async ({ request, user }) => {
      const fan = await registerUser();
      const otherFan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');
      await engage(request, trackId, fan, 'plays');
      await engage(request, trackId, otherFan, 'plays');
      await engage(request, trackId, fan, 'downloads');
      await engage(request, trackId, fan, 'like');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token);

      expect(statistics.current).toEqual({ plays: 3, downloads: 1, likes: 1, uniqueListeners: 2 });
      expect(statistics.previous).toEqual({ plays: 0, downloads: 0, likes: 0, uniqueListeners: 0 });
    });

    test('puts the activity of today on the last day of the timeline', async ({
      request,
      user,
    }) => {
      const fan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');
      await engage(request, trackId, fan, 'downloads');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token);

      expect(statistics.timeline).toHaveLength(7);
      expect(statistics.timeline.at(-1)).toMatchObject({ plays: 1, downloads: 1 });
      expect(statistics.timeline.slice(0, 6).map((point) => point.plays)).toEqual([
        0, 0, 0, 0, 0, 0,
      ]);
    });

    test('puts the activity of this hour on the last hour of the last 24 hours', async ({
      request,
      user,
    }) => {
      const fan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token, 'LAST_24_HOURS');

      expect(statistics.granularity).toBe('HOUR');
      expect(statistics.timeline).toHaveLength(24);
      expect(statistics.timeline.at(-1)).toMatchObject({ plays: 1 });
      expect(statistics.current.plays).toBe(1);
    });

    for (const [period, weeks] of [
      ['LAST_3_MONTHS', 13],
      ['LAST_6_MONTHS', 26],
    ] as const) {
      test(`lays out ${period} week by week from Monday`, async ({ request, user }) => {
        const statistics: IStatisticsBody = await statisticsOf(request, user.token, period);

        expect(statistics.granularity).toBe('WEEK');
        expect(statistics.timeline).toHaveLength(weeks);
        expect(new Set(statistics.timeline.map((point) => new Date(point.start).getDay()))).toEqual(
          new Set([1]),
        );
      });
    }

    test('lays out the last 12 months month by month', async ({ request, user }) => {
      const statistics: IStatisticsBody = await statisticsOf(request, user.token, 'LAST_12_MONTHS');

      expect(statistics.granularity).toBe('MONTH');
      expect(statistics.timeline).toHaveLength(12);
      expect(new Set(statistics.timeline.map((point) => point.start.slice(8)))).toEqual(
        new Set(['01T00:00:00']),
      );
    });

    test('ranks the tracks and genres by their plays', async ({ request, user }) => {
      const fan = await registerUser();
      const otherFan = await registerUser();
      const grunge: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      const chillout: number = await uploadApprovedTrack(
        request,
        user.token,
        'Neon Rain',
        'CHILLOUT',
      );
      await engage(request, chillout, fan, 'plays');
      await engage(request, chillout, otherFan, 'plays');
      await engage(request, grunge, fan, 'plays');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token);

      expect(statistics.genres).toEqual([
        { genre: 'CHILLOUT', plays: 2 },
        { genre: 'GRUNGE', plays: 1 },
      ]);
      expect(statistics.topTracks.map((top) => [top.track.title, top.plays])).toEqual([
        ['Neon Rain', 2],
        ['Midnight Dreams', 1],
      ]);
    });

    test('leaves out what the artist did with the own tracks', async ({ request, user }) => {
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, user, 'plays');
      await engage(request, trackId, user, 'downloads');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token);

      expect(statistics.current).toMatchObject({ plays: 0, downloads: 0, uniqueListeners: 0 });
    });

    test('shows a listener nothing of the tracks they listened to', async ({ request, user }) => {
      const artist = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, artist.token, 'Midnight Dreams');
      await engage(request, trackId, user, 'plays');

      const statistics: IStatisticsBody = await statisticsOf(request, user.token);

      expect(statistics.current.plays).toBe(0);
      expect(statistics.topTracks).toEqual([]);
    });

    for (const zone of ['Mars/Olympus', '+02:00']) {
      test(`rejects the time zone ${zone}`, async ({ request, user }) => {
        const response: APIResponse = await request.get(STATISTICS_URL, {
          headers: bearer(user.token),
          params: { zone: zone },
        });

        expect(response.status()).toBe(400);
      });
    }
  });

  test.describe('POST /tracks/{id}/downloads', () => {
    test('requires sign-in', async ({ request }) => {
      const response: APIResponse = await request.post(`${TRACKS_URL}/1/downloads`);

      expect(response.status()).toBe(401);
    });

    test('does not count a download of an unknown track', async ({ request, user }) => {
      const response: APIResponse = await request.post(`${TRACKS_URL}/999999999/downloads`, {
        headers: bearer(user.token),
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('page', () => {
    test('shows the figures, tracks and genres of the last 30 days', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);
      const fan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');
      await engage(request, trackId, fan, 'plays');
      await engage(request, trackId, fan, 'downloads');
      await engage(request, trackId, fan, 'like');

      await authenticatedPage.goto('/statistics');

      await expect(statistics.title).toHaveText('Statistics');
      await expect(statistics.period('1 Month')).toHaveAttribute('aria-pressed', 'true');
      await expect(statistics.kpiLabels).toHaveText([
        'Total plays',
        'Downloads',
        'Likes',
        'Unique listeners',
      ]);
      await expect(statistics.kpiValues).toHaveText(['2', '1', '1', '1']);
      await expect(statistics.kpiComparisons.first()).toHaveText('No earlier data');
      await expect(statistics.genreNames).toHaveText(['Grunge']);
      await expect(statistics.genreShares).toHaveText(['100%']);
      await expect(statistics.topTrackNames).toHaveText(['Midnight Dreams']);
      await expect(statistics.topTrackPlays).toHaveText(['2']);
      await expect(statistics.shareNames).toHaveText(['Midnight Dreams']);
      await expect(statistics.shareValues).toHaveText(['100%']);
    });

    test('shows the plays of today when the timeline is explored with the keyboard', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);
      const fan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');
      await authenticatedPage.goto('/statistics');
      await expect(statistics.kpiValues.first()).toHaveText('1');

      await statistics.timelinePlot.focus();
      await authenticatedPage.keyboard.press('ArrowLeft');

      await expect(statistics.tooltipValues).toHaveText(['1', '0']);
    });

    test('offers every period from one day to one year', async ({ authenticatedPage }) => {
      const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);

      await authenticatedPage.goto('/statistics');

      await expect(statistics.periods).toHaveText([
        '1 Day',
        '1 Week',
        '1 Month',
        '3 Months',
        '6 Months',
        '1 Year',
      ]);
    });

    for (const { label, subtitle } of [
      { label: '1 Day', subtitle: 'Plays and downloads per hour' },
      { label: '1 Week', subtitle: 'Plays and downloads per day' },
      { label: '3 Months', subtitle: 'Plays and downloads per week' },
      { label: '6 Months', subtitle: 'Plays and downloads per week' },
      { label: '1 Year', subtitle: 'Plays and downloads per month' },
    ]) {
      test(`describes the timeline of ${label}`, async ({ authenticatedPage }) => {
        const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);
        await authenticatedPage.goto('/statistics');
        await expect(statistics.timelineSubtitle).toHaveText('Plays and downloads per day');

        await statistics.period(label).click();

        await expect(statistics.period(label)).toHaveAttribute('aria-pressed', 'true');
        await expect(statistics.timelineSubtitle).toHaveText(subtitle);
      });
    }

    test('counts the plays of this hour when one day is chosen', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);
      const fan = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, user.token, 'Midnight Dreams');
      await engage(request, trackId, fan, 'plays');
      await authenticatedPage.goto('/statistics');

      await statistics.period('1 Day').click();
      await expect(statistics.timelineSubtitle).toHaveText('Plays and downloads per hour');
      await statistics.timelinePlot.focus();
      await authenticatedPage.keyboard.press('ArrowLeft');

      await expect(statistics.kpiValues.first()).toHaveText('1');
      await expect(statistics.tooltipValues).toHaveText(['1', '0']);
      await expect(statistics.timelineLabels).toHaveCount(6);
    });

    test('tells an artist without plays that nothing was played yet', async ({
      authenticatedPage,
    }) => {
      const statistics: StatisticsPage = new StatisticsPage(authenticatedPage);

      await authenticatedPage.goto('/statistics');

      await expect(statistics.kpiValues).toHaveText(['0', '0', '0', '0']);
      await expect(statistics.emptyNotes).toHaveText([
        'No plays in this period yet',
        'No plays in this period yet',
        'No plays in this period yet',
      ]);
    });

    test('counts a download from the media library for the artist', async ({
      authenticatedPage,
      request,
      user,
    }) => {
      const library: MediaLibraryPage = new MediaLibraryPage(authenticatedPage);
      const artist = await registerUser();
      const trackId: number = await uploadApprovedTrack(request, artist.token, 'Midnight Dreams');
      await engage(request, trackId, user, 'like');
      await authenticatedPage.goto('/media-library');
      const download = authenticatedPage.waitForEvent('download');

      await library.chooseAction('Midnight Dreams', 'Download Track');

      expect((await download).suggestedFilename()).toBe('Ada Lovelace - Midnight Dreams.wav');
      await expect
        .poll(async () => (await statisticsOf(request, artist.token)).current.downloads)
        .toBe(1);
    });
  });
});
