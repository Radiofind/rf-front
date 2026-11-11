import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { LibraryTrackActionsService } from './library-track-actions.service';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { TrackActionEnum } from '../../../core/enums/track-action.enum';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';
import { MediaLibraryPageActions } from '../../../store/ui/media-library-page.actions';
import { TrackDetailsModalComponent } from '../../dialogs/track-details-modal/track-details-modal.component';
import { ReportTrackModalComponent } from '../../dialogs/report-track-modal/report-track-modal.component';

import type { ITrack } from '../../../core/models/track.model';

describe('LibraryTrackActionsService', () => {
  const track: ITrack = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.APPROVED,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    playsCount: 0,
    likesCount: 1,
    liked: true,
    own: false,
    createdAt: '2025-04-28T14:32:00Z',
    likedAt: '2025-05-01T09:00:00Z',
  };

  let open: ReturnType<typeof vi.fn>;
  let confirm: ReturnType<typeof vi.fn>;
  let service: LibraryTrackActionsService;
  let dispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    open = vi.fn().mockReturnValue({ closed: of(true) });
    confirm = vi.fn().mockReturnValue(of(true));
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        { provide: ModalService, useValue: { open: open, confirm: confirm } },
      ],
    });
    service = TestBed.inject(LibraryTrackActionsService);
    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the details of the library track, never for editing', () => {
    service.run(track, TrackActionEnum.DETAILS);

    expect(open).toHaveBeenCalledWith(
      TrackDetailsModalComponent,
      expect.objectContaining({ data: { trackId: 42, isEditing: false, isLibrary: true } }),
    );
  });

  it('asks for a report about the named track and thanks once it was sent', () => {
    service.run(track, TrackActionEnum.REPORT);

    expect(open).toHaveBeenCalledWith(
      ReportTrackModalComponent,
      expect.objectContaining({
        data: { trackId: 42, title: 'Midnight Dreams', artistName: 'Neon Lights' },
      }),
    );
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(MediaLibraryPageActions.trackReported());
  });

  it('thanks nobody when the report dialog is closed without sending', () => {
    open.mockReturnValue({ closed: of(false) });

    service.run(track, TrackActionEnum.REPORT);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('removes a track from the library only after the listener confirms', () => {
    service.run(track, TrackActionEnum.REMOVE_FROM_LIBRARY);

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'mediaLibrary.removeConfirm',
        messageParams: { title: 'Midnight Dreams' },
        isDanger: true,
      }),
      { title: 'mediaLibrary.actions.remove', iconClass: 'bx bx-heart-break' },
    );
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      MediaLibraryPageActions.removeConfirmed({ trackId: 42 }),
    );
  });

  it('keeps the track when the listener declines the removal', () => {
    confirm.mockReturnValue(of(false));

    service.run(track, TrackActionEnum.REMOVE_FROM_LIBRARY);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
