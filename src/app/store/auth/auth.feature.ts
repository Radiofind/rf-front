import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthFormActions } from '../ui/auth-form.actions';
import { TwoFactorModalActions } from '../ui/two-factor-modal.actions';
import { signOutActions, TokenStorageActions } from './auth.actions';

export interface IAuthState {
  token: string | null;
}

export const initialAuthState: IAuthState = {
  token: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(
      AuthFormActions.registered,
      TwoFactorModalActions.verified,
      TokenStorageActions.tokenChanged,
      (state: IAuthState, { token }: { token: string | null }): IAuthState => ({
        ...state,
        token: token,
      }),
    ),
    on(...signOutActions, (state: IAuthState): IAuthState => ({ ...state, token: null })),
  ),
});
