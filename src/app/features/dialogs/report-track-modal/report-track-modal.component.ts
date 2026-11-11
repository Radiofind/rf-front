import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { TrackService } from '../../services/track-service/track.service';
import { reportTrackFormSchema } from '../../schemas/report-track/report-track.schema';
import {
  MEDIA_LIBRARY_MESSAGES,
  TRACK_REPORT_COMMENT_MAX_LENGTH,
  TRACK_REPORT_COMMENT_ROWS,
  TRACK_REPORT_REASON_NEEDING_DETAILS,
  TRACK_REPORT_REASON_OPTIONS,
} from '../../constants/media-library.constant';

import type { Signal, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { TrackReportReasonEnum } from '../../../core/enums/track-report-reason.enum';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISelectOption } from '../../../shared/models/select-option.model';
import type { IReportTrackForm } from '../../models/report-track-form.model';
import type { ITrackReportDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-report-track-modal',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    InputFieldComponent,
    SelectFieldComponent,
    TranslatePipe,
  ],
  templateUrl: './report-track-modal.component.html',
  styleUrl: './report-track-modal.component.scss',
})
export class ReportTrackModalComponent {
  private readonly dialogRef: DialogRef<boolean, ReportTrackModalComponent> =
    inject<DialogRef<boolean, ReportTrackModalComponent>>(DialogRef);

  private readonly trackService: TrackService = inject(TrackService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly translationService: TranslationService = inject(TranslationService);

  protected readonly data: ITrackReportDialogData = inject<ITrackReportDialogData>(DIALOG_DATA);

  private readonly model: WritableSignal<IReportTrackForm> = signal<IReportTrackForm>({
    reason: Constants.EMPTY_STRING,
    comment: Constants.EMPTY_STRING,
  });

  protected readonly reportForm: FieldTree<IReportTrackForm> = form<IReportTrackForm>(
    this.model,
    reportTrackFormSchema,
    { submission: { action: () => this.send() } },
  );

  protected readonly reasonOptions: Signal<readonly ISelectOption<string>[]> = computed<
    readonly ISelectOption<string>[]
  >(() => this.translationService.translateOptions(TRACK_REPORT_REASON_OPTIONS));

  protected readonly isCommentRequired: Signal<boolean> = computed<boolean>(
    () => this.reportForm.reason().value() === TRACK_REPORT_REASON_NEEDING_DETAILS,
  );

  protected readonly isSendDisabled: Signal<boolean> = computed<boolean>(
    () => this.reportForm().invalid() || this.reportForm().submitting(),
  );

  protected readonly commentLimit: number = TRACK_REPORT_COMMENT_MAX_LENGTH;

  protected readonly commentRows: number = TRACK_REPORT_COMMENT_ROWS;

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  private async send(): Promise<undefined> {
    const { reason, comment }: IReportTrackForm = this.model();

    try {
      await firstValueFrom(
        this.trackService.report(this.data.trackId, {
          reason: reason as TrackReportReasonEnum,
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
      ? MEDIA_LIBRARY_MESSAGES.alreadyReported
      : MEDIA_LIBRARY_MESSAGES.actionFailed;
  }
}
