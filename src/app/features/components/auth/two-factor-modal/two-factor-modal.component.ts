import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, map, takeWhile } from 'rxjs';
import { Constants } from '../../../../core/constants/constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CodeFieldComponent } from '../../../../shared/components/code-field/code-field.component';

import type { Signal, WritableSignal } from '@angular/core';
import type { Subscription } from 'rxjs';
import type { ITwoFactorModalData } from '../../../models/two-factor.model';

@Component({
  selector: 'app-two-factor-modal',
  imports: [ButtonComponent, CodeFieldComponent],
  templateUrl: './two-factor-modal.component.html',
  styleUrl: './two-factor-modal.component.scss',
})

export class TwoFactorModalComponent {
  private readonly dialogRef: DialogRef<string, TwoFactorModalComponent> =
    inject<DialogRef<string, TwoFactorModalComponent>>(DialogRef);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly data: ITwoFactorModalData = inject<ITwoFactorModalData>(DIALOG_DATA);

  public readonly codeLength: number = Constants.CODE_FIELD_DEFAULT_LENGTH;

  public readonly shieldIconClass: string = Constants.SHIELD_ICON_CLASS;

  public readonly lockIconClass: string = Constants.LOCK_ICON_CLASS;

  public readonly submitIconClass: string = Constants.SUBMIT_ICON_CLASS;

  public readonly code: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly resendSeconds: WritableSignal<number> = signal<number>(
    Constants.RESEND_TIMEOUT_SECONDS,
  );

  public readonly isCodeComplete: Signal<boolean> = computed(() => this.code().length === this.codeLength);

  public readonly canResend: Signal<boolean> = computed(() => this.resendSeconds() === Constants.ZERO);

  public readonly resendTimer: Signal<string> = computed(() => {
    const seconds: number = this.resendSeconds();
    const minutesPart: number = Math.floor(seconds / Constants.SECONDS_IN_MINUTE);
    const secondsPart: number = seconds % Constants.SECONDS_IN_MINUTE;

    return [minutesPart, secondsPart]
      .map(part => String(part).padStart(Constants.TIME_PAD_LENGTH, Constants.ZERO_STRING))
      .join(Constants.TIME_SEPARATOR);
  });

  private countdownSubscription?: Subscription;

  public constructor() {
    this.startCountdown();
  }

  public onVerify(): void {
    if (!this.isCodeComplete()) {
      return;
    };

    this.dialogRef.close(this.code());
  }

  public onResend(): void {
    this.code.set(Constants.EMPTY_STRING);
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdownSubscription?.unsubscribe();
    this.resendSeconds.set(Constants.RESEND_TIMEOUT_SECONDS);

    this.countdownSubscription = interval(Constants.TIMER_INTERVAL_MS)
      .pipe(
        map(tick => Constants.RESEND_TIMEOUT_SECONDS - tick - Constants.ONE),
        takeWhile(seconds => seconds >= Constants.ZERO),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(seconds => {
        this.resendSeconds.set(seconds);
      });
  }
}
