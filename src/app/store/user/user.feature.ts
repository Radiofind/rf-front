import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Constants } from '../../core/constants/constants';
import { EditProfilePageActions } from '../ui/edit-profile-page.actions';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { UserApiActions } from './user.actions';

import type { ICurrentUser, IUserProfileData } from '../../core/models/user.model';

export interface IUserState {
  currentUser: ICurrentUser | null;
}

export const initialUserState: IUserState = {
  currentUser: null,
};

export const userFeature = createFeature({
  name: 'user',
  reducer: createReducer(
    initialUserState,
    on(
      UserApiActions.currentUserLoaded,
      (state: IUserState, { user }: { user: ICurrentUser }): IUserState => ({
        ...state,
        currentUser: user,
      }),
    ),
    on(
      EditProfilePageActions.profileSaved,
      (state: IUserState, { profile }: { profile: IUserProfileData }): IUserState => ({
        ...state,
        currentUser: {
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
        },
      }),
    ),
    on(MainLayoutActions.closed, (): IUserState => initialUserState),
  ),
  extraSelectors: ({ selectCurrentUser }) => ({
    selectFullName: createSelector(selectCurrentUser, (user: ICurrentUser | null): string =>
      user ? user.name + Constants.EMPTY_SPACE_STRING + user.surname : Constants.EMPTY_STRING,
    ),
    selectEmail: createSelector(
      selectCurrentUser,
      (user: ICurrentUser | null): string => user?.email ?? Constants.EMPTY_STRING,
    ),
  }),
});
