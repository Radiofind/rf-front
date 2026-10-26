import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { unsavedChangesGuard } from './unsaved-changes.guard';
import { ModalService } from '../../../shared/services/modal-service/modal.service';
import { Constants } from '../../constants/constants';

import type { ActivatedRouteSnapshot, GuardResult, RouterStateSnapshot } from '@angular/router';
import type { Observable } from 'rxjs';

describe('unsavedChangesGuard', () => {
  let confirm: ReturnType<typeof vi.fn>;

  const runGuard = (hasUnsavedChanges: boolean): boolean | Observable<GuardResult> =>
    TestBed.runInInjectionContext(
      () =>
        unsavedChangesGuard(
          { hasUnsavedChanges: () => hasUnsavedChanges },
          {} as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
          {} as RouterStateSnapshot,
        ) as boolean | Observable<GuardResult>,
    );

  beforeEach(() => {
    confirm = vi.fn();

    TestBed.configureTestingModule({
      providers: [{ provide: ModalService, useValue: { confirm: confirm } }],
    });
  });

  it('lets the user leave without asking when nothing is changed', () => {
    expect(runGuard(false)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks with No and Yes buttons when there are unsaved changes', () => {
    confirm.mockReturnValue(of(true));

    runGuard(true);

    expect(confirm).toHaveBeenCalledWith(
      {
        message: Constants.UNSAVED_CHANGES_MESSAGE,
        confirmText: Constants.YES,
        cancelText: Constants.NO,
      },
      {
        title: Constants.UNSAVED_CHANGES_TITLE,
        iconClass: Constants.UNSAVED_CHANGES_ICON_CLASS,
      },
    );
  });

  it.each([
    [true, 'leaves after Yes'],
    [false, 'stays after No or closing the dialog'],
  ])('resolves to %s, so the user %s', async (answer: boolean) => {
    confirm.mockReturnValue(of(answer));

    const result: boolean | Observable<GuardResult> = runGuard(true);

    expect(isObservable(result)).toBe(true);
    await expect(firstValueFrom(result as Observable<GuardResult>)).resolves.toBe(answer);
  });
});
