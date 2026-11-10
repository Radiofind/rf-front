import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { PlaybackScheduleModalComponent } from './playback-schedule-modal.component';
import { TrackService } from '../../services/track-service/track.service';

import type { ComponentFixture } from '@angular/core/testing';
import type { IPlaybackSchedule } from '../../../core/models/track.model';

describe('PlaybackScheduleModalComponent', () => {
  const createFixture = async (
    schedule: IPlaybackSchedule,
  ): Promise<ComponentFixture<PlaybackScheduleModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [PlaybackScheduleModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { trackId: 42 } },
        { provide: TrackService, useValue: { getSchedule: () => of(schedule) } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<PlaybackScheduleModalComponent> = TestBed.createComponent(
      PlaybackScheduleModalComponent,
    );
    await fixture.whenStable();
    return fixture;
  };

  it('shows the slot length of the next airing', async () => {
    const fixture: ComponentFixture<PlaybackScheduleModalComponent> = await createFixture({
      airsAt: new Date(2026, 10, 11, 20, 0).toISOString(),
      durationSeconds: 214,
      pendingChange: null,
    });

    const element: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.airing__time')?.textContent.trim()).toBe('Nov 11, 2026 • 20:00');
    expect(element.querySelector('.airing__duration')?.textContent.trim()).toBe(
      'Slot length: 3:34',
    );
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('mentions the change that is under review', async () => {
    const fixture: ComponentFixture<PlaybackScheduleModalComponent> = await createFixture({
      airsAt: new Date(2026, 10, 11, 20, 0).toISOString(),
      durationSeconds: 214,
      pendingChange: {
        preferredAt: new Date(2026, 10, 20, 18, 0).toISOString(),
        comment: null,
        requestedAt: '2026-11-10T09:00:00Z',
      },
    });

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent.trim(),
    ).toBe('Your request to move it to Nov 20, 2026 • 18:00 is under review');
  });
});
