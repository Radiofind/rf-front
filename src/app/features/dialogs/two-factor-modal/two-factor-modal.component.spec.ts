import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';
import { TwoFactorModalComponent } from './two-factor-modal.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { Constants } from '../../../core/constants/constants';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';

import type { ComponentFixture } from '@angular/core/testing';

describe('TwoFactorModalComponent', () => {
  let fixture: ComponentFixture<TwoFactorModalComponent>;
  let component: TwoFactorModalComponent;
  let close: ReturnType<typeof vi.fn>;
  let twoFactorAuth: ReturnType<typeof vi.fn>;
  let resendTwoFactorAuth: ReturnType<typeof vi.fn>;

  const createFixture = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: DIALOG_DATA, useValue: { email: 'ada@example.com', challengeId: 'challenge' } },
        {
          provide: AuthService,
          useValue: { twoFactorAuth: twoFactorAuth, resendTwoFactorAuth: resendTwoFactorAuth },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TwoFactorModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });

    close = vi.fn();
    twoFactorAuth = vi
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
      AuthValidationMessages.INVALID_TWO_FACTOR_CODE,
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
});
