import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import { Links } from '../../../core/constants/links';
import { UploadsTableComponent } from '../../../features/components/my-uploads/uploads-table/uploads-table.component';
import { UploadsEmptyStateComponent } from '../../../features/components/my-uploads/uploads-empty-state/uploads-empty-state.component';
import { UploadsEmptyStateEnum } from '../../../features/enums/uploads-empty-state.enum';
import {
  MY_UPLOADS_SEARCH_MAX_LENGTH,
  MY_UPLOADS_SKELETON_ROWS,
  UPLOADS_STATUS_TABS,
} from '../../../features/constants/my-uploads.constant';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { MyUploadsPageActions } from '../../../store/ui/my-uploads-page.actions';
import { myUploadsFeature } from '../../../store/my-uploads/my-uploads.feature';
import { playerFeature } from '../../../store/player/player.feature';
import { settingsFeature } from '../../../store/settings/settings.feature';

import type { OnInit, Signal } from '@angular/core';
import type { IPlayerTrack } from '../../../core/models/player.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';
import type { ITrack } from '../../../core/models/track.model';
import type { TrackStatus } from '../../../core/types/track-status.type';
import type { IUploadsStatusTab } from '../../../features/models/uploads-status-tab.model';

@Component({
  selector: 'app-my-uploads-page',
  templateUrl: './my-uploads-page.component.html',
  styleUrl: './my-uploads-page.component.scss',
  imports: [UploadsTableComponent, UploadsEmptyStateComponent, TranslatePipe],
})
export class MyUploadsPageComponent implements OnInit {
  private readonly store: Store = inject(Store);

  private readonly router: Router = inject(Router);

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

  protected readonly searchMaxLength: number = MY_UPLOADS_SEARCH_MAX_LENGTH;

  protected readonly skeletonRows: readonly number[] = MY_UPLOADS_SKELETON_ROWS;

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
    this.store.dispatch(MyUploadsPageActions.opened());
  }

  public onStatusSelect(status: TrackStatus | null): void {
    if (status !== this.status()) {
      this.store.dispatch(MyUploadsPageActions.statusSelected({ status: status }));
    }
  }

  public onSearch(event: Event): void {
    this.store.dispatch(
      MyUploadsPageActions.searchChanged({ search: (event.target as HTMLInputElement).value }),
    );
  }

  public onSearchClear(): void {
    this.store.dispatch(MyUploadsPageActions.searchChanged({ search: Constants.EMPTY_STRING }));
  }

  public onFiltersReset(): void {
    this.store.dispatch(MyUploadsPageActions.filtersReset());
  }

  public onRetry(): void {
    this.store.dispatch(MyUploadsPageActions.retryClicked());
  }

  public onPageSelect(page: number): void {
    if (page !== this.page() && page >= Constants.ZERO && page < this.totalPages()) {
      this.store.dispatch(MyUploadsPageActions.pageSelected({ page: page }));
    }
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
