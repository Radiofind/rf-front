import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TrackService } from './track.service';
import { ApiService } from '../../../core/services/api/api.service';

import type { ITrack, IUploadTrackData } from '../../../core/models/track.model';

describe('TrackService', () => {
  it('uploads the track through the API', async () => {
    const data: IUploadTrackData = {
      title: 'Midnight Dreams',
      genres: ['DEEP_HOUSE'],
      description: null,
      audio: new File(['audio'], 'song.mp3'),
      cover: null,
    };
    const track = { id: 42 } as ITrack;
    const uploadTrack: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(track));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { uploadTrack: uploadTrack } }],
    });

    const result: ITrack = await firstValueFrom(TestBed.inject(TrackService).uploadTrack(data));

    expect(uploadTrack).toHaveBeenCalledExactlyOnceWith(data);
    expect(result).toBe(track);
  });
});
