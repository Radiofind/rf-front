import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ChipsFieldComponent } from '../../../../shared/components/chips-field/chips-field.component';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { RadioFieldComponent } from '../../../../shared/components/radio-field/radio-field.component';
import { SnackbarService } from '../../../../shared/services/snackbar-service/snackbar.service';
import { UserService } from '../../../../features/services/user-service/user.service';
import { AuthService } from '../../../../features/services/auth-service/auth.service';
import { editProfileFormSchema } from '../../../../features/schemas/edit-profile/edit-profile.schema';
import { ProfileValidationMessages } from '../../../../features/constants/profile-error-messages.constant';
import {
  ARTIST_TYPES,
  DEFAULT_ARTIST_TYPE,
} from '../../../../features/constants/auth-content.constant';
import { ARTIST_TYPE_LABELS } from '../../../../features/constants/artist-type.constant';
import {
  EMPTY_SOCIAL_LINKS_FORM,
  GENRE_OPTIONS,
  SOCIAL_LINKS,
} from '../../../../features/constants/edit-profile.constant';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';

import type { OnInit, Signal, WritableSignal } from '@angular/core';
import type { FieldTree, ValidationError } from '@angular/forms/signals';
import type {
  ISocialLinksData,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../../../core/models/user.model';
import type { ArtistType } from '../../../../core/types/artist-type.type';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';
import type {
  IEditProfileForm,
  ISocialLinkConfig,
  SocialLinkKey,
  SocialLinksForm,
} from '../../../../features/models/edit-profile-form.model';

@Component({
  selector: 'app-edit-profile-page',
  templateUrl: './edit-profile-page.component.html',
  styleUrl: './edit-profile-page.component.scss',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    ChipsFieldComponent,
    InputFieldComponent,
    RadioFieldComponent,
  ],
})
export class EditProfilePageComponent implements OnInit {
  private readonly userService: UserService = inject(UserService);

  private readonly authService: AuthService = inject(AuthService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  private readonly router: Router = inject(Router);

  protected readonly artistTypes: WritableSignal<readonly ArtistType[]> =
    signal<readonly ArtistType[]>(ARTIST_TYPES);

  protected readonly genreOptions: WritableSignal<readonly ISelectOption<string>[]> =
    signal<readonly ISelectOption<string>[]>(GENRE_OPTIONS);

  protected readonly socialLinks: WritableSignal<readonly ISocialLinkConfig[]> =
    signal<readonly ISocialLinkConfig[]>(SOCIAL_LINKS);

  protected readonly maxMainGenres: WritableSignal<number> = signal<number>(
    Constants.MAX_MAIN_GENRES,
  );

  protected readonly maxAdditionalGenres: WritableSignal<number> = signal<number>(
    Constants.MAX_ADDITIONAL_GENRES,
  );

  protected readonly shortDescriptionLimit: WritableSignal<number> = signal<number>(
    Constants.MAX_LENGTH_FORM_SHORT_DESCRIPTION,
  );

  protected readonly descriptionLimit: WritableSignal<number> = signal<number>(
    Constants.MAX_LENGTH_FORM_DESCRIPTION,
  );

  protected readonly shortDescriptionRows: WritableSignal<number> = signal<number>(
    Constants.SHORT_DESCRIPTION_TEXTAREA_ROWS,
  );

  protected readonly descriptionRows: WritableSignal<number> = signal<number>(
    Constants.DESCRIPTION_TEXTAREA_ROWS,
  );

  protected readonly isLoaded: WritableSignal<boolean> = signal<boolean>(false);

  private readonly editProfileModel: WritableSignal<IEditProfileForm> = signal<IEditProfileForm>({
    name: Constants.EMPTY_STRING,
    surname: Constants.EMPTY_STRING,
    email: Constants.EMPTY_STRING,
    recoveryEmail: Constants.EMPTY_STRING,
    artistType: DEFAULT_ARTIST_TYPE,
    artistName: Constants.EMPTY_STRING,
    shortDescription: Constants.EMPTY_STRING,
    description: Constants.EMPTY_STRING,
    mainGenres: [],
    additionalGenres: [],
    socialLinks: { ...EMPTY_SOCIAL_LINKS_FORM },
  });

  protected readonly editProfileForm: FieldTree<IEditProfileForm> = form<IEditProfileForm>(
    this.editProfileModel,
    editProfileFormSchema,
    {
      submission: { action: () => this.saveProfile() },
    },
  );

  protected readonly isSaveDisabled: Signal<boolean> = computed<boolean>(
    () =>
      !this.isLoaded() ||
      this.editProfileForm().invalid() ||
      this.editProfileForm().submitting() ||
      !this.editProfileForm().dirty(),
  );

  public ngOnInit(): void {
    void this.loadProfile();
  }

  public onBack(): void {
    void this.router.navigate([Links.PROFILE_URL]);
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile: IUserProfileData = await firstValueFrom(this.userService.getUserProfileData());
      this.editProfileModel.set(this.toFormModel(profile));
      this.isLoaded.set(true);
    } catch {
      this.snackbarService.error(Constants.PROFILE_LOAD_FAILED);
    }
  }

  private async saveProfile(): Promise<ValidationError.WithOptionalFieldTree | undefined> {
    try {
      const result: IUpdatedProfileData = await firstValueFrom(
        this.userService.updateUserProfileData(this.toUpdateData(this.editProfileModel())),
      );

      if (result.requiresReauthentication) {
        this.snackbarService.info(Constants.EMAIL_CHANGED_SIGN_IN_AGAIN);
        this.authService.logout();
        return undefined;
      }

      this.snackbarService.success(Constants.PROFILE_SAVED);
      await this.router.navigate([Links.PROFILE_URL]);
      return undefined;
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === Constants.HTTP_CONFLICT_STATUS) {
        return {
          kind: Constants.SERVER_ERROR,
          message: ProfileValidationMessages.EMAIL_TAKEN,
          fieldTree: this.editProfileForm.email,
        };
      }

      this.snackbarService.error(Constants.PROFILE_SAVE_FAILED);
      return undefined;
    }
  }

  private toFormModel(profile: IUserProfileData): IEditProfileForm {
    return {
      name: profile.name,
      surname: profile.surname,
      email: profile.email,
      recoveryEmail: profile.recoveryEmail ?? Constants.EMPTY_STRING,
      artistType: profile.artistType ? ARTIST_TYPE_LABELS[profile.artistType] : DEFAULT_ARTIST_TYPE,
      artistName: profile.artistName ?? Constants.EMPTY_STRING,
      shortDescription: profile.shortDescription ?? Constants.EMPTY_STRING,
      description: profile.description ?? Constants.EMPTY_STRING,
      mainGenres: [...profile.mainGenres],
      additionalGenres: [...profile.additionalGenres],
      socialLinks: this.toSocialLinksForm(profile.socialLinks),
    };
  }

  private toSocialLinksForm(socialLinks: ISocialLinksData | null): SocialLinksForm {
    const links: SocialLinksForm = { ...EMPTY_SOCIAL_LINKS_FORM };

    if (socialLinks) {
      (Object.keys(links) as SocialLinkKey[]).forEach((key: SocialLinkKey) => {
        links[key] = socialLinks[key] ?? Constants.EMPTY_STRING;
      });
    }

    return links;
  }

  private toUpdateData(model: IEditProfileForm): IUpdateProfileData {
    return {
      name: model.name.trim(),
      surname: model.surname.trim(),
      email: model.email.trim(),
      recoveryEmail: this.toNullable(model.recoveryEmail),
      artistType: model.artistType.toUpperCase() as ArtistTypeRequest,
      artistName: this.toNullable(model.artistName),
      shortDescription: this.toNullable(model.shortDescription),
      description: this.toNullable(model.description),
      mainGenres: model.mainGenres,
      additionalGenres: model.additionalGenres,
      socialLinks: this.toSocialLinksData(model.socialLinks),
    };
  }

  private toSocialLinksData(links: SocialLinksForm): ISocialLinksData | null {
    const data: ISocialLinksData = {
      telegram: this.toNullable(links.telegram),
      instagram: this.toNullable(links.instagram),
      youtube: this.toNullable(links.youtube),
      facebook: this.toNullable(links.facebook),
      spotify: this.toNullable(links.spotify),
      appleMusic: this.toNullable(links.appleMusic),
      soundcloud: this.toNullable(links.soundcloud),
      bandcamp: this.toNullable(links.bandcamp),
      icloud: this.toNullable(links.icloud),
      tiktok: this.toNullable(links.tiktok),
    };

    return Object.values(data).some((link: string | null) => link !== null) ? data : null;
  }

  private toNullable(value: string): string | null {
    return value.trim() || null;
  }
}
