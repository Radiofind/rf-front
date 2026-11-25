import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProfileHeroComponent } from '../../../features/components/profile/profile-hero/profile-hero.component';
import { ProfileStatsComponent } from '../../../features/components/profile/profile-stats/profile-stats.component';
import { ProfileDetailsComponent } from '../../../features/components/profile/profile-details/profile-details.component';
import { ProfileTracksComponent } from '../../../features/components/profile/profile-tracks/profile-tracks.component';
import { ProfileRestrictedComponent } from '../../../features/components/profile/profile-restricted/profile-restricted.component';
import { FollowButtonComponent } from '../../../features/components/profile/follow-button/follow-button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { GenreLabelService } from '../../../features/services/genre-label-service/genre-label.service';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { Constants } from '../../../core/constants/constants';
import { DateFormatEnum } from '../../../core/enums/date-format.enum';
import { PublicProfileStatusEnum } from '../../../core/enums/public-profile-status.enum';
import { formatStringDate } from '../../../shared/helpers/date/date.helpers';
import { PublicProfilePageActions } from '../../../store/ui/public-profile-page.actions';
import { publicProfileFeature } from '../../../store/public-profile/public-profile.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { OnDestroy, OnInit, Signal } from '@angular/core';
import type { ParamMap } from '@angular/router';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type {
  IPublicProfile,
  IPublicProfileDetails,
} from '../../../core/models/public-profile.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { ITrack } from '../../../core/models/track.model';

const PUBLIC_ID_PARAM: string = 'publicId';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.scss',
  imports: [
    ProfileHeroComponent,
    ProfileStatsComponent,
    ProfileDetailsComponent,
    ProfileTracksComponent,
    ProfileRestrictedComponent,
    FollowButtonComponent,
    EmptyStateComponent,
    TranslatePipe,
  ],
})
export class UserProfilePageComponent implements OnInit, OnDestroy {
  private readonly store: Store = inject(Store);

  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly genreLabels: GenreLabelService = inject(GenreLabelService);

  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly settings: Signal<IGeneralSettings> = this.store.selectSignal(
    settingsFeature.selectSettings,
  );

  private readonly playerQueue: Signal<IPlayerTrack[]> = this.store.selectSignal(
    publicProfileFeature.selectPlayerQueue,
  );

  private readonly currentTrack: Signal<IPlayerTrack | null> = this.store.selectSignal(
    playerFeature.selectCurrentTrack,
  );

  protected readonly statuses: typeof PublicProfileStatusEnum = PublicProfileStatusEnum;

  protected readonly status: Signal<PublicProfileStatusEnum> = this.store.selectSignal(
    publicProfileFeature.selectStatus,
  );

  protected readonly profile: Signal<IPublicProfile | null> = this.store.selectSignal(
    publicProfileFeature.selectProfile,
  );

  protected readonly avatarUrl: Signal<string | null> = this.store.selectSignal(
    publicProfileFeature.selectAvatarUrl,
  );

  protected readonly tracks: Signal<readonly ITrack[] | null> = this.store.selectSignal(
    publicProfileFeature.selectTracks,
  );

  protected readonly hasMoreTracks: Signal<boolean> = this.store.selectSignal(
    publicProfileFeature.selectHasMoreTracks,
  );

  protected readonly isLoadingTracks: Signal<boolean> = this.store.selectSignal(
    publicProfileFeature.selectIsLoadingTracks,
  );

  protected readonly isFollowPending: Signal<boolean> = this.store.selectSignal(
    publicProfileFeature.selectIsFollowPending,
  );

  protected readonly isPlaying: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsPlaying,
  );

  protected readonly canPlay: Signal<boolean> = computed<boolean>(() => !this.settings().radioMode);

  protected readonly currentTrackId: Signal<number | null> = computed<number | null>(
    () => this.currentTrack()?.id ?? null,
  );

  protected readonly details: Signal<IPublicProfileDetails | null> =
    computed<IPublicProfileDetails | null>(() => this.profile()?.details ?? null);

  protected readonly mainGenres: Signal<string | null> = computed<string | null>(() =>
    this.genreLabels.join(this.details()?.mainGenres),
  );

  protected readonly joinedAt: Signal<string> = computed<string>(() => {
    const joinedAt: string | undefined = this.details()?.joinedAt;
    return joinedAt
      ? formatStringDate(
          `${joinedAt}${Constants.DASH}${Constants.FIRST_DAY_OF_MONTH}`,
          DateFormatEnum.MONTH_YEAR,
          this.translationService.locale(),
        )
      : Constants.DASH;
  });

  protected readonly description: Signal<string> = computed<string>(
    () => this.details()?.description ?? Constants.DASH,
  );

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: ParamMap) => {
      const publicId: string | null = params.get(PUBLIC_ID_PARAM);

      if (publicId) {
        this.store.dispatch(PublicProfilePageActions.opened({ publicId: publicId }));
      }
    });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(PublicProfilePageActions.left());
  }

  public onRetry(): void {
    this.store.dispatch(PublicProfilePageActions.retryClicked());
  }

  public onFollow(): void {
    this.store.dispatch(PublicProfilePageActions.followClicked());
  }

  public onUnfollow(): void {
    this.store.dispatch(PublicProfilePageActions.unfollowClicked());
  }

  public onMoreTracks(): void {
    this.store.dispatch(PublicProfilePageActions.moreTracksClicked());
  }

  public onPlayToggle(track: ITrack): void {
    if (!this.canPlay()) {
      return;
    }

    if (this.currentTrackId() === track.id) {
      this.store.dispatch(PublicProfilePageActions.playbackToggled());
      return;
    }

    const queue: IPlayerTrack[] = this.playerQueue();
    const startIndex: number = queue.findIndex((item: IPlayerTrack) => item.id === track.id);

    if (startIndex !== Constants.NOT_FOUND_INDEX) {
      this.store.dispatch(
        PublicProfilePageActions.trackPlayed({ queue: queue, startIndex: startIndex }),
      );
    }
  }

  protected countOf(value: number): string {
    return String(value);
  }
}
