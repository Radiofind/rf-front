import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of } from 'rxjs';
import { TrackDetailsModalComponent } from './track-details-modal.component';
import { TrackService } from '../../services/track-service/track.service';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrackDetails } from '../../../core/models/track.model';

describe('TrackDetailsModalComponent', () => {
  const details: ITrackDetails = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    uploadedBy: 'Ada Lovelace',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.REJECTED,
    durationSeconds: 214,
    audioFormat: 'WAV',
    audioSizeBytes: 4404019,
    coverUrl: null,
    createdAt: '2025-04-28T14:32:00Z',
    updatedAt: '2025-04-29T10:00:00Z',
  };

  const createFixture = async (
    isEditing: boolean,
    edit: ReturnType<typeof vi.fn> = vi.fn(),
    close: ReturnType<typeof vi.fn> = vi.fn(),
  ): Promise<ComponentFixture<TrackDetailsModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [TrackDetailsModalComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { trackId: 42, isEditing: isEditing } },
        { provide: DialogRef, useValue: { close: close } },
        { provide: TrackService, useValue: { getDetails: () => of(details), edit: edit } },
      ],
    }).compileComponents();
    const fixture: ComponentFixture<TrackDetailsModalComponent> = TestBed.createComponent(
      TrackDetailsModalComponent,
    );
    await fixture.whenStable();
    return fixture;
  };

  const element = (fixture: ComponentFixture<TrackDetailsModalComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  it('shows who uploaded the track, its status and its audio file', async () => {
    const fixture: ComponentFixture<TrackDetailsModalComponent> = await createFixture(false);

    const values: string[] = Array.from(
      element(fixture).querySelectorAll('.track-dialog__value'),
      (value: Element) => value.textContent.trim(),
    );

    expect(element(fixture).querySelector('.details__status')?.textContent.trim()).toBe('Rejected');
    expect(values).toContain('Ada Lovelace');
    expect(values).toContain('WAV · 4.2 MB');
    expect(values).toContain('No description');
  });

  it('saves the changed title and closes as saved', async () => {
    const edit = vi.fn().mockReturnValue(of(details));
    const close = vi.fn();
    const fixture: ComponentFixture<TrackDetailsModalComponent> = await createFixture(
      true,
      edit,
      close,
    );
    const title: HTMLInputElement = element(fixture).querySelector<HTMLInputElement>(
      'input[placeholder="Enter track title..."]',
    )!;

    title.value = '  Midnight Dreams (Remaster)  ';
    title.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();

    expect(edit).toHaveBeenCalledExactlyOnceWith(42, {
      title: 'Midnight Dreams (Remaster)',
      genres: ['AMBIENT'],
      description: null,
      cover: null,
      removeCover: false,
    });
    expect(close).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('keeps saving disabled until something changes', async () => {
    const fixture: ComponentFixture<TrackDetailsModalComponent> = await createFixture(true);

    expect(
      element(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled,
    ).toBe(true);
  });
});
