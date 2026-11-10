import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { TrackActionsService } from './track-actions.service';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { TrackActionEnum } from '../../../core/enums/track-action.enum';
import { TrackStatusEnum } from '../../../core/enums/track-status.enum';
import { MyUploadsPageActions } from '../../../store/ui/my-uploads-page.actions';
import { TrackDetailsModalComponent } from '../../dialogs/track-details-modal/track-details-modal.component';
import { TrackStatisticsModalComponent } from '../../dialogs/track-statistics-modal/track-statistics-modal.component';

import type { ITrack } from '../../../core/models/track.model';

describe('TrackActionsService', () => {
  const track: ITrack = {
    id: 42,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.PENDING_REVIEW,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: null,
    audioUrl: '/api/tracks/42/audio?token=signed',
    playsCount: 0,
    likesCount: 0,
    liked: false,
    createdAt: '2025-04-28T14:32:00Z',
  };

  let open: ReturnType<typeof vi.fn>;
  let confirm: ReturnType<typeof vi.fn>;
  let service: TrackActionsService;
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
    service = TestBed.inject(TrackActionsService);
    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes a track only after the user confirms', () => {
    service.run(track, TrackActionEnum.DELETE);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      MyUploadsPageActions.deleteConfirmed({ trackId: 42 }),
    );
  });

  it('asks about the track by name under the title and icon of the action', () => {
    service.run(track, TrackActionEnum.DELETE);

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'trackDialogs.deleteConfirm',
        messageParams: { title: 'Midnight Dreams' },
        isDanger: true,
      }),
      { title: 'myUploads.actions.delete', iconClass: 'bx bx-trash' },
    );
  });

  it('keeps the track when the user declines', () => {
    confirm.mockReturnValue(of(false));

    service.run(track, TrackActionEnum.CANCEL_SUBMISSION);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('asks to cancel a submission without warning colours, since it can be undone', () => {
    service.run(track, TrackActionEnum.CANCEL_SUBMISSION);

    expect(confirm).toHaveBeenCalledWith(
      expect.not.objectContaining({ isDanger: true }),
      expect.anything(),
    );
  });

  it('resubmits a rejected track as a resubmission', () => {
    service.run(track, TrackActionEnum.RESUBMIT);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      MyUploadsPageActions.submitConfirmed({ trackId: 42, isResubmission: true }),
    );
  });

  it('opens the details for editing and reports a saved edit', () => {
    service.run(track, TrackActionEnum.EDIT);

    expect(open).toHaveBeenCalledWith(
      TrackDetailsModalComponent,
      expect.objectContaining({ data: { trackId: 42, isEditing: true } }),
    );
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(MyUploadsPageActions.trackEdited());
  });

  it('reports nothing when the details are closed without saving', () => {
    open.mockReturnValue({ closed: of(false) });

    service.run(track, TrackActionEnum.DETAILS);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows the statistics of the track', () => {
    service.run(track, TrackActionEnum.STATISTICS);

    expect(open).toHaveBeenCalledWith(
      TrackStatisticsModalComponent,
      expect.objectContaining({ data: { trackId: 42 } }),
    );
  });

  it('reports a sent schedule change request', () => {
    service.run(track, TrackActionEnum.REQUEST_SCHEDULE_CHANGE);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      MyUploadsPageActions.scheduleChangeRequested(),
    );
  });

  it('downloads the audio through its signed link', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    service.run(track, TrackActionEnum.DOWNLOAD);

    expect((click.mock.contexts[0] as HTMLAnchorElement).getAttribute('href')).toBe(
      '/api/tracks/42/audio?token=signed&download=true',
    );
  });
});
