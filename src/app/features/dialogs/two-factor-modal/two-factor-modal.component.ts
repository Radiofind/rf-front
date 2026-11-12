import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, interval, map, takeWhile } from 'rxjs';
import { Store } from '@ngrx/store';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CodeFieldComponent } from '../../../shared/components/code-field/code-field.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { AuthService } from '../../services/auth-service/auth.service';
import { AuthValidationMessages } from '../../constants/auth-error-messages.constant';
import { TwoFactorModalActions } from '../../../store/ui/two-factor-modal.actions';
import { TwoFactorMethodEnum } from '../../../core/enums/two-factor-method.enum';

import type { Signal, WritableSignal } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { ValidationError } from '@angular/forms/signals';
import type { ITwoFactorModalData } from '../../models/two-factor.model';
import type { ITwoFactorData, ITwoFactorResponse } from '../../../core/models/auth.model';
import type { TranslationKey } from '../../../core/types/translation.type';

@Component({
  selector: 'app-two-factor-modal',
  imports: [
    ButtonComponent,
    CodeFieldComponent,
    InputFieldComponent,
    SpinnerComponent,
    TranslatePipe,
  ],
  templateUrl: './two-factor-modal.component.html',
  styleUrl: './two-factor-modal.component.scss',
})
export class TwoFactorModalComponent {
  private readonly dialogRef: DialogRef<string, TwoFactorModalComponent> =
    inject<DialogRef<string, TwoFactorModalComponent>>(DialogRef);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly authService: AuthService = inject(AuthService);

  private readonly store: Store = inject(Store);

  public readonly data: ITwoFactorModalData = inject<ITwoFactorModalData>(DIALOG_DATA);

  public readonly code: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly isAuthenticator: boolean = this.data.method === TwoFactorMethodEnum.AUTHENTICATOR;

  public readonly descriptionStart: TranslationKey =
    this.data.method === TwoFactorMethodEnum.RECOVERY_EMAIL
      ? 'twoFactor.recoveryDescriptionStart'
      : 'twoFactor.descriptionStart';

  public readonly isBackupCodeMode: WritableSignal<boolean> = signal<boolean>(false);

  public readonly backupCode: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly isBackupCodeComplete: Signal<boolean> = computed(
    () =>
      this.backupCode().replace(Constants.BACKUP_CODE_SEPARATORS_PATTERN, Constants.EMPTY_STRING)
        .length === Constants.BACKUP_CODE_LENGTH,
  );

  public readonly isResending: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isLocked: WritableSignal<boolean> = signal<boolean>(false);

  public readonly resendSeconds: WritableSignal<number> = signal<number>(
    Constants.RESEND_TIMEOUT_SECONDS,
  );

  public readonly codeErrors: WritableSignal<readonly ValidationError.WithOptionalFieldTree[]> =
    signal<readonly ValidationError.WithOptionalFieldTree[]>([]);

  public readonly hasCodeError: Signal<boolean> = computed(
    () => this.codeErrors().length > Constants.ZERO,
  );

  public readonly isCodeComplete: Signal<boolean> = computed(
    () => this.code().length === Constants.CODE_FIELD_DEFAULT_LENGTH,
  );

  public readonly canResend: Signal<boolean> = computed(
    () => this.resendSeconds() === Constants.ZERO,
  );

  public readonly resendTimer: Signal<string> = computed(() => {
    const seconds: number = this.resendSeconds();
    const minutesPart: number = Math.floor(seconds / Constants.SECONDS_IN_MINUTE);
    const secondsPart: number = seconds % Constants.SECONDS_IN_MINUTE;

    return [minutesPart, secondsPart]
      .map((part) => String(part).padStart(Constants.TIME_PAD_LENGTH, Constants.ZERO_STRING))
      .join(Constants.TIME_SEPARATOR);
  });

  private countdownSubscription?: Subscription;

  constructor() {
    this.startCountdown();
  }

  public onCodeChange(code: string): void {
    this.code.set(code);

    if (!this.isLocked()) {
      this.codeErrors.set([]);
    }
  }

  public onBackupCodeChange(code: string): void {
    this.backupCode.set(code);

    if (!this.isLocked()) {
      this.codeErrors.set([]);
    }
  }

  public onToggleBackupCodeMode(): void {
    this.isBackupCodeMode.update((isBackupCodeMode: boolean) => !isBackupCodeMode);

    if (!this.isLocked()) {
      this.codeErrors.set([]);
    }
  }

  public async onVerify(): Promise<void> {
    if (this.isLocked()) {
      return;
    }

    const isBackupCodeMode: boolean = this.isBackupCodeMode();
    const twoFactorData: ITwoFactorData = {
      challengeId: this.data.challengeId,
      code: isBackupCodeMode ? this.backupCode() : this.code(),
    };

    try {
      const response: ITwoFactorResponse = await firstValueFrom(
        isBackupCodeMode
          ? this.authService.verifyBackupCode(twoFactorData)
          : this.authService.twoFactorAuth(twoFactorData),
      );
      this.store.dispatch(TwoFactorModalActions.verified({ token: response.token }));
      this.dialogRef.close(twoFactorData.code);
    } catch (error: unknown) {
      const status: number | undefined = this.statusOf(error);

      if (status === Constants.HTTP_TOO_MANY_REQUESTS_STATUS) {
        this.lock(AuthValidationMessages.TOO_MANY_TWO_FACTOR_ATTEMPTS);
        return;
      }

      this.setCodeError(
        status === Constants.HTTP_BAD_REQUEST_STATUS
          ? AuthValidationMessages.TWO_FACTOR_CODE_NO_LONGER_VALID
          : isBackupCodeMode
            ? AuthValidationMessages.INVALID_BACKUP_CODE
            : AuthValidationMessages.INVALID_TWO_FACTOR_CODE,
      );
    }
  }

  public async onResend(): Promise<void> {
    if (this.isResending() || this.isLocked()) {
      return;
    }

    this.isResending.set(true);
    this.code.set(Constants.EMPTY_STRING);
    this.codeErrors.set([]);

    try {
      await firstValueFrom(
        this.authService.resendTwoFactorAuth({
          challengeId: this.data.challengeId,
        }),
      );
      this.startCountdown();
    } catch (error: unknown) {
      const status: number | undefined = this.statusOf(error);

      if (status === Constants.HTTP_TOO_MANY_REQUESTS_STATUS) {
        this.lock(AuthValidationMessages.TOO_MANY_TWO_FACTOR_RESENDS);
      } else if (status === Constants.HTTP_BAD_REQUEST_STATUS) {
        this.lock(AuthValidationMessages.TWO_FACTOR_SESSION_EXPIRED);
      } else {
        this.setCodeError(AuthValidationMessages.RESEND_TWO_FACTOR_CODE_FAILED);
      }
    } finally {
      this.isResending.set(false);
    }
  }

  private lock(message: TranslationKey): void {
    this.isLocked.set(true);
    this.countdownSubscription?.unsubscribe();
    this.setCodeError(message);
  }

  private setCodeError(message: TranslationKey): void {
    this.codeErrors.set([{ kind: Constants.SERVER_ERROR, message: message }]);
  }

  private statusOf(error: unknown): number | undefined {
    return error instanceof HttpErrorResponse ? error.status : undefined;
  }

  private startCountdown(): void {
    this.countdownSubscription?.unsubscribe();
    this.resendSeconds.set(Constants.RESEND_TIMEOUT_SECONDS);

    this.countdownSubscription = interval(Constants.TIMER_INTERVAL_MS)
      .pipe(
        map((tick) => Constants.RESEND_TIMEOUT_SECONDS - tick - Constants.ONE),
        takeWhile((seconds) => seconds >= Constants.ZERO),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((seconds) => {
        this.resendSeconds.set(seconds);
      });
  }
}
