import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { toDataURL } from 'qrcode';
import { Constants } from '../../../core/constants/constants';
import { TwoFactorMethodEnum } from '../../../core/enums/two-factor-method.enum';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CodeFieldComponent } from '../../../shared/components/code-field/code-field.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { TWO_FACTOR_METHOD_OPTIONS } from '../../constants/settings.constant';
import { UserService } from '../../services/user-service/user.service';

import type { Signal, WritableSignal } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import type { ISecurityOverview, ITwoFactorEnrollment } from '../../../core/models/settings.model';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { TwoFactorMethod } from '../../../core/types/two-factor-method.type';
import type {
  ITwoFactorMethodModalData,
  ITwoFactorMethodOption,
} from '../../models/account-settings-dialog.model';

@Component({
  selector: 'app-two-factor-method-modal',
  imports: [ButtonComponent, CodeFieldComponent, InputFieldComponent, TranslatePipe],
  templateUrl: './two-factor-method-modal.component.html',
  styleUrl: './two-factor-method-modal.component.scss',
})
export class TwoFactorMethodModalComponent {
  private readonly dialogRef: DialogRef<ISecurityOverview, TwoFactorMethodModalComponent> =
    inject<DialogRef<ISecurityOverview, TwoFactorMethodModalComponent>>(DialogRef);

  private readonly userService: UserService = inject(UserService);

  public readonly data: ITwoFactorMethodModalData = inject<ITwoFactorMethodModalData>(DIALOG_DATA);

  public readonly options: readonly ITwoFactorMethodOption[] = TWO_FACTOR_METHOD_OPTIONS;

  public readonly method: WritableSignal<TwoFactorMethod> = signal<TwoFactorMethod>(
    this.data.security.twoFactorMethod,
  );

  public readonly password: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false);

  public readonly code: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly enrollment: WritableSignal<ITwoFactorEnrollment | null> =
    signal<ITwoFactorEnrollment | null>(null);

  public readonly qrCode: WritableSignal<string | null> = signal<string | null>(null);

  public readonly isSubmitting: WritableSignal<boolean> = signal<boolean>(false);

  public readonly errors: WritableSignal<readonly ValidationError.WithOptionalFieldTree[]> = signal<
    readonly ValidationError.WithOptionalFieldTree[]
  >([]);

  public readonly hasError: Signal<boolean> = computed(() => this.errors().length > Constants.ZERO);

  public readonly canStart: Signal<boolean> = computed(
    () =>
      this.method() !== this.data.security.twoFactorMethod &&
      this.password().length > Constants.ZERO &&
      !this.isSubmitting(),
  );

  public readonly canConfirm: Signal<boolean> = computed(
    () => this.code().length === Constants.CODE_FIELD_DEFAULT_LENGTH && !this.isSubmitting(),
  );

  public isCurrent(method: TwoFactorMethod): boolean {
    return method === this.data.security.twoFactorMethod;
  }

  public isUnavailable(method: TwoFactorMethod): boolean {
    return method === TwoFactorMethodEnum.RECOVERY_EMAIL && !this.data.security.recoveryEmail;
  }

  public destinationOf(method: TwoFactorMethod): string | null {
    if (method === TwoFactorMethodEnum.EMAIL) {
      return this.data.security.email;
    }

    return method === TwoFactorMethodEnum.RECOVERY_EMAIL ? this.data.security.recoveryEmail : null;
  }

  public onMethodChange(method: TwoFactorMethod): void {
    this.method.set(method);
    this.errors.set([]);
  }

  public onPasswordChange(password: string): void {
    this.password.set(password);
    this.errors.set([]);
  }

  public onTogglePasswordVisibility(): void {
    this.isPasswordVisible.update((isVisible: boolean) => !isVisible);
  }

  public onCodeChange(code: string): void {
    this.code.set(code);
    this.errors.set([]);
  }

  public onBack(): void {
    this.enrollment.set(null);
    this.qrCode.set(null);
    this.code.set(Constants.EMPTY_STRING);
    this.errors.set([]);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public async onStart(): Promise<void> {
    if (!this.canStart()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const enrollment: ITwoFactorEnrollment = await firstValueFrom(
        this.userService.startTwoFactorEnrollment(this.method(), this.password()),
      );

      if (enrollment.otpauthUri) {
        this.qrCode.set(await toDataURL(enrollment.otpauthUri, { margin: 1, width: 200 }));
      }

      this.password.set(Constants.EMPTY_STRING);
      this.enrollment.set(enrollment);
    } catch (error: unknown) {
      this.setError(this.startErrorOf(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public async onConfirm(): Promise<void> {
    if (!this.canConfirm()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const security: ISecurityOverview = await firstValueFrom(
        this.userService.confirmTwoFactorEnrollment(this.code()),
      );
      this.dialogRef.close(security);
    } catch (error: unknown) {
      this.handleConfirmError(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleConfirmError(error: unknown): void {
    const status: number | undefined = this.statusOf(error);

    if (status === Constants.HTTP_UNPROCESSABLE_CONTENT_STATUS) {
      this.setError('accountSettings.errors.invalidCode');
      return;
    }

    this.onBack();
    this.setError(
      status === Constants.HTTP_GONE_STATUS || status === Constants.HTTP_TOO_MANY_REQUESTS_STATUS
        ? 'accountSettings.errors.setupExpired'
        : 'accountSettings.errors.requestFailed',
    );
  }

  private startErrorOf(error: unknown): TranslationKey {
    switch (this.statusOf(error)) {
      case Constants.HTTP_FORBIDDEN_STATUS:
        return 'accountSettings.errors.incorrectPassword';
      case Constants.HTTP_CONFLICT_STATUS:
        return 'accountSettings.errors.noRecoveryEmail';
      default:
        return 'accountSettings.errors.requestFailed';
    }
  }

  private statusOf(error: unknown): number | undefined {
    return error instanceof HttpErrorResponse ? error.status : undefined;
  }

  private setError(message: TranslationKey): void {
    this.errors.set([{ kind: Constants.SERVER_ERROR, message: message }]);
  }
}
