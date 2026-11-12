import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../core/constants/constants';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';

import type { Signal, WritableSignal } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import type { TranslationKey } from '../../../core/types/translation.type';
import type { IPasswordConfirmModalData } from '../../models/account-settings-dialog.model';

@Component({
  selector: 'app-password-confirm-modal',
  imports: [ButtonComponent, InputFieldComponent, TranslatePipe],
  templateUrl: './password-confirm-modal.component.html',
  styleUrl: './password-confirm-modal.component.scss',
})
export class PasswordConfirmModalComponent<R = unknown> {
  private readonly dialogRef: DialogRef<R, PasswordConfirmModalComponent<R>> =
    inject<DialogRef<R, PasswordConfirmModalComponent<R>>>(DialogRef);

  public readonly data: IPasswordConfirmModalData<R> =
    inject<IPasswordConfirmModalData<R>>(DIALOG_DATA);

  public readonly password: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isSubmitting: WritableSignal<boolean> = signal<boolean>(false);

  public readonly errors: WritableSignal<readonly ValidationError.WithOptionalFieldTree[]> = signal<
    readonly ValidationError.WithOptionalFieldTree[]
  >([]);

  public readonly hasError: Signal<boolean> = computed(() => this.errors().length > Constants.ZERO);

  public readonly canSubmit: Signal<boolean> = computed(
    () => this.password().length > Constants.ZERO && !this.isSubmitting(),
  );

  public onPasswordChange(password: string): void {
    this.password.set(password);
    this.errors.set([]);
  }

  public onTogglePasswordVisibility(): void {
    this.isPasswordVisible.update((isVisible: boolean) => !isVisible);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public async onConfirm(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const result: R = await firstValueFrom(this.data.submit(this.password()));
      this.dialogRef.close(result);
    } catch (error: unknown) {
      this.setError(
        error instanceof HttpErrorResponse && error.status === Constants.HTTP_FORBIDDEN_STATUS
          ? 'accountSettings.errors.incorrectPassword'
          : 'accountSettings.errors.requestFailed',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private setError(message: TranslationKey): void {
    this.errors.set([{ kind: Constants.SERVER_ERROR, message: message }]);
  }
}
