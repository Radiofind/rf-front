import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileHeroComponent } from '../../../../features/components/profile/profile-hero/profile-hero.component';
import { ProfileStatsComponent } from '../../../../features/components/profile/profile-stats/profile-stats.component';
import { ProfileDetailsComponent } from '../../../../features/components/profile/profile-details/profile-details.component';
import { LatestActivityComponent } from '../../../../features/components/profile/latest-activity/latest-activity.component';
import { UserService } from '../../../../features/services/user-service/user.service';
import { AvatarStateService } from '../../../../features/services/avatar-state-service/avatar-state.service';
import { AvatarModalComponent } from '../../../../features/dialogs/avatar-modal/avatar-modal.component';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { DateFormatEnum } from '../../../../core/enums/date-format.enum';
import { ModalSizeEnum } from '../../../../core/enums/modal-size.enum';
import { formatStringDate } from '../../../../shared/helpers/date/date.helpers';
import { findSelectOption } from '../../../../shared/helpers/select-option/select-option.helpers';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';
import { GENRE_OPTIONS } from '../../../../features/constants/edit-profile.constant';

import type { OnInit, Signal, WritableSignal } from '@angular/core';
import type { ISocialLinksData, IUserProfileData } from '../../../../core/models/user.model';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { TranslationKey } from '../../../../core/types/translation.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';
import type {
  IAvatarModalData,
  IAvatarModalResult,
} from '../../../../features/models/avatar-modal.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  imports: [
    ProfileHeroComponent,
    ProfileStatsComponent,
    ProfileDetailsComponent,
    LatestActivityComponent,
  ],
})
export class ProfilePageComponent implements OnInit {
  private readonly userService: UserService = inject(UserService);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly avatarStateService: AvatarStateService = inject(AvatarStateService);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly router: Router = inject(Router);

  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly profile: WritableSignal<IUserProfileData | null> =
    signal<IUserProfileData | null>(null);

  protected readonly avatarUrl: Signal<string | null> = this.avatarStateService.avatarUrl;

  protected readonly fullName: Signal<string> = computed<string>(() => {
    const profile: IUserProfileData | null = this.profile();
    return profile ? profile.name + Constants.EMPTY_SPACE_STRING + profile.surname : Constants.DASH;
  });

  protected readonly mainGenres: Signal<string | null> = computed<string | null>(() => {
    const mainGenres: string[] | undefined = this.profile()?.mainGenres;
    if (!mainGenres?.length) {
      return null;
    }
    return mainGenres
      .map((genre: string) => this.formatGenre(genre))
      .join(Constants.SLASH_WITH_SPACES);
  });

  protected readonly socialLinks: Signal<ISocialLinksData | null> =
    computed<ISocialLinksData | null>(() => this.profile()?.socialLinks ?? null);

  protected readonly additionalGenres: Signal<string[]> = computed<string[]>(
    () => this.profile()?.additionalGenres ?? [],
  );

  protected readonly artistType: Signal<ArtistTypeRequest> = computed<ArtistTypeRequest>(
    () => this.profile()?.artistType ?? ArtistTypeRequestEnum.ARTIST,
  );

  protected readonly shortDescription: Signal<string> = computed<string>(
    () => this.profile()?.shortDescription ?? Constants.DASH,
  );

  protected readonly description: Signal<string> = computed<string>(
    () => this.profile()?.description ?? Constants.DASH,
  );

  protected readonly artistName: Signal<string> = computed<string>(
    () => this.profile()?.artistName ?? Constants.DASH,
  );

  protected readonly birthdayDate: Signal<string> = computed<string>(() =>
    this.formatProfileDate(this.profile()?.dateOfBirth, DateFormatEnum.FULL_DATE),
  );

  protected readonly registeredAt: Signal<string> = computed<string>(() =>
    this.formatProfileDate(this.profile()?.registeredAt, DateFormatEnum.MONTH_YEAR),
  );

  public ngOnInit(): void {
    void this.getUserProfileData();
  }

  public onAvatarEdit(): void {
    this.modalService
      .open<IAvatarModalResult, IAvatarModalData, AvatarModalComponent>(AvatarModalComponent, {
        title: Constants.PROFILE_PHOTO,
        subtitle: Constants.AVATAR_SUBTITLE,
        iconClass: Constants.CAMERA_ICON,
        size: ModalSizeEnum.SMALL,
        data: { avatarUrl: this.avatarUrl() },
      })
      .closed.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: IAvatarModalResult | undefined) => {
        if (result) {
          this.avatarStateService.setAvatar(result.avatar);
        }
      });
  }

  public onProfileEdit(): void {
    void this.router.navigate([Links.EDIT_PROFILE_URL]);
  }

  private async getUserProfileData(): Promise<void> {
    const profile: IUserProfileData = await firstValueFrom(this.userService.getUserProfileData());
    this.profile.set(profile);
  }

  private formatGenre(genre: string): string {
    const option: ISelectOption<string, TranslationKey> | undefined = findSelectOption(
      GENRE_OPTIONS,
      genre,
    );

    if (option) {
      return this.translationService.translate(option.label);
    }

    return genre
      .split(Constants.UNDERSCORE)
      .map(
        (word: string) =>
          word.charAt(Constants.ZERO).toUpperCase() + word.slice(Constants.ONE).toLowerCase(),
      )
      .join(Constants.EMPTY_SPACE_STRING);
  }

  private formatProfileDate(date: string | undefined, format: DateFormatEnum): string {
    return date ? formatStringDate(date, format, this.translationService.locale()) : Constants.DASH;
  }
}
