import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../shared/pipes/date-time/date-time.pipe';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { TrackService } from '../../services/track-service/track.service';
import { scheduleChangeFormSchema } from '../../schemas/schedule-change/schedule-change.schema';
import {
  MY_UPLOADS_MESSAGES,
  SCHEDULE_CHANGE_COMMENT_MAX_LENGTH,
  SCHEDULE_CHANGE_COMMENT_ROWS,
  SCHEDULE_CHANGE_HOURS,
} from '../../constants/my-uploads.constant';

import type { ResourceRef, Signal, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IPlaybackSchedule } from '../../../core/models/track.model';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISelectOption } from '../../../shared/models/select-option.model';
import type { IScheduleChangeForm } from '../../models/schedule-change-form.model';
import type { ITrackDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-schedule-change-modal',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    DateFieldComponent,
    InputFieldComponent,
    SelectFieldComponent,
    SpinnerComponent,
    TranslatePipe,
    DateTimePipe,
  ],
  templateUrl: './schedule-change-modal.component.html',
  styleUrl: './schedule-change-modal.component.scss',
})
export class ScheduleChangeModalComponent {
  private readonly dialogRef: DialogRef<boolean, ScheduleChangeModalComponent> =
    inject<DialogRef<boolean, ScheduleChangeModalComponent>>(DialogRef);

  private readonly trackService: TrackService = inject(TrackService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  protected readonly data: ITrackDialogData = inject<ITrackDialogData>(DIALOG_DATA);

  protected readonly schedule: ResourceRef<IPlaybackSchedule | undefined> = rxResource({
    params: () => this.data.trackId,
    stream: ({ params }: { params: number }) => this.trackService.getSchedule(params),
  });

  private readonly model: WritableSignal<IScheduleChangeForm> = signal<IScheduleChangeForm>({
    date: null,
    time: Constants.EMPTY_STRING,
    comment: Constants.EMPTY_STRING,
  });

  protected readonly changeForm: FieldTree<IScheduleChangeForm> = form<IScheduleChangeForm>(
    this.model,
    scheduleChangeFormSchema,
    { submission: { action: () => this.send() } },
  );

  protected readonly hourOptions: readonly ISelectOption<string>[] = SCHEDULE_CHANGE_HOURS.map(
    (hour: string) => ({ value: hour, label: hour }),
  );

  protected readonly commentLimit: number = SCHEDULE_CHANGE_COMMENT_MAX_LENGTH;

  protected readonly commentRows: number = SCHEDULE_CHANGE_COMMENT_ROWS;

  protected readonly isSendDisabled: Signal<boolean> = computed<boolean>(
    () => this.changeForm().invalid() || this.changeForm().submitting(),
  );

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  private async send(): Promise<undefined> {
    const { date, time, comment }: IScheduleChangeForm = this.model();

    if (!date) {
      return undefined;
    }

    const [hours = Constants.ZERO]: number[] = time.split(Constants.TIME_SEPARATOR).map(Number);
    const preferredAt: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);

    try {
      await firstValueFrom(
        this.trackService.requestScheduleChange(this.data.trackId, {
          preferredAt: preferredAt.toISOString(),
          comment: comment.trim() || null,
        }),
      );
      this.dialogRef.close(true);
    } catch (error: unknown) {
      this.snackbarService.error(this.sendErrorMessage(error));
    }

    return undefined;
  }

  private sendErrorMessage(error: unknown): TranslationKey {
    return error instanceof HttpErrorResponse && error.status === Constants.HTTP_CONFLICT_STATUS
      ? MY_UPLOADS_MESSAGES.scheduleChangeAlreadyPending
      : MY_UPLOADS_MESSAGES.actionFailed;
  }
}
