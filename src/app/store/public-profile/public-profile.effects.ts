import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, of, pairwise, switchMap, takeUntil, tap } from 'rxjs';
import { PublicProfileService } from '../../features/services/public-profile-service/public-profile.service';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';
import { PUBLIC_TRACKS_PAGE_SIZE } from '../../features/constants/public-profile.constant';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { PublicProfilePageActions } from '../ui/public-profile-page.actions';
import { PublicProfileApiActions } from './public-profile.actions';
import { publicProfileFeature } from './public-profile.feature';

import type { Observable } from 'rxjs';
import type { Action } from '@ngrx/store';
import type { IPage } from '../../core/models/page.model';
import type { IPublicProfile } from '../../core/models/public-profile.model';
import type { ITrack } from '../../core/models/track.model';

const MISSING_PROFILE_STATUSES: readonly number[] = [
  Constants.HTTP_NOT_FOUND_STATUS,
  Constants.HTTP_BAD_REQUEST_STATUS,
];

const untilPageLeft = <T>(actions$: Actions) =>
  takeUntil<T>(actions$.pipe(ofType(PublicProfilePageActions.left, MainLayoutActions.closed)));

const profileLoadFailure = (error: unknown): Action =>
  error instanceof HttpErrorResponse && MISSING_PROFILE_STATUSES.includes(error.status)
    ? PublicProfileApiActions.profileNotFound()
    : PublicProfileApiActions.profileLoadFailed();

export const loadPublicProfile = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    publicProfileService: PublicProfileService = inject(PublicProfileService),
    platformId: object = inject(PLATFORM_ID),
  ) => {
    return actions$.pipe(
      ofType(
        PublicProfilePageActions.opened,
        PublicProfilePageActions.retryClicked,
        PublicProfileApiActions.followSaved,
      ),
      filter(() => isPlatformBrowser(platformId)),
      concatLatestFrom(() => store.select(publicProfileFeature.selectPublicId)),
      map(([, publicId]: [Action, string | null]) => publicId),
      filter((publicId: string | null): publicId is string => publicId !== null),
      switchMap((publicId: string) =>
        publicProfileService.getProfile(publicId).pipe(
          map((profile: IPublicProfile) =>
            PublicProfileApiActions.profileLoaded({ profile: profile }),
          ),
          catchError((error: unknown) => of(profileLoadFailure(error))),
          untilPageLeft(actions$),
        ),
      ),
    );
  },
  { functional: true },
);

export const redirectOwnProfile = createEffect(
  (actions$: Actions = inject(Actions), router: Router = inject(Router)) => {
    return actions$.pipe(
      ofType(PublicProfileApiActions.profileLoaded),
      filter(({ profile }: { profile: IPublicProfile }) => profile.own),
      tap(() => {
        void router.navigate([Links.PROFILE_URL], { replaceUrl: true });
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const loadPublicAvatar = createEffect(
  (
    actions$: Actions = inject(Actions),
    publicProfileService: PublicProfileService = inject(PublicProfileService),
  ) => {
    return actions$.pipe(
      ofType(PublicProfileApiActions.profileLoaded),
      filter(({ profile }: { profile: IPublicProfile }) => !profile.own),
      switchMap(({ profile }: { profile: IPublicProfile }): Observable<Action> => {
        if (!profile.avatarUrl) {
          return of(PublicProfileApiActions.avatarLoaded({ url: null }));
        }

        return publicProfileService.getAvatar(profile.publicId).pipe(
          map((avatar: Blob) =>
            PublicProfileApiActions.avatarLoaded({ url: URL.createObjectURL(avatar) }),
          ),
          catchError(() => of(PublicProfileApiActions.avatarLoaded({ url: null }))),
          untilPageLeft(actions$),
        );
      }),
    );
  },
  { functional: true },
);

export const releaseReplacedPublicAvatar = createEffect(
  (store: Store = inject(Store)) => {
    return store.select(publicProfileFeature.selectAvatarUrl).pipe(
      pairwise(),
      map(([previous]: [string | null, string | null]) => previous),
      filter((previous: string | null): previous is string => previous !== null),
      tap((previous: string) => {
        URL.revokeObjectURL(previous);
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const loadFirstPublicTracks = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    publicProfileService: PublicProfileService = inject(PublicProfileService),
  ) => {
    return actions$.pipe(
      ofType(PublicProfileApiActions.profileLoaded),
      concatLatestFrom(() => store.select(publicProfileFeature.selectTracks)),
      filter(
        ([{ profile }, tracks]: [{ profile: IPublicProfile }, readonly ITrack[] | null]) =>
          !profile.own && profile.details !== null && tracks === null,
      ),
      switchMap(([{ profile }]: [{ profile: IPublicProfile }, readonly ITrack[] | null]) =>
        publicProfileService
          .getTracks(profile.publicId, Constants.ZERO, PUBLIC_TRACKS_PAGE_SIZE)
          .pipe(
            map((page: IPage<ITrack>) => PublicProfileApiActions.tracksLoaded({ page: page })),
            catchError(() => of(PublicProfileApiActions.tracksLoadFailed())),
            untilPageLeft(actions$),
          ),
      ),
    );
  },
  { functional: true },
);

export const loadMorePublicTracks = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    publicProfileService: PublicProfileService = inject(PublicProfileService),
  ) => {
    return actions$.pipe(
      ofType(PublicProfilePageActions.moreTracksClicked),
      concatLatestFrom(() => [
        store.select(publicProfileFeature.selectPublicId),
        store.select(publicProfileFeature.selectTracksPage),
      ]),
      filter(
        (params: [Action, string | null, number]): params is [Action, string, number] =>
          params[1] !== null,
      ),
      exhaustMap(([, publicId, page]: [Action, string, number]) =>
        publicProfileService
          .getTracks(publicId, page + Constants.ONE, PUBLIC_TRACKS_PAGE_SIZE)
          .pipe(
            map((next: IPage<ITrack>) => PublicProfileApiActions.tracksLoaded({ page: next })),
            catchError(() => of(PublicProfileApiActions.tracksLoadFailed())),
            untilPageLeft(actions$),
          ),
      ),
    );
  },
  { functional: true },
);

export const saveFollow = createEffect(
  (
    actions$: Actions = inject(Actions),
    store: Store = inject(Store),
    publicProfileService: PublicProfileService = inject(PublicProfileService),
  ) => {
    return actions$.pipe(
      ofType(PublicProfilePageActions.followClicked, PublicProfilePageActions.unfollowClicked),
      concatLatestFrom(() => store.select(publicProfileFeature.selectPublicId)),
      filter((params: [Action, string | null]): params is [Action, string] => params[1] !== null),
      exhaustMap(([action, publicId]: [Action, string]) =>
        (action.type === PublicProfilePageActions.followClicked.type
          ? publicProfileService.follow(publicId)
          : publicProfileService.unfollow(publicId)
        ).pipe(
          map(() => PublicProfileApiActions.followSaved()),
          catchError(() => of(PublicProfileApiActions.followFailed())),
        ),
      ),
    );
  },
  { functional: true },
);

export const reportFollowFailure = createEffect(
  (
    actions$: Actions = inject(Actions),
    snackbarService: SnackbarService = inject(SnackbarService),
  ) => {
    return actions$.pipe(
      ofType(PublicProfileApiActions.followFailed),
      tap(() => {
        snackbarService.error(Constants.FOLLOW_FAILED);
      }),
    );
  },
  { functional: true, dispatch: false },
);
