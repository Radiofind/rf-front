import { createFeature, createReducer, on } from '@ngrx/store';
import { MainLayoutActions } from '../ui/main-layout.actions';
import { AvatarActions } from './avatar.actions';

export interface IAvatarState {
  url: string | null;
}

export const initialAvatarState: IAvatarState = {
  url: null,
};

export const avatarFeature = createFeature({
  name: 'avatar',
  reducer: createReducer(
    initialAvatarState,
    on(
      AvatarActions.urlChanged,
      (state: IAvatarState, { url }: { url: string | null }): IAvatarState => ({
        ...state,
        url: url,
      }),
    ),
    on(MainLayoutActions.closed, (): IAvatarState => initialAvatarState),
  ),
});
