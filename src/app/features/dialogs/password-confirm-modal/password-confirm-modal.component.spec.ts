import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PasswordConfirmModalComponent } from './password-confirm-modal.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('PasswordConfirmModalComponent', () => {
  let close: ReturnType<typeof vi.fn>;
  let submit: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<ComponentFixture<PasswordConfirmModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [PasswordConfirmModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        {
          provide: DIALOG_DATA,
          useValue: {
            message: 'accountSettings.deleteAccountMessage',
            confirmText: 'accountSettings.deleteAccount',
            submit: submit,
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<PasswordConfirmModalComponent> = TestBed.createComponent(
      PasswordConfirmModalComponent,
    );
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    close = vi.fn();
    submit = vi.fn().mockReturnValue(of('done'));
  });

  it('cannot be confirmed without a password', async () => {
    const fixture: ComponentFixture<PasswordConfirmModalComponent> = await createFixture();

    await fixture.componentInstance.onConfirm();

    expect(submit).not.toHaveBeenCalled();
  });

  it('closes with the result of the confirmed action', async () => {
    const fixture: ComponentFixture<PasswordConfirmModalComponent> = await createFixture();
    fixture.componentInstance.onPasswordChange('secret');

    await fixture.componentInstance.onConfirm();

    expect(submit).toHaveBeenCalledWith('secret');
    expect(close).toHaveBeenCalledWith('done');
  });

  it('stays open and names a wrong password', async () => {
    submit.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_FORBIDDEN_STATUS })),
    );
    const fixture: ComponentFixture<PasswordConfirmModalComponent> = await createFixture();
    fixture.componentInstance.onPasswordChange('wrong');

    await fixture.componentInstance.onConfirm();

    expect(close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errors()[0]?.message).toBe(
      'accountSettings.errors.incorrectPassword',
    );
  });

  it('reports any other failure as a general error', async () => {
    submit.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_CONFLICT_STATUS })),
    );
    const fixture: ComponentFixture<PasswordConfirmModalComponent> = await createFixture();
    fixture.componentInstance.onPasswordChange('secret');

    await fixture.componentInstance.onConfirm();

    expect(fixture.componentInstance.errors()[0]?.message).toBe(
      'accountSettings.errors.requestFailed',
    );
  });
});
