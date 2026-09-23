import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormRoot, FormField } from '@angular/forms/signals';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../core/constants/constants';
import { AuthService } from '../../features/services/auth-service/auth.service';
import { Links } from '../../core/constants/links';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { resetPasswordSchema } from '../../features/schemas/reset-password-form.schema';
import { SnackbarService } from '../../shared/services/snackbar-service/snackbar.service';

import type { OnInit, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import type { IResetTokenValidResponse } from '../../core/models/auth.model';
import type { IResetPasswordForm } from '../../features/models/reset-password-form.model';

@Component({
  selector: 'app-reset-password-page',
  imports: [HeaderComponent, InputFieldComponent, ButtonComponent, FormRoot, FormField],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly router: Router = inject(Router);

  private readonly authService: AuthService = inject(AuthService);

  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  public readonly showPassword: WritableSignal<boolean> = signal<boolean>(false);

  public readonly showConfirmPassword: WritableSignal<boolean> = signal<boolean>(false);

  public currentResetToken: WritableSignal<string | null> = signal<string | null>(null);

  public isTokenValid: WritableSignal<boolean> = signal<boolean>(false);

  private readonly resetPasswordModel: WritableSignal<IResetPasswordForm> =
    signal<IResetPasswordForm>({
      password: Constants.EMPTY_STRING,
      confirmPassword: Constants.EMPTY_STRING,
    });

  public readonly resetPasswordForm: FieldTree<IResetPasswordForm> = form<IResetPasswordForm>(
    this.resetPasswordModel,
    resetPasswordSchema,
    {
      submission: { action: () => this.onResetPassword() },
    },
  );

  public ngOnInit(): void {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.currentResetToken.set(params.get(Constants.TOKEN));
        void this.validateResetToken();
      });
  }

  public togglePasswordVisibility(index: number): void {
    if (index === Constants.ZERO) {
      this.showPassword.update((visibility) => !visibility);
    } else {
      this.showConfirmPassword.update((visibility) => !visibility);
    }
  }

  private async onResetPassword(): Promise<void> {
    await firstValueFrom(
      this.authService.resetPassword({
        token: this.currentResetToken(),
        newPassword: this.resetPasswordForm.password().value(),
      }),
    );
    this.snackbarService.success(Constants.PASSWORD_RESET_SUCCESSFULLY);
    await this.router.navigate([Links.LOGIN_URL]);
  }

  private async validateResetToken(): Promise<void> {
    const token: string | null = this.currentResetToken();
    if (!token) {
      void this.router.navigate([Links.NOT_FOUND_URL]);
      return;
    }

    try {
      const validationResult: IResetTokenValidResponse = await firstValueFrom(
        this.authService.resetTokenValidation({
          token,
        }),
      );
      this.isTokenValid.set(validationResult.valid);
    } catch {
      this.isTokenValid.set(false);
    }

    if (!this.isTokenValid()) {
      void this.router.navigate([Links.NOT_FOUND_URL]);
    }
  }
}
