import { DestroyRef, DOCUMENT, inject, PLATFORM_ID, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ModalSizeEnum } from '../../../core/enums/modal-size.enum';
import { TrackActionEnum } from '../../../core/enums/track-action.enum';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { MyUploadsPageActions } from '../../../store/ui/my-uploads-page.actions';
import { TrackDetailsModalComponent } from '../../dialogs/track-details-modal/track-details-modal.component';
import { TrackStatisticsModalComponent } from '../../dialogs/track-statistics-modal/track-statistics-modal.component';
import { PlaybackScheduleModalComponent } from '../../dialogs/playback-schedule-modal/playback-schedule-modal.component';
import { ScheduleChangeModalComponent } from '../../dialogs/schedule-change-modal/schedule-change-modal.component';
import { RejectionReasonModalComponent } from '../../dialogs/rejection-reason-modal/rejection-reason-modal.component';
import { TRACK_ACTION_OPTIONS } from '../../constants/my-uploads.constant';

import type { Action } from '@ngrx/store';
import type { ComponentType } from '@angular/cdk/overlay';
import type { ITrack } from '../../../core/models/track.model';
import type { IConfirmModalData } from '../../../shared/models/modal.model';
import type { ITrackDetailsDialogData, ITrackDialogData } from '../../models/track-dialog.model';

@Service()
export class TrackActionsService {
  private readonly store: Store = inject(Store);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly document: Document = inject(DOCUMENT);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly handlers: Readonly<Record<TrackActionEnum, (track: ITrack) => void>> = {
    [TrackActionEnum.DETAILS]: (track: ITrack) => {
      this.openDetails(track, false);
    },
    [TrackActionEnum.EDIT]: (track: ITrack) => {
      this.openDetails(track, true);
    },
    [TrackActionEnum.STATISTICS]: (track: ITrack) => {
      this.openDialog(TrackStatisticsModalComponent, track, TrackActionEnum.STATISTICS);
    },
    [TrackActionEnum.SCHEDULE]: (track: ITrack) => {
      this.openDialog(PlaybackScheduleModalComponent, track, TrackActionEnum.SCHEDULE);
    },
    [TrackActionEnum.REQUEST_SCHEDULE_CHANGE]: (track: ITrack) => {
      this.openDialog(
        ScheduleChangeModalComponent,
        track,
        TrackActionEnum.REQUEST_SCHEDULE_CHANGE,
        MyUploadsPageActions.scheduleChangeRequested(),
      );
    },
    [TrackActionEnum.REJECTION_REASON]: (track: ITrack) => {
      this.openDialog(RejectionReasonModalComponent, track, TrackActionEnum.REJECTION_REASON);
    },
    [TrackActionEnum.SUBMIT]: (track: ITrack) => {
      this.confirm(
        track,
        TrackActionEnum.SUBMIT,
        { message: 'trackDialogs.submitConfirm', confirmText: 'myUploads.actions.submit' },
        MyUploadsPageActions.submitConfirmed({ trackId: track.id, isResubmission: false }),
      );
    },
    [TrackActionEnum.RESUBMIT]: (track: ITrack) => {
      this.confirm(
        track,
        TrackActionEnum.RESUBMIT,
        {
          message: 'trackDialogs.resubmitConfirm',
          description: 'trackDialogs.resubmitDescription',
          confirmText: 'myUploads.actions.resubmit',
        },
        MyUploadsPageActions.submitConfirmed({ trackId: track.id, isResubmission: true }),
      );
    },
    [TrackActionEnum.CANCEL_SUBMISSION]: (track: ITrack) => {
      this.confirm(
        track,
        TrackActionEnum.CANCEL_SUBMISSION,
        {
          message: 'trackDialogs.cancelSubmissionConfirm',
          description: 'trackDialogs.cancelSubmissionDescription',
          confirmText: 'myUploads.actions.cancelSubmission',
        },
        MyUploadsPageActions.submissionCancelConfirmed({ trackId: track.id }),
      );
    },
    [TrackActionEnum.DOWNLOAD]: (track: ITrack) => {
      this.download(track);
    },
    [TrackActionEnum.DELETE]: (track: ITrack) => {
      this.confirm(
        track,
        TrackActionEnum.DELETE,
        {
          message: 'trackDialogs.deleteConfirm',
          description: 'trackDialogs.deleteDescription',
          confirmText: 'myUploads.actions.delete',
          isDanger: true,
        },
        MyUploadsPageActions.deleteConfirmed({ trackId: track.id }),
      );
    },
  };

  public run(track: ITrack, action: TrackActionEnum): void {
    this.handlers[action](track);
  }

  private openDetails(track: ITrack, isEditing: boolean): void {
    const action: TrackActionEnum = isEditing ? TrackActionEnum.EDIT : TrackActionEnum.DETAILS;

    this.modalService
      .open<boolean, ITrackDetailsDialogData, TrackDetailsModalComponent>(
        TrackDetailsModalComponent,
        {
          title: TRACK_ACTION_OPTIONS[action].label,
          iconClass: TRACK_ACTION_OPTIONS[action].iconClass,
          size: ModalSizeEnum.LARGE,
          data: { trackId: track.id, isEditing: isEditing },
        },
      )
      .closed.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.store.dispatch(MyUploadsPageActions.trackEdited());
      });
  }

  private openDialog<C>(
    component: ComponentType<C>,
    track: ITrack,
    action: TrackActionEnum,
    onSuccess?: Action,
  ): void {
    this.modalService
      .open<boolean, ITrackDialogData, C>(component, {
        title: TRACK_ACTION_OPTIONS[action].label,
        iconClass: TRACK_ACTION_OPTIONS[action].iconClass,
        size: ModalSizeEnum.MEDIUM,
        data: { trackId: track.id },
      })
      .closed.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (onSuccess) {
          this.store.dispatch(onSuccess);
        }
      });
  }

  private confirm(
    track: ITrack,
    action: TrackActionEnum,
    data: IConfirmModalData,
    onConfirm: Action,
  ): void {
    this.modalService
      .confirm(
        { ...data, messageParams: { title: track.title } },
        {
          title: TRACK_ACTION_OPTIONS[action].label,
          iconClass: TRACK_ACTION_OPTIONS[action].iconClass,
        },
      )
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.store.dispatch(onConfirm);
      });
  }

  private download(track: ITrack): void {
    if (!this.isBrowser || !track.audioUrl) {
      return;
    }

    const link: HTMLAnchorElement = this.document.createElement('a');
    link.href = `${track.audioUrl}${Constants.DOWNLOAD_QUERY_SUFFIX}`;
    link.rel = 'noopener';
    link.click();
  }
}
