import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import { Links } from '../../../core/constants/links';
import { TracksTableComponent } from '../../../features/components/tracks/tracks-table/tracks-table.component';
import { TracksSearchComponent } from '../../../features/components/tracks/tracks-search/tracks-search.component';
import { TracksSkeletonComponent } from '../../../features/components/tracks/tracks-skeleton/tracks-skeleton.component';
import { TracksPaginationComponent } from '../../../features/components/tracks/tracks-pagination/tracks-pagination.component';
import { UploadsEmptyStateComponent } from '../../../features/components/my-uploads/uploads-empty-state/uploads-empty-state.component';
import { TrackActionsService } from '../../../features/services/track-actions-service/track-actions.service';
import { UploadsPreferencesService } from '../../../features/services/uploads-preferences-service/uploads-preferences.service';
import { UploadsEmptyStateEnum } from '../../../features/enums/uploads-empty-state.enum';
import {
  MY_UPLOADS_TABLE_CONFIG,
  UPLOADS_STATUS_TABS,
} from '../../../features/constants/my-uploads.constant';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { MyUploadsPageActions } from '../../../store/ui/my-uploads-page.actions';
import { myUploadsFeature } from '../../../store/my-uploads/my-uploads.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { OnInit, Signal } from '@angular/core';
import type { OwnTracksSortEnum } from '../../../core/enums/own-tracks-sort.enum';
import type { SortDirectionEnum } from '../../../core/enums/sort-direction.enum';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { ITrack } from '../../../core/models/track.model';
import type { TrackStatus } from '../../../core/types/track-status.type';
import type { IUploadsStatusTab } from '../../../features/models/uploads-status-tab.model';
import type { ITrackActionRequest } from '../../../features/models/track-action-option.model';
import type { ITracksTableConfig } from '../../../features/models/tracks-table.model';

@Component({
  selector: 'app-my-uploads-page',
  templateUrl: './my-uploads-page.component.html',
  styleUrl: './my-uploads-page.component.scss',
  imports: [
    TracksTableComponent,
    TracksSearchComponent,
    TracksSkeletonComponent,
    TracksPaginationComponent,
    UploadsEmptyStateComponent,
    TranslatePipe,
  ],
})
export class MyUploadsPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  private readonly router: Router = inject(Router);

  private readonly preferences: UploadsPreferencesService = inject(UploadsPreferencesService);

  private readonly trackActions: TrackActionsService = inject(TrackActionsService);

  private readonly playerQueue: Signal<IPlayerTrack[]> = this.store.selectSignal(
    myUploadsFeature.selectPlayerQueue,
  );

  private readonly currentTrack: Signal<IPlayerTrack | null> = this.store.selectSignal(
    playerFeature.selectCurrentTrack,
  );

  private readonly settings: Signal<IGeneralSettings> = this.store.selectSignal(
    settingsFeature.selectSettings,
  );

  protected readonly tabs: readonly IUploadsStatusTab[] = UPLOADS_STATUS_TABS;

  protected readonly tableConfig: ITracksTableConfig<OwnTracksSortEnum> = MY_UPLOADS_TABLE_CONFIG;

  protected readonly tracks: Signal<readonly ITrack[] | null> = this.store.selectSignal(
    myUploadsFeature.selectTracks,
  );

  protected readonly status: Signal<TrackStatus | null> = this.store.selectSignal(
    myUploadsFeature.selectStatus,
  );

  protected readonly search: Signal<string> = this.store.selectSignal(
    myUploadsFeature.selectSearch,
  );

  protected readonly page: Signal<number> = this.store.selectSignal(myUploadsFeature.selectPage);

  protected readonly pageSize: Signal<number> = this.store.selectSignal(
    myUploadsFeature.selectPageSize,
  );

  protected readonly sort: Signal<OwnTracksSortEnum> = this.store.selectSignal(
    myUploadsFeature.selectSort,
  );

  protected readonly direction: Signal<SortDirectionEnum> = this.store.selectSignal(
    myUploadsFeature.selectDirection,
  );

  protected readonly isLoading: Signal<boolean> = this.store.selectSignal(
    myUploadsFeature.selectIsLoading,
  );

  protected readonly emptyState: Signal<UploadsEmptyStateEnum | null> = this.store.selectSignal(
    myUploadsFeature.selectEmptyState,
  );

  protected readonly totalElements: Signal<number> = this.store.selectSignal(
    myUploadsFeature.selectTotalElements,
  );

  protected readonly totalPages: Signal<number> = this.store.selectSignal(
    myUploadsFeature.selectTotalPages,
  );

  protected readonly visiblePages: Signal<number[]> = this.store.selectSignal(
    myUploadsFeature.selectVisiblePages,
  );

  protected readonly rangeStart: Signal<number> = this.store.selectSignal(
    myUploadsFeature.selectRangeStart,
  );

  protected readonly rangeEnd: Signal<number> = this.store.selectSignal(
    myUploadsFeature.selectRangeEnd,
  );

  protected readonly isPlaying: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsPlaying,
  );

  protected readonly canPlay: Signal<boolean> = computed<boolean>(() => !this.settings().radioMode);

  protected readonly currentTrackId: Signal<number | null> = computed<number | null>(
    () => this.currentTrack()?.id ?? null,
  );

  protected readonly hasToolbar: Signal<boolean> = computed<boolean>(
    () => this.emptyState() !== UploadsEmptyStateEnum.NO_UPLOADS,
  );

  protected readonly isFirstLoad: Signal<boolean> = computed<boolean>(
    () => this.tracks() === null && this.emptyState() === null,
  );

  public ngOnInit(): void {
    this.store.dispatch(MyUploadsPageActions.opened({ pageSize: this.preferences.readPageSize() }));
  }

  public onStatusSelect(status: TrackStatus | null): void {
    if (status !== this.status()) {
      this.store.dispatch(MyUploadsPageActions.statusSelected({ status: status }));
    }
  }

  public onSearch(search: string): void {
    this.store.dispatch(MyUploadsPageActions.searchChanged({ search: search }));
  }

  public onFiltersReset(): void {
    this.store.dispatch(MyUploadsPageActions.filtersReset());
  }

  public onPageSizeSelect(size: number): void {
    this.store.dispatch(MyUploadsPageActions.pageSizeSelected({ size: size }));
  }

  public onSortSelect(sort: OwnTracksSortEnum): void {
    this.store.dispatch(MyUploadsPageActions.sortSelected({ sort: sort }));
  }

  public onRetry(): void {
    this.store.dispatch(MyUploadsPageActions.retryClicked());
  }

  public onPageSelect(page: number): void {
    this.store.dispatch(MyUploadsPageActions.pageSelected({ page: page }));
  }

  public onTrackAction({ track, action }: ITrackActionRequest): void {
    this.trackActions.run(track, action);
  }

  public onUpload(): void {
    void this.router.navigate([Links.UPLOAD_TRACK_URL]);
  }

  public onPlayToggle(track: ITrack): void {
    if (!this.canPlay()) {
      return;
    }

    if (this.currentTrackId() === track.id) {
      this.store.dispatch(MyUploadsPageActions.playbackToggled());
      return;
    }

    const queue: IPlayerTrack[] = this.playerQueue();
    const startIndex: number = queue.findIndex((item: IPlayerTrack) => item.id === track.id);

    if (startIndex !== Constants.NOT_FOUND_INDEX) {
      this.store.dispatch(
        MyUploadsPageActions.trackPlayed({ queue: queue, startIndex: startIndex }),
      );
    }
  }
}
