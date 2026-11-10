import { Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../shared/pipes/date-time/date-time.pipe';
import { TrackService } from '../../services/track-service/track.service';

import type { ResourceRef } from '@angular/core';
import type { IRejectionReason } from '../../../core/models/track.model';
import type { ITrackDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-rejection-reason-modal',
  imports: [ButtonComponent, SpinnerComponent, TranslatePipe, DateTimePipe],
  templateUrl: './rejection-reason-modal.component.html',
  styleUrl: './rejection-reason-modal.component.scss',
})
export class RejectionReasonModalComponent {
  private readonly trackService: TrackService = inject(TrackService);

  protected readonly data: ITrackDialogData = inject<ITrackDialogData>(DIALOG_DATA);

  protected readonly reason: ResourceRef<IRejectionReason | undefined> = rxResource({
    params: () => this.data.trackId,
    stream: ({ params }: { params: number }) => this.trackService.getRejectionReason(params),
  });
}
