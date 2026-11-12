import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TwoFactorModalComponent } from './two-factor-modal.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { Constants } from '../../../core/constants/constants';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { TwoFactorModalActions } from '../../../store/ui/two-factor-modal.actions';
import { TwoFactorMethodEnum } from '../../../core/enums/two-factor-method.enum';

import { translate } from '../../../../test-translate';
import type { ComponentFixture } from '@angular/core/testing';
import type { ITwoFactorModalData } from '../../models/two-factor.model';

describe('TwoFactorModalComponent', () => {
  let fixture: ComponentFixture<TwoFactorModalComponent>;
  let component: TwoFactorModalComponent;
  let close: ReturnType<typeof vi.fn>;
  let twoFactorAuth: ReturnType<typeof vi.fn>;
  let resendTwoFactorAuth: ReturnType<typeof vi.fn>;
  let verifyBackupCode: ReturnType<typeof vi.fn>;
  let modalData: ITwoFactorModalData;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const createFixture = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: DIALOG_DATA, useValue: modalData },
        {
          provide: AuthService,
          useValue: {
            twoFactorAuth: twoFactorAuth,
            resendTwoFactorAuth: resendTwoFactorAuth,
            verifyBackupCode: verifyBackupCode,
          },
        },
        provideMockStore(),
      ],
    }).compileComponents();

    dispatch = vi.spyOn(TestBed.inject(MockStore), 'dispatch');

    fixture = TestBed.createComponent(TwoFactorModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });

    close = vi.fn();
    modalData = {
      email: 'ada@example.com',
      challengeId: 'challenge',
      method: TwoFactorMethodEnum.EMAIL,
    };
    twoFactorAuth = vi
      .fn()
      .mockReturnValue(of({ challengeId: null, requiresTwoFactor: false, token: 'jwt' }));
    verifyBackupCode = vi
      .fn()
      .mockReturnValue(of({ challengeId: null, requiresTwoFactor: false, token: 'jwt' }));
    resendTwoFactorAuth = vi
      .fn()
      .mockReturnValue(of({ challengeId: 'challenge', requiresTwoFactor: true, token: null }));

    await createFixture();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the masked destination and the code field', () => {
    expect(fixture.nativeElement.querySelector('.two-factor__email').textContent).toBe(
      'ada@example.com',
    );
    expect(fixture.nativeElement.querySelectorAll('.code-field__cell')).toHaveLength(
      Constants.CODE_FIELD_DEFAULT_LENGTH,
    );
  });

  it('starts the resend countdown at the configured timeout', () => {
    expect(component.resendSeconds()).toBe(Constants.RESEND_TIMEOUT_SECONDS);
    expect(component.canResend()).toBe(false);
    expect(component.resendTimer()).toBe('00:45');
  });

  it('formats the countdown as minutes and seconds', () => {
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS);
    expect(component.resendTimer()).toBe('00:44');

    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * 14);
    expect(component.resendTimer()).toBe('00:30');
  });

  it('enables resending once the countdown reaches zero', () => {
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * Constants.RESEND_TIMEOUT_SECONDS);

    expect(component.resendSeconds()).toBe(0);
    expect(component.canResend()).toBe(true);
    expect(component.resendTimer()).toBe('00:00');
  });

  it('keeps the verify button disabled until the code is complete', async () => {
    const verifyButton = (): HTMLButtonElement =>
      fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;

    expect(component.isCodeComplete()).toBe(false);
    expect(verifyButton().disabled).toBe(true);

    component.onCodeChange('123456');
    await fixture.whenStable();

    expect(component.isCodeComplete()).toBe(true);
    expect(verifyButton().disabled).toBe(false);
  });

  it('clears previous errors when the code changes', () => {
    component.codeErrors.set([{ kind: 'server', message: 'nope' }]);

    component.onCodeChange('1');

    expect(component.code()).toBe('1');
    expect(component.codeErrors()).toEqual([]);
    expect(component.hasCodeError()).toBe(false);
  });

  it('verifies the code and closes with it', async () => {
    component.onCodeChange('123456');

    await component.onVerify();

    expect(twoFactorAuth).toHaveBeenCalledWith({ challengeId: 'challenge', code: '123456' });
    expect(close).toHaveBeenCalledWith('123456');
  });

  it('hands the issued token to the store once the code is verified', async () => {
    component.onCodeChange('123456');

    await component.onVerify();

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(
      TwoFactorModalActions.verified({ token: 'jwt' }),
    );
  });

  it('hands nothing to the store when verification fails', async () => {
    twoFactorAuth.mockReturnValue(throwError(() => new Error('401')));
    component.onCodeChange('123456');

    await component.onVerify();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows an error and stays open when verification fails', async () => {
    twoFactorAuth.mockReturnValue(throwError(() => new Error('401')));
    component.onCodeChange('123456');

    await component.onVerify();
    await fixture.whenStable();

    expect(close).not.toHaveBeenCalled();
    expect(component.codeErrors()).toEqual([
      { kind: Constants.SERVER_ERROR, message: AuthValidationMessages.INVALID_TWO_FACTOR_CODE },
    ]);
    expect(fixture.nativeElement.querySelector('.code-field__errors').textContent).toContain(
      translate(AuthValidationMessages.INVALID_TWO_FACTOR_CODE),
    );
  });

  it('resends the code, clears the input and restarts the countdown', async () => {
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * Constants.RESEND_TIMEOUT_SECONDS);
    component.onCodeChange('123');

    await component.onResend();

    expect(resendTwoFactorAuth).toHaveBeenCalledWith({ challengeId: 'challenge' });
    expect(component.code()).toBe('');
    expect(component.resendSeconds()).toBe(Constants.RESEND_TIMEOUT_SECONDS);
    expect(component.isResending()).toBe(false);
  });

  it('reports a failed resend without restarting the countdown', async () => {
    resendTwoFactorAuth.mockReturnValue(throwError(() => new Error('500')));
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * Constants.RESEND_TIMEOUT_SECONDS);

    await component.onResend();

    expect(component.codeErrors()).toEqual([
      {
        kind: Constants.SERVER_ERROR,
        message: AuthValidationMessages.RESEND_TWO_FACTOR_CODE_FAILED,
      },
    ]);
    expect(component.canResend()).toBe(true);
    expect(component.isResending()).toBe(false);
  });

  it('asks for a new code when the current one is no longer valid', async () => {
    twoFactorAuth.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_BAD_REQUEST_STATUS })),
    );
    component.onCodeChange('123456');

    await component.onVerify();

    expect(component.codeErrors()).toEqual([
      {
        kind: Constants.SERVER_ERROR,
        message: AuthValidationMessages.TWO_FACTOR_CODE_NO_LONGER_VALID,
      },
    ]);
    expect(component.isLocked()).toBe(false);
  });

  it('locks the modal after too many attempts', async () => {
    twoFactorAuth.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_TOO_MANY_REQUESTS_STATUS })),
    );
    component.onCodeChange('123456');

    await component.onVerify();
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(component.isLocked()).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(buttons[0]?.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.code-field__errors').textContent).toContain(
      translate(AuthValidationMessages.TOO_MANY_TWO_FACTOR_ATTEMPTS),
    );
  });

  it('keeps the lock message while the user keeps typing', async () => {
    twoFactorAuth.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_TOO_MANY_REQUESTS_STATUS })),
    );
    component.onCodeChange('123456');
    await component.onVerify();

    component.onCodeChange('654321');
    await component.onVerify();

    expect(twoFactorAuth).toHaveBeenCalledTimes(1);
    expect(component.codeErrors()).toEqual([
      {
        kind: Constants.SERVER_ERROR,
        message: AuthValidationMessages.TOO_MANY_TWO_FACTOR_ATTEMPTS,
      },
    ]);
  });

  it('locks the modal once the resend limit is reached', async () => {
    resendTwoFactorAuth.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_TOO_MANY_REQUESTS_STATUS })),
    );
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * Constants.RESEND_TIMEOUT_SECONDS);

    await component.onResend();
    await component.onResend();
    await fixture.whenStable();

    expect(resendTwoFactorAuth).toHaveBeenCalledTimes(1);
    expect(component.isLocked()).toBe(true);
    expect(component.codeErrors()).toEqual([
      { kind: Constants.SERVER_ERROR, message: AuthValidationMessages.TOO_MANY_TWO_FACTOR_RESENDS },
    ]);
    expect(
      (fixture.nativeElement.querySelector('.two-factor__resend-action') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('locks the modal when the verification session has expired', async () => {
    resendTwoFactorAuth.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_BAD_REQUEST_STATUS })),
    );
    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * Constants.RESEND_TIMEOUT_SECONDS);

    await component.onResend();

    expect(component.isLocked()).toBe(true);
    expect(component.codeErrors()).toEqual([
      { kind: Constants.SERVER_ERROR, message: AuthValidationMessages.TWO_FACTOR_SESSION_EXPIRED },
    ]);
  });

  it('ignores a resend while one is already running', async () => {
    component.isResending.set(true);

    await component.onResend();

    expect(resendTwoFactorAuth).not.toHaveBeenCalled();
  });

  it('swaps the resend button for a spinner while resending', async () => {
    component.isResending.set(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.two-factor__resend-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.two-factor__resend-action')).toBeNull();
  });

  it('stops the countdown once the modal is destroyed', () => {
    fixture.destroy();

    vi.advanceTimersByTime(Constants.TIMER_INTERVAL_MS * 5);

    expect(component.resendSeconds()).toBe(Constants.RESEND_TIMEOUT_SECONDS);
  });

  it('signs in with a backup code instead of the email code', async () => {
    component.onToggleBackupCodeMode();
    component.onBackupCodeChange('abcde-fghjk');

    await component.onVerify();

    expect(verifyBackupCode).toHaveBeenCalledWith({
      challengeId: 'challenge',
      code: 'abcde-fghjk',
    });
    expect(twoFactorAuth).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(TwoFactorModalActions.verified({ token: 'jwt' }));
  });

  it('tells the user when the backup code is not valid', async () => {
    verifyBackupCode.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Constants.HTTP_UNAUTHORIZED_STATUS })),
    );
    component.onToggleBackupCodeMode();
    component.onBackupCodeChange('ABCDE-FGHJK');

    await component.onVerify();

    expect(component.codeErrors()[0]?.message).toBe(AuthValidationMessages.INVALID_BACKUP_CODE);
    expect(close).not.toHaveBeenCalled();
  });

  it('keeps the verify button disabled until the backup code is complete', async () => {
    component.onToggleBackupCodeMode();
    component.onBackupCodeChange('ABCDE');
    await fixture.whenStable();

    expect(component.isBackupCodeComplete()).toBe(false);
  });

  it('asks for the authenticator code without offering to resend it', async () => {
    TestBed.resetTestingModule();
    modalData = {
      email: 'ada@example.com',
      challengeId: 'challenge',
      method: TwoFactorMethodEnum.AUTHENTICATOR,
    };

    await createFixture();

    expect(fixture.nativeElement.querySelector('.two-factor__description').textContent).toContain(
      'authenticator app',
    );
    expect(fixture.nativeElement.querySelector('.two-factor__resend')).toBeNull();
  });

  it('lets the user type the authenticator code', async () => {
    TestBed.resetTestingModule();
    modalData = {
      email: 'ada@example.com',
      challengeId: 'challenge',
      method: TwoFactorMethodEnum.AUTHENTICATOR,
    };

    await createFixture();

    expect(fixture.nativeElement.querySelectorAll('.code-field__cell')).toHaveLength(
      Constants.CODE_FIELD_DEFAULT_LENGTH,
    );
  });

  it('names the recovery email as the destination', async () => {
    TestBed.resetTestingModule();
    modalData = {
      email: 'ba***@example.com',
      challengeId: 'challenge',
      method: TwoFactorMethodEnum.RECOVERY_EMAIL,
    };

    await createFixture();

    expect(fixture.nativeElement.querySelector('.two-factor__description').textContent).toContain(
      'recovery email',
    );
  });
});
