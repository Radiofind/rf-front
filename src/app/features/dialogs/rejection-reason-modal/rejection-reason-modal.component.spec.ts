import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';
import { RejectionReasonModalComponent } from './rejection-reason-modal.component';
import { TrackService } from '../../services/track-service/track.service';

import type { ComponentFixture } from '@angular/core/testing';
import type { Observable } from 'rxjs';
import type { IRejectionReason } from '../../../core/models/track.model';

describe('RejectionReasonModalComponent', () => {
  const createFixture = async (
    reason: Observable<IRejectionReason>,
  ): Promise<ComponentFixture<RejectionReasonModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [RejectionReasonModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { trackId: 42 } },
        { provide: TrackService, useValue: { getRejectionReason: () => reason } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<RejectionReasonModalComponent> = TestBed.createComponent(
      RejectionReasonModalComponent,
    );
    await fixture.whenStable();
    return fixture;
  };

  it('shows what the reviewer found', async () => {
    const fixture: ComponentFixture<RejectionReasonModalComponent> = await createFixture(
      of({
        summary: 'Audio quality below broadcast standard',
        details: 'Clipping in the chorus',
        reviewer: 'Radiofind review team',
        reviewedAt: '2026-11-10T09:00:00Z',
      }),
    );
    const element: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.rejection__summary')?.textContent.trim()).toBe(
      'Audio quality below broadcast standard',
    );
    expect(element.querySelector('.rejection__details')?.textContent.trim()).toBe(
      'Clipping in the chorus',
    );
  });

  it('offers to retry when the reason cannot be loaded', async () => {
    const fixture: ComponentFixture<RejectionReasonModalComponent> = await createFixture(
      throwError(() => new Error('offline')),
    );

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('We could not load this information');
  });
});
