import { inject } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { TokenStorageService } from '../../core/services/token-storage/token-storage.service';
import { authFeature } from './auth.feature';
import * as authEffects from './auth.effects';

import type { EnvironmentProviders } from '@angular/core';
import type { IAuthState } from './auth.feature';

export function provideAuthState(): EnvironmentProviders[] {
  return [
    provideState(authFeature.name, authFeature.reducer, {
      initialState: (): IAuthState => ({ token: inject(TokenStorageService).read() }),
    }),
    provideEffects(authEffects),
  ];
}
