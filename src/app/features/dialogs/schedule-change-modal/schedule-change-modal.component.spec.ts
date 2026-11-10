import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { ScheduleChangeModalComponent } from './schedule-change-modal.component';
import { TrackService } from '../../services/track-service/track.service';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { IPlaybackSchedule } from '../../../core/models/track.model';

describe('ScheduleChangeModalComponent', () => {
  const createFixture = async (
    schedule: IPlaybackSchedule,
    requestScheduleChange: ReturnType<typeof vi.fn> = vi.fn(),
    close: ReturnType<typeof vi.fn> = vi.fn(),
  ): Promise<ComponentFixture<ScheduleChangeModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ScheduleChangeModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { trackId: 42 } },
        { provide: DialogRef, useValue: { close: close } },
        {
          provide: TrackService,
          useValue: {
            getSchedule: () => of(schedule),
            requestScheduleChange: requestScheduleChange,
          },
        },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<ScheduleChangeModalComponent> = TestBed.createComponent(
      ScheduleChangeModalComponent,
    );
    await fixture.whenStable();
    return fixture;
  };

  it('asks for the preferred moment and sends it as a point in time', async () => {
    const requestScheduleChange = vi.fn().mockReturnValue(of({}));
    const close = vi.fn();
    const fixture: ComponentFixture<ScheduleChangeModalComponent> = await createFixture(
      { airsAt: '2026-11-11T20:00:00Z', durationSeconds: 214, pendingChange: null },
      requestScheduleChange,
      close,
    );
    const preferred: Date = new Date(2099, 0, 15);

    (
      fixture.debugElement.query(By.directive(DateFieldComponent))
        .componentInstance as DateFieldComponent
    ).value.set(preferred);
    (
      fixture.debugElement.query(By.directive(SelectFieldComponent))
        .componentInstance as SelectFieldComponent<string>
    ).value.set('18:00');
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[type="submit"]')!
      .click();
    await fixture.whenStable();

    expect(requestScheduleChange).toHaveBeenCalledExactlyOnceWith(42, {
      preferredAt: new Date(2099, 0, 15, 18).toISOString(),
      comment: null,
    });
    expect(close).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('does not offer a second request while one is under review', async () => {
    const fixture: ComponentFixture<ScheduleChangeModalComponent> = await createFixture({
      airsAt: '2026-11-11T20:00:00Z',
      durationSeconds: 214,
      pendingChange: {
        preferredAt: '2026-11-20T18:00:00Z',
        comment: null,
        requestedAt: '2026-11-10T09:00:00Z',
      },
    });

    expect((fixture.nativeElement as HTMLElement).querySelector('form')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')).not.toBeNull();
  });
});
