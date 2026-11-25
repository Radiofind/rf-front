import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TrackDownloadService } from './track-download.service';
import { TrackService } from '../track-service/track.service';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';

import type { ITrack } from '../../../core/models/track.model';

describe('TrackDownloadService', () => {
  const track: ITrack = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    artistPublicId: '6f1c2b4e-3d5a-4c8e-9b7f-1a2b3c4d5e6f',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.APPROVED,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    playsCount: 0,
    likesCount: 0,
    liked: true,
    own: false,
    likedAt: null,
    createdAt: '2025-04-28T14:32:00Z',
  };

  let recordDownload: ReturnType<typeof vi.fn>;
  let click: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    recordDownload = vi.fn().mockReturnValue(of(undefined));
    click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [{ provide: TrackService, useValue: { recordDownload: recordDownload } }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads the audio through its signed link', () => {
    TestBed.inject(TrackDownloadService).download(track);

    expect((click.mock.contexts[0] as HTMLAnchorElement).getAttribute('href')).toBe(
      '/api/tracks/42/audio?token=signed&download=true',
    );
  });

  it('counts the download for the statistics of the artist', () => {
    TestBed.inject(TrackDownloadService).download(track);

    expect(recordDownload).toHaveBeenCalledExactlyOnceWith(42);
  });

  it('still downloads when the download cannot be counted', () => {
    recordDownload.mockReturnValue(throwError(() => new Error('offline')));

    TestBed.inject(TrackDownloadService).download(track);

    expect(click).toHaveBeenCalledOnce();
  });

  it('counts nothing when the track has no audio to download', () => {
    TestBed.inject(TrackDownloadService).download({ ...track, audioUrl: null });

    expect(click).not.toHaveBeenCalled();
    expect(recordDownload).not.toHaveBeenCalled();
  });
});
