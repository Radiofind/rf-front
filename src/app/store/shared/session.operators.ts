import { ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs';
import { MainLayoutActions } from '../ui/main-layout.actions';

import type { Actions } from '@ngrx/effects';
import type { MonoTypeOperatorFunction } from 'rxjs';

export function untilLayoutClosed<T>(actions$: Actions): MonoTypeOperatorFunction<T> {
  return takeUntil(actions$.pipe(ofType(MainLayoutActions.closed)));
}
