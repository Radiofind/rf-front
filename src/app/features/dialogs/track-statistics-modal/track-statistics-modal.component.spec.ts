import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { TrackStatisticsModalComponent } from './track-statistics-modal.component';
import { TrackService } from '../../services/track-service/track.service';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrackStatistics } from '../../../core/models/track.model';

describe('TrackStatisticsModalComponent', () => {
  const createFixture = async (
    statistics: ITrackStatistics,
  ): Promise<ComponentFixture<TrackStatisticsModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TrackStatisticsModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { trackId: 42 } },
        { provide: TrackService, useValue: { getStatistics: () => of(statistics) } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<TrackStatisticsModalComponent> = TestBed.createComponent(
      TrackStatisticsModalComponent,
    );
    await fixture.whenStable();
    return fixture;
  };

  it('shows every figure of the track', async () => {
    const fixture: ComponentFixture<TrackStatisticsModalComponent> = await createFixture({
      playsCount: 1234,
      likesCount: 56,
      uniqueListeners: 1200,
      radioAirings: 34,
      listenersLast7Days: 12,
      listenersLast30Days: 80,
      lastListenedAt: null,
    });

    const tiles: string[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.stats__tile'),
      (tile: Element) =>
        `${tile.querySelector('.stats__value')?.textContent.trim() ?? ''} ${tile.querySelector('.stats__label')?.textContent.trim() ?? ''}`,
    );

    expect(tiles).toEqual([
      '1.2K Plays',
      '56 Likes',
      '1.2K Unique listeners',
      '34 Radio airings',
      '12 New listeners, 7 days',
      '80 New listeners, 30 days',
    ]);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.track-dialog__note')
        ?.textContent.trim(),
    ).toBe('Nobody has listened to this track yet');
  });
});
