import { DestroyRef, inject, Service } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { ModalSizeEnum } from '../../../core/enums/modal-size.enum';
import { TrackActionEnum } from '../../../core/enums/track-action.enum';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { MediaLibraryPageActions } from '../../../store/ui/media-library-page.actions';
import { TrackDetailsModalComponent } from '../../dialogs/track-details-modal/track-details-modal.component';
import { ReportTrackModalComponent } from '../../dialogs/report-track-modal/report-track-modal.component';
import { TRACK_ACTION_OPTIONS } from '../../constants/my-uploads.constant';

import type { ITrack } from '../../../core/models/track.model';
import type {
  ITrackDetailsDialogData,
  ITrackReportDialogData,
} from '../../models/track-dialog.model';

@Service()
export class LibraryTrackActionsService {
  private readonly store: Store = inject(Store);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly handlers: Readonly<Partial<Record<TrackActionEnum, (track: ITrack) => void>>> = {
    [TrackActionEnum.DETAILS]: (track: ITrack) => {
      this.openDetails(track);
    },
    [TrackActionEnum.REPORT]: (track: ITrack) => {
      this.openReport(track);
    },
    [TrackActionEnum.REMOVE_FROM_LIBRARY]: (track: ITrack) => {
      this.confirmRemoval(track);
    },
  };

  public run(track: ITrack, action: TrackActionEnum): void {
    this.handlers[action]?.(track);
  }

  private openDetails(track: ITrack): void {
    this.modalService.open<boolean, ITrackDetailsDialogData, TrackDetailsModalComponent>(
      TrackDetailsModalComponent,
      {
        title: TRACK_ACTION_OPTIONS[TrackActionEnum.DETAILS].label,
        iconClass: TRACK_ACTION_OPTIONS[TrackActionEnum.DETAILS].iconClass,
        size: ModalSizeEnum.LARGE,
        data: { trackId: track.id, isEditing: false, isLibrary: true },
      },
    );
  }

  private openReport(track: ITrack): void {
    this.modalService
      .open<boolean, ITrackReportDialogData, ReportTrackModalComponent>(ReportTrackModalComponent, {
        title: TRACK_ACTION_OPTIONS[TrackActionEnum.REPORT].label,
        iconClass: TRACK_ACTION_OPTIONS[TrackActionEnum.REPORT].iconClass,
        size: ModalSizeEnum.MEDIUM,
        data: { trackId: track.id, title: track.title, artistName: track.artistName },
      })
      .closed.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.store.dispatch(MediaLibraryPageActions.trackReported());
      });
  }

  private confirmRemoval(track: ITrack): void {
    this.modalService
      .confirm(
        {
          message: 'mediaLibrary.removeConfirm',
          description: 'mediaLibrary.removeDescription',
          confirmText: 'mediaLibrary.actions.remove',
          isDanger: true,
          messageParams: { title: track.title },
        },
        {
          title: TRACK_ACTION_OPTIONS[TrackActionEnum.REMOVE_FROM_LIBRARY].label,
          iconClass: TRACK_ACTION_OPTIONS[TrackActionEnum.REMOVE_FROM_LIBRARY].iconClass,
        },
      )
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.store.dispatch(MediaLibraryPageActions.removeConfirmed({ trackId: track.id }));
      });
  }
}
