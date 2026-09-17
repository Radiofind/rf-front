import { Component, inject, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { form, FormRoot, FormField } from "@angular/forms/signals";
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Constants } from '../../../core/constants/constants';
import { forgetPasswordSchema } from '../../schemas/forget-password.schema';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';

import type { WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IForgetPasswordForm } from '../../models/forget-password.model';

@Component({
  selector: 'app-forget-password-modal',
  imports: [ButtonComponent, FormRoot, InputFieldComponent, FormField],
  templateUrl: './forget-password-modal.component.html',
  styleUrl: './forget-password-modal.component.scss',
})
export class ForgetPasswordModalComponent {
  private readonly dialogRef: DialogRef<string, ForgetPasswordModalComponent> =
  inject<DialogRef<string, ForgetPasswordModalComponent>>(DialogRef);

  private readonly authService: AuthService = inject(AuthService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  public readonly shieldIconClass: string = Constants.SHIELD_ICON_CLASS;

  public readonly mailIconClass: string = Constants.MAIL_ICON_CLASS;

  public readonly submitIconClass: string = Constants.SUBMIT_ICON_CLASS;

  private readonly forgetPasswordModel: WritableSignal<IForgetPasswordForm> = signal<IForgetPasswordForm>({
    email: Constants.EMPTY_STRING,
  })

  public readonly forgetPasswordForm: FieldTree<IForgetPasswordForm> = form<IForgetPasswordForm>(
    this.forgetPasswordModel,
    forgetPasswordSchema,
    {
      submission: { action: () => this.sendResetLink() }
    }
  );

  public async sendResetLink(): Promise<void> {
    this.dialogRef.close();
    await firstValueFrom(this.authService.forgetPassword({
      email: this.forgetPasswordForm.email().value(),
    }));
    this.snackbarService.success('Email sent successfully');
  }
}
