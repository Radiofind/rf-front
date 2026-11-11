import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';
import { ReportTrackModalComponent } from './report-track-modal.component';
import { TrackService } from '../../services/track-service/track.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('ReportTrackModalComponent', () => {
  const createFixture = async (
    report: ReturnType<typeof vi.fn>,
    close: ReturnType<typeof vi.fn> = vi.fn(),
    error: ReturnType<typeof vi.fn> = vi.fn(),
  ): Promise<ComponentFixture<ReportTrackModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ReportTrackModalComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: { trackId: 42, title: 'Midnight Dreams', artistName: 'Neon Lights' },
        },
        { provide: DialogRef, useValue: { close: close } },
        { provide: TrackService, useValue: { report: report } },
        { provide: SnackbarService, useValue: { error: error } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<ReportTrackModalComponent> =
      TestBed.createComponent(ReportTrackModalComponent);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<ReportTrackModalComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const chooseReason = async (
    fixture: ComponentFixture<ReportTrackModalComponent>,
    reason: string,
  ): Promise<void> => {
    (
      fixture.debugElement.query(By.directive(SelectFieldComponent))
        .componentInstance as SelectFieldComponent<string>
    ).value.set(reason);
    await fixture.whenStable();
  };

  const describeProblem = async (
    fixture: ComponentFixture<ReportTrackModalComponent>,
    text: string,
  ): Promise<void> => {
    const comment: HTMLTextAreaElement = element(fixture).querySelector('textarea')!;
    comment.value = text;
    comment.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const submit = async (fixture: ComponentFixture<ReportTrackModalComponent>): Promise<void> => {
    element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  };

  it('names the reported track and its artist', async () => {
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(vi.fn());

    expect(element(fixture).querySelector('.track-dialog__note')?.textContent).toContain(
      '"Midnight Dreams" by Neon Lights',
    );
  });

  it('sends the chosen reason with the trimmed details and closes as sent', async () => {
    const report = vi.fn().mockReturnValue(of(undefined));
    const close = vi.fn();
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(report, close);

    await chooseReason(fixture, 'SPAM');
    await describeProblem(fixture, '  Same loop as yesterday  ');
    await submit(fixture);

    expect(report).toHaveBeenCalledExactlyOnceWith(42, {
      reason: 'SPAM',
      comment: 'Same loop as yesterday',
    });
    expect(close).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('sends a report without details when the reason speaks for itself', async () => {
    const report = vi.fn().mockReturnValue(of(undefined));
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(report);

    await chooseReason(fixture, 'POOR_AUDIO_QUALITY');
    await submit(fixture);

    expect(report).toHaveBeenCalledExactlyOnceWith(42, {
      reason: 'POOR_AUDIO_QUALITY',
      comment: null,
    });
  });

  it('cannot be sent before a reason is chosen', async () => {
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(vi.fn());

    expect(
      element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    ).toBe(true);
  });

  it('needs details when the reason is "Other"', async () => {
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(vi.fn());

    await chooseReason(fixture, 'OTHER');

    expect(
      element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
    ).toBe(true);
  });

  it('tells the listener a track can be reported only once', async () => {
    const report = vi
      .fn()
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const close = vi.fn();
    const error = vi.fn();
    const fixture: ComponentFixture<ReportTrackModalComponent> = await createFixture(
      report,
      close,
      error,
    );

    await chooseReason(fixture, 'SPAM');
    await submit(fixture);

    expect(error).toHaveBeenCalledExactlyOnceWith('messages.trackAlreadyReported');
    expect(close).not.toHaveBeenCalled();
  });
});
