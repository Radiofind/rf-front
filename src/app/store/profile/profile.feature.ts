import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../core/enums/artist-type.enum';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { ProfileApiActions } from './profile.actions';

import type { IUserProfileData } from '../../core/models/user.model';
import type { IActivity } from '../../core/models/activity.model';
import type { ArtistTypeRequest } from '../../core/types/artist-type-request.type';

export interface IProfileState {
  profile: IUserProfileData | null;
  activities: readonly IActivity[] | null;
}

export const initialProfileState: IProfileState = {
  profile: null,
  activities: null,
};

export const profileFeature = createFeature({
  name: 'profile',
  reducer: createReducer(
    initialProfileState,
    on(
      ProfileApiActions.profileLoaded,
      EditProfilePageActions.profileSaved,
      (state: IProfileState, { profile }: { profile: IUserProfileData }): IProfileState => ({
        ...state,
        profile: profile,
      }),
    ),
    on(
      ProfileApiActions.activitiesLoaded,
      (
        state: IProfileState,
        { activities }: { activities: readonly IActivity[] },
      ): IProfileState => ({ ...state, activities: activities }),
    ),
    on(MainLayoutActions.closed, (): IProfileState => initialProfileState),
  ),
  extraSelectors: ({ selectProfile }) => ({
    selectArtistType: createSelector(
      selectProfile,
      (profile: IUserProfileData | null): ArtistTypeRequest =>
        profile?.artistType ?? ArtistTypeRequestEnum.ARTIST,
    ),
    selectArtistDisplayName: createSelector(
      selectProfile,
      (profile: IUserProfileData | null): string => {
        if (!profile) {
          return Constants.EMPTY_STRING;
        }

        const artistName: string = profile.artistName?.trim() ?? Constants.EMPTY_STRING;

        return artistName
          ? artistName
          : profile.name + Constants.EMPTY_SPACE_STRING + profile.surname;
      },
    ),
  }),
});
