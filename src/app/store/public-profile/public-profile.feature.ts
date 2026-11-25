import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { PublicProfileStatusEnum } from '../../core/enums/public-profile-status.enum';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { PublicProfilePageActions } from '../ui/public-profile-page.actions';
import { PublicProfileApiActions } from './public-profile.actions';

import type { IPage } from '../../core/models/page.model';
import type { IPlayerTrack } from '../../core/models/player.model';
import type { IPublicProfile } from '../../core/models/public-profile.model';
import type { ITrack } from '../../core/models/track.model';

export interface IPublicProfileState {
  publicId: string | null;
  status: PublicProfileStatusEnum;
  profile: IPublicProfile | null;
  avatarUrl: string | null;
  tracks: readonly ITrack[] | null;
  tracksPage: number;
  hasMoreTracks: boolean;
  isLoadingTracks: boolean;
  isFollowPending: boolean;
}

export const initialPublicProfileState: IPublicProfileState = {
  publicId: null,
  status: PublicProfileStatusEnum.LOADING,
  profile: null,
  avatarUrl: null,
  tracks: null,
  tracksPage: Constants.ZERO,
  hasMoreTracks: false,
  isLoadingTracks: false,
  isFollowPending: false,
};

export const publicProfileFeature = createFeature({
  name: 'publicProfile',
  reducer: createReducer(
    initialPublicProfileState,
    on(
      PublicProfilePageActions.opened,
      (_: IPublicProfileState, { publicId }: { publicId: string }): IPublicProfileState => ({
        ...initialPublicProfileState,
        publicId: publicId,
      }),
    ),
    on(
      PublicProfilePageActions.retryClicked,
      (state: IPublicProfileState): IPublicProfileState => ({
        ...state,
        status: PublicProfileStatusEnum.LOADING,
      }),
    ),
    on(
      PublicProfileApiActions.profileLoaded,
      (
        state: IPublicProfileState,
        { profile }: { profile: IPublicProfile },
      ): IPublicProfileState => ({
        ...state,
        status: PublicProfileStatusEnum.LOADED,
        profile: profile,
        tracks: profile.details ? state.tracks : null,
        isLoadingTracks: profile.details !== null && state.tracks === null,
        isFollowPending: false,
      }),
    ),
    on(
      PublicProfileApiActions.profileNotFound,
      (state: IPublicProfileState): IPublicProfileState => ({
        ...state,
        status: PublicProfileStatusEnum.NOT_FOUND,
      }),
    ),
    on(
      PublicProfileApiActions.profileDeleted,
      (state: IPublicProfileState): IPublicProfileState => ({
        ...state,
        status: PublicProfileStatusEnum.DELETED,
      }),
    ),
    on(
      PublicProfileApiActions.profileLoadFailed,
      (state: IPublicProfileState): IPublicProfileState => ({
        ...state,
        status: PublicProfileStatusEnum.FAILED,
      }),
    ),
    on(
      PublicProfileApiActions.avatarLoaded,
      (state: IPublicProfileState, { url }: { url: string | null }): IPublicProfileState => ({
        ...state,
        avatarUrl: url,
      }),
    ),
    on(
      PublicProfilePageActions.moreTracksClicked,
      (state: IPublicProfileState): IPublicProfileState => ({ ...state, isLoadingTracks: true }),
    ),
    on(
      PublicProfileApiActions.tracksLoaded,
      (state: IPublicProfileState, { page }: { page: IPage<ITrack> }): IPublicProfileState => ({
        ...state,
        tracks:
          page.page === Constants.ZERO ? page.items : [...(state.tracks ?? []), ...page.items],
        tracksPage: page.page,
        hasMoreTracks: page.hasNext,
        isLoadingTracks: false,
      }),
    ),
    on(
      PublicProfileApiActions.tracksLoadFailed,
      (state: IPublicProfileState): IPublicProfileState => ({ ...state, isLoadingTracks: false }),
    ),
    on(
      PublicProfilePageActions.followClicked,
      PublicProfilePageActions.unfollowClicked,
      (state: IPublicProfileState): IPublicProfileState => ({ ...state, isFollowPending: true }),
    ),
    on(
      PublicProfileApiActions.followFailed,
      (state: IPublicProfileState): IPublicProfileState => ({ ...state, isFollowPending: false }),
    ),
    on(
      PublicProfilePageActions.left,
      MainLayoutActions.closed,
      (): IPublicProfileState => initialPublicProfileState,
    ),
  ),
  extraSelectors: ({ selectTracks }) => ({
    selectPlayerQueue: createSelector(
      selectTracks,
      (tracks: readonly ITrack[] | null): IPlayerTrack[] =>
        (tracks ?? []).flatMap((track: ITrack): IPlayerTrack[] =>
          track.audioUrl
            ? [
                {
                  id: track.id,
                  title: track.title,
                  artistName: track.artistName,
                  coverUrl: track.coverUrl,
                  audioUrl: track.audioUrl,
                  liked: track.liked,
                  canLike: true,
                },
              ]
            : [],
        ),
    ),
  }),
});
