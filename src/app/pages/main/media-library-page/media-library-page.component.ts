import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import { TracksTableComponent } from '../../../features/components/tracks/tracks-table/tracks-table.component';
import { TracksSearchComponent } from '../../../features/components/tracks/tracks-search/tracks-search.component';
import { TracksSkeletonComponent } from '../../../features/components/tracks/tracks-skeleton/tracks-skeleton.component';
import { TracksPaginationComponent } from '../../../features/components/tracks/tracks-pagination/tracks-pagination.component';
import { LibraryEmptyStateComponent } from '../../../features/components/media-library/library-empty-state/library-empty-state.component';
import { LibraryTrackActionsService } from '../../../features/services/library-track-actions-service/library-track-actions.service';
import { UploadsPreferencesService } from '../../../features/services/uploads-preferences-service/uploads-preferences.service';
import { LibraryEmptyStateEnum } from '../../../features/enums/library-empty-state.enum';
import { MEDIA_LIBRARY_TABLE_CONFIG } from '../../../features/constants/media-library.constant';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { MediaLibraryPageActions } from '../../../store/ui/media-library-page.actions';
import { mediaLibraryFeature } from '../../../store/media-library/media-library.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { OnInit, Signal } from '@angular/core';
import type { LibrarySortEnum } from '../../../core/enums/library-sort.enum';
import type { SortDirectionEnum } from '../../../core/enums/sort-direction.enum';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { ITrack } from '../../../core/models/track.model';
import type { ITrackActionRequest } from '../../../features/models/track-action-option.model';
import type { ITracksTableConfig } from '../../../features/models/tracks-table.model';

@Component({
  selector: 'app-media-library-page',
  templateUrl: './media-library-page.component.html',
  styleUrl: './media-library-page.component.scss',
  imports: [
    TracksTableComponent,
    TracksSearchComponent,
    TracksSkeletonComponent,
    TracksPaginationComponent,
    LibraryEmptyStateComponent,
    TranslatePipe,
  ],
})
export class MediaLibraryPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  private readonly preferences: UploadsPreferencesService = inject(UploadsPreferencesService);

  private readonly trackActions: LibraryTrackActionsService = inject(LibraryTrackActionsService);

  private readonly playerQueue: Signal<IPlayerTrack[]> = this.store.selectSignal(
    mediaLibraryFeature.selectPlayerQueue,
  );

  private readonly currentTrack: Signal<IPlayerTrack | null> = this.store.selectSignal(
    playerFeature.selectCurrentTrack,
  );

  private readonly settings: Signal<IGeneralSettings> = this.store.selectSignal(
    settingsFeature.selectSettings,
  );

  protected readonly tableConfig: ITracksTableConfig<LibrarySortEnum> = MEDIA_LIBRARY_TABLE_CONFIG;

  protected readonly tracks: Signal<readonly ITrack[] | null> = this.store.selectSignal(
    mediaLibraryFeature.selectTracks,
  );

  protected readonly search: Signal<string> = this.store.selectSignal(
    mediaLibraryFeature.selectSearch,
  );

  protected readonly page: Signal<number> = this.store.selectSignal(mediaLibraryFeature.selectPage);

  protected readonly pageSize: Signal<number> = this.store.selectSignal(
    mediaLibraryFeature.selectPageSize,
  );

  protected readonly sort: Signal<LibrarySortEnum> = this.store.selectSignal(
    mediaLibraryFeature.selectSort,
  );

  protected readonly direction: Signal<SortDirectionEnum> = this.store.selectSignal(
    mediaLibraryFeature.selectDirection,
  );

  protected readonly isLoading: Signal<boolean> = this.store.selectSignal(
    mediaLibraryFeature.selectIsLoading,
  );

  protected readonly emptyState: Signal<LibraryEmptyStateEnum | null> = this.store.selectSignal(
    mediaLibraryFeature.selectEmptyState,
  );

  protected readonly totalElements: Signal<number> = this.store.selectSignal(
    mediaLibraryFeature.selectTotalElements,
  );

  protected readonly totalPages: Signal<number> = this.store.selectSignal(
    mediaLibraryFeature.selectTotalPages,
  );

  protected readonly visiblePages: Signal<number[]> = this.store.selectSignal(
    mediaLibraryFeature.selectVisiblePages,
  );

  protected readonly rangeStart: Signal<number> = this.store.selectSignal(
    mediaLibraryFeature.selectRangeStart,
  );

  protected readonly rangeEnd: Signal<number> = this.store.selectSignal(
    mediaLibraryFeature.selectRangeEnd,
  );

  protected readonly isPlaying: Signal<boolean> = this.store.selectSignal(
    playerFeature.selectIsPlaying,
  );

  protected readonly canPlay: Signal<boolean> = computed<boolean>(() => !this.settings().radioMode);

  protected readonly currentTrackId: Signal<number | null> = computed<number | null>(
    () => this.currentTrack()?.id ?? null,
  );

  protected readonly hasToolbar: Signal<boolean> = computed<boolean>(
    () => this.emptyState() !== LibraryEmptyStateEnum.EMPTY_LIBRARY,
  );

  protected readonly isFirstLoad: Signal<boolean> = computed<boolean>(
    () => this.tracks() === null && this.emptyState() === null,
  );

  public ngOnInit(): void {
    this.store.dispatch(
      MediaLibraryPageActions.opened({ pageSize: this.preferences.readPageSize() }),
    );
  }

  public onSearch(search: string): void {
    this.store.dispatch(MediaLibraryPageActions.searchChanged({ search: search }));
  }

  public onSearchReset(): void {
    this.store.dispatch(MediaLibraryPageActions.searchReset());
  }

  public onPageSizeSelect(size: number): void {
    this.store.dispatch(MediaLibraryPageActions.pageSizeSelected({ size: size }));
  }

  public onSortSelect(sort: LibrarySortEnum): void {
    this.store.dispatch(MediaLibraryPageActions.sortSelected({ sort: sort }));
  }

  public onRetry(): void {
    this.store.dispatch(MediaLibraryPageActions.retryClicked());
  }

  public onPageSelect(page: number): void {
    this.store.dispatch(MediaLibraryPageActions.pageSelected({ page: page }));
  }

  public onTrackAction({ track, action }: ITrackActionRequest): void {
    this.trackActions.run(track, action);
  }

  public onPlayToggle(track: ITrack): void {
    if (!this.canPlay()) {
      return;
    }

    if (this.currentTrackId() === track.id) {
      this.store.dispatch(MediaLibraryPageActions.playbackToggled());
      return;
    }

    const queue: IPlayerTrack[] = this.playerQueue();
    const startIndex: number = queue.findIndex((item: IPlayerTrack) => item.id === track.id);

    if (startIndex !== Constants.NOT_FOUND_INDEX) {
      this.store.dispatch(
        MediaLibraryPageActions.trackPlayed({ queue: queue, startIndex: startIndex }),
      );
    }
  }
}
