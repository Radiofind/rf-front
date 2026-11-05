import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FileDropzoneComponent } from '../../../shared/components/file-dropzone/file-dropzone.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { ChipsFieldComponent } from '../../../shared/components/chips-field/chips-field.component';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { UserService } from '../../../features/services/user-service/user.service';
import { TrackService } from '../../../features/services/track-service/track.service';
import { NotificationStateService } from '../../../features/services/notification-state-service/notification-state.service';
import { uploadTrackFormSchema } from '../../../features/schemas/upload-track/upload-track.schema';
import { GENRE_OPTIONS } from '../../../features/constants/genre.constant';
import {
  AUDIO_ACCEPT,
  AUDIO_FILE_RULES,
  COVER_ACCEPT,
  MAX_TRACK_GENRES,
  COVER_FILE_RULES,
  TRACK_DESCRIPTION_MAX_LENGTH,
  TRACK_DESCRIPTION_ROWS,
  UPLOAD_TIPS,
  UPLOAD_TRACK_MESSAGES,
} from '../../../features/constants/upload-track.constant';
import {
  ARTIST_TYPE_LABELS,
  ARTIST_TYPE_TEXTS,
} from '../../../features/constants/artist-type.constant';
import { ArtistTypeRequestEnum } from '../../../core/enums/artist-type.enum';
import { Constants } from '../../../core/constants/constants';
import { Links } from '../../../core/constants/links';

import type { OnInit, Signal, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IUserProfileData } from '../../../core/models/user.model';
import type { IUploadTrackData } from '../../../core/models/track.model';
import type { IHasUnsavedChanges } from '../../../core/models/unsaved-changes.model';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { ArtistTypeRequest } from '../../../core/types/artist-type-request.type';
import type { ISelectOption } from '../../../shared/models/select-option.model';
import type {
  IUploadTip,
  IUploadTrackForm,
} from '../../../features/models/upload-track-form.model';

@Component({
  selector: 'app-upload-track-page',
  templateUrl: './upload-track-page.component.html',
  styleUrl: './upload-track-page.component.scss',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    ChipsFieldComponent,
    FileDropzoneComponent,
    InputFieldComponent,
    TranslatePipe,
  ],
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class UploadTrackPageComponent implements OnInit, IHasUnsavedChanges {
  private readonly userService: UserService = inject(UserService);

  private readonly trackService: TrackService = inject(TrackService);

  private readonly notificationStateService: NotificationStateService =
    inject(NotificationStateService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly router: Router = inject(Router);

  protected readonly audioAccept: WritableSignal<string> = signal<string>(AUDIO_ACCEPT);

  protected readonly coverAccept: WritableSignal<string> = signal<string>(COVER_ACCEPT);

  protected readonly audioMaxSizeMb: WritableSignal<number> = signal<number>(
    AUDIO_FILE_RULES.maxSizeMb,
  );

  protected readonly coverMaxSizeMb: WritableSignal<number> = signal<number>(
    COVER_FILE_RULES.maxSizeMb,
  );

  protected readonly descriptionLimit: WritableSignal<number> = signal<number>(
    TRACK_DESCRIPTION_MAX_LENGTH,
  );

  protected readonly descriptionRows: WritableSignal<number> =
    signal<number>(TRACK_DESCRIPTION_ROWS);

  protected readonly tips: WritableSignal<readonly IUploadTip[]> =
    signal<readonly IUploadTip[]>(UPLOAD_TIPS);

  protected readonly maxGenres: WritableSignal<number> = signal<number>(MAX_TRACK_GENRES);

  protected readonly artistName: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  private readonly artistType: WritableSignal<ArtistTypeRequest> = signal<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  protected readonly artistLabel: Signal<TranslationKey> = computed<TranslationKey>(
    () => ARTIST_TYPE_TEXTS[ARTIST_TYPE_LABELS[this.artistType()]].label,
  );

  private readonly isSaved: WritableSignal<boolean> = signal<boolean>(false);

  private readonly uploadTrackModel: WritableSignal<IUploadTrackForm> = signal<IUploadTrackForm>({
    title: Constants.EMPTY_STRING,
    genres: [],
    description: Constants.EMPTY_STRING,
    audio: null,
    cover: null,
  });

  protected readonly uploadTrackForm: FieldTree<IUploadTrackForm> = form<IUploadTrackForm>(
    this.uploadTrackModel,
    uploadTrackFormSchema,
    {
      submission: { action: () => this.uploadTrack() },
    },
  );

  protected readonly genreOptions: Signal<readonly ISelectOption<string>[]> = computed<
    readonly ISelectOption<string>[]
  >(() => this.translationService.translateOptions(GENRE_OPTIONS));

  protected readonly isUploadDisabled: Signal<boolean> = computed<boolean>(
    () => this.uploadTrackForm().invalid() || this.uploadTrackForm().submitting(),
  );

  public ngOnInit(): void {
    void this.loadArtistName();
  }

  public hasUnsavedChanges(): boolean {
    return !this.isSaved() && this.uploadTrackForm().dirty();
  }

  public onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  private async loadArtistName(): Promise<void> {
    try {
      const profile: IUserProfileData = await firstValueFrom(this.userService.getUserProfileData());
      const artistName: string = profile.artistName?.trim() ?? Constants.EMPTY_STRING;
      this.artistType.set(profile.artistType ?? ArtistTypeRequestEnum.ARTIST);
      this.artistName.set(
        artistName ? artistName : profile.name + Constants.EMPTY_SPACE_STRING + profile.surname,
      );
    } catch {
      this.snackbarService.error(Constants.PROFILE_LOAD_FAILED);
    }
  }

  private async uploadTrack(): Promise<undefined> {
    const data: IUploadTrackData | null = this.toUploadData(this.uploadTrackModel());

    if (!data) {
      return undefined;
    }

    try {
      await firstValueFrom(this.trackService.uploadTrack(data));
      this.isSaved.set(true);
      this.snackbarService.success(UPLOAD_TRACK_MESSAGES.uploaded);
      void this.notificationStateService.loadNotifications();
      await this.router.navigate([Links.PROFILE_URL]);
    } catch (error: unknown) {
      this.snackbarService.error(this.uploadErrorMessage(error));
    }

    return undefined;
  }

  private uploadErrorMessage(error: unknown): TranslationKey {
    if (!(error instanceof HttpErrorResponse)) {
      return UPLOAD_TRACK_MESSAGES.uploadFailed;
    }

    switch (error.status) {
      case Constants.HTTP_CONTENT_TOO_LARGE_STATUS:
        return UPLOAD_TRACK_MESSAGES.tooLarge;
      case Constants.HTTP_UNSUPPORTED_MEDIA_TYPE_STATUS:
        return UPLOAD_TRACK_MESSAGES.unsupportedFormat;
      default:
        return UPLOAD_TRACK_MESSAGES.uploadFailed;
    }
  }

  private toUploadData(model: IUploadTrackForm): IUploadTrackData | null {
    if (!model.audio) {
      return null;
    }

    return {
      title: model.title.trim(),
      genres: model.genres,
      description: model.description.trim() || null,
      audio: model.audio,
      cover: model.cover,
    };
  }
}
