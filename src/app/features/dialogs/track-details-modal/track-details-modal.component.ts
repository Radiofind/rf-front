import { Component, computed, inject, linkedSignal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CheckboxFieldComponent } from '../../../shared/components/checkbox-field/checkbox-field.component';
import { ChipsFieldComponent } from '../../../shared/components/chips-field/chips-field.component';
import { FileDropzoneComponent } from '../../../shared/components/file-dropzone/file-dropzone.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { DateTimePipe } from '../../../shared/pipes/date-time/date-time.pipe';
import { formatPlaybackTime } from '../../../shared/helpers/player/player.helpers';
import { formatFileSize } from '../../../shared/helpers/number/number.helpers';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { TrackService } from '../../services/track-service/track.service';
import { editTrackFormSchema } from '../../schemas/edit-track/edit-track.schema';
import { GENRE_OPTIONS } from '../../constants/genre.constant';
import {
  EDIT_DESCRIPTION_ROWS,
  GENRE_LABELS,
  MY_UPLOADS_MESSAGES,
  TRACK_STATUS_LABELS,
} from '../../constants/my-uploads.constant';
import {
  COVER_ACCEPT,
  COVER_FILE_RULES,
  MAX_TRACK_GENRES,
  TRACK_DESCRIPTION_MAX_LENGTH,
  UPLOAD_TRACK_MESSAGES,
} from '../../constants/upload-track.constant';

import type { ResourceRef, Signal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IEditTrackData, ITrackDetails } from '../../../core/models/track.model';
import type { TrackStatus } from '../../../core/types/track-status.type';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISelectOption } from '../../../shared/models/select-option.model';
import type { IEditTrackForm } from '../../models/edit-track-form.model';
import type { ITrackDetailsDialogData } from '../../models/track-dialog.model';

@Component({
  selector: 'app-track-details-modal',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    CheckboxFieldComponent,
    ChipsFieldComponent,
    FileDropzoneComponent,
    InputFieldComponent,
    SpinnerComponent,
    TranslatePipe,
    DateTimePipe,
  ],
  templateUrl: './track-details-modal.component.html',
  styleUrl: './track-details-modal.component.scss',
})
export class TrackDetailsModalComponent {
  private readonly dialogRef: DialogRef<boolean, TrackDetailsModalComponent> =
    inject<DialogRef<boolean, TrackDetailsModalComponent>>(DialogRef);

  private readonly trackService: TrackService = inject(TrackService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly translationService: TranslationService = inject(TranslationService);

  protected readonly data: ITrackDetailsDialogData = inject<ITrackDetailsDialogData>(DIALOG_DATA);

  protected readonly details: ResourceRef<ITrackDetails | undefined> = rxResource({
    params: () => this.data.trackId,
    stream: ({ params }: { params: number }) =>
      this.data.isLibrary
        ? this.trackService.getLibraryDetails(params)
        : this.trackService.getDetails(params),
  });

  private readonly editModel = linkedSignal<IEditTrackForm>(() => {
    const details: ITrackDetails | undefined = this.details.value();

    return {
      title: details?.title ?? Constants.EMPTY_STRING,
      genres: [...(details?.genres ?? [])],
      description: details?.description ?? Constants.EMPTY_STRING,
      cover: null,
      removeCover: false,
    };
  });

  protected readonly editForm: FieldTree<IEditTrackForm> = form<IEditTrackForm>(
    this.editModel,
    editTrackFormSchema,
    { submission: { action: () => this.save() } },
  );

  protected readonly genreOptions: Signal<readonly ISelectOption<string>[]> = computed<
    readonly ISelectOption<string>[]
  >(() => this.translationService.translateOptions(GENRE_OPTIONS));

  protected readonly isSaveDisabled: Signal<boolean> = computed<boolean>(
    () => !this.editForm().dirty() || this.editForm().invalid() || this.editForm().submitting(),
  );

  protected readonly coverAccept: string = COVER_ACCEPT;

  protected readonly coverMaxSizeMb: number = COVER_FILE_RULES.maxSizeMb;

  protected readonly maxGenres: number = MAX_TRACK_GENRES;

  protected readonly descriptionLimit: number = TRACK_DESCRIPTION_MAX_LENGTH;

  protected readonly descriptionRows: number = EDIT_DESCRIPTION_ROWS;

  protected statusLabel(status: TrackStatus): TranslationKey {
    return TRACK_STATUS_LABELS[status];
  }

  protected genreLabel(genre: string): TranslationKey | null {
    return GENRE_LABELS.get(genre) ?? null;
  }

  protected duration(seconds: number | null): string {
    return seconds === null ? Constants.EMPTY_VALUE_DASH : formatPlaybackTime(seconds);
  }

  protected fileSize(bytes: number): string {
    return formatFileSize(bytes, this.translationService.locale());
  }

  public onClose(): void {
    this.dialogRef.close(false);
  }

  private async save(): Promise<undefined> {
    const model: IEditTrackForm = this.editModel();
    const data: IEditTrackData = {
      title: model.title.trim(),
      genres: model.genres,
      description: model.description.trim() || null,
      cover: model.cover,
      removeCover: model.removeCover && !model.cover,
    };

    try {
      await firstValueFrom(this.trackService.edit(this.data.trackId, data));
      this.dialogRef.close(true);
    } catch (error: unknown) {
      this.snackbarService.error(this.saveErrorMessage(error));
    }

    return undefined;
  }

  private saveErrorMessage(error: unknown): TranslationKey {
    if (!(error instanceof HttpErrorResponse)) {
      return MY_UPLOADS_MESSAGES.actionFailed;
    }

    switch (error.status) {
      case Constants.HTTP_CONTENT_TOO_LARGE_STATUS:
        return UPLOAD_TRACK_MESSAGES.tooLarge;
      case Constants.HTTP_UNSUPPORTED_MEDIA_TYPE_STATUS:
        return UPLOAD_TRACK_MESSAGES.unsupportedFormat;
      default:
        return MY_UPLOADS_MESSAGES.actionFailed;
    }
  }
}
