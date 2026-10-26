import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../../core/constants/constants';
import { Links } from '../../../../core/constants/links';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CheckboxFieldComponent } from '../../../../shared/components/checkbox-field/checkbox-field.component';
import { DateFieldComponent } from '../../../../shared/components/date-field/date-field.component';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { RadioFieldComponent } from '../../../../shared/components/radio-field/radio-field.component';
import { AuthValidationMessages } from '../../../constants/auth-error-messages.constant';
import { loginFormSchema, registerFormSchema } from '../../../schemas/auth-form/auth-form.schema';
import { AuthService } from '../../../services/auth-service/auth.service';
import { ModalService } from '../../../../shared/services/modal-service/modal.service';
import { TwoFactorModalComponent } from '../../../dialogs/two-factor-modal/two-factor-modal.component';
import {
  DEFAULT_ARTIST_TYPE,
  FORGET_PASSWORD_MODAL_OPTIONS,
  TWO_FACTOR_MODAL_OPTIONS,
} from '../../../constants/auth-content.constant';
import { AUTH_TYPE } from '../../../enums/auth-type.enum';
import { ForgetPasswordModalComponent } from '../../../dialogs/forget-password-modal/forget-password-modal.component';
import { transformDateToString } from '../../../../shared/helpers/date/date.helpers';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { TranslateErrorPipe } from '../../../../shared/pipes/translate-error/translate-error.pipe';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';
import { ARTIST_TYPE_OPTIONS, ARTIST_TYPE_TEXTS } from '../../../constants/artist-type.constant';

import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import type { DialogRef } from '@angular/cdk/dialog';
import type { FieldTree, ValidationError } from '@angular/forms/signals';
import type { ArtistType } from '../../../../core/types/artist-type.type';
import type { AuthType } from '../../../../core/types/auth.type';
import type { IRegisterData } from '../../../models/auth-content.model';
import type { ILoginForm, IRegisterForm } from '../../../models/auth-form.model';
import type { ITwoFactorModalData } from '../../../models/two-factor.model';
import type { IAuthResponse } from '../../../../core/models/auth.model';
import type { ISelectOption } from '../../../../shared/models/select-option.model';
import type { IArtistTypeTexts } from '../../../models/artist-type-texts.model';

@Component({
  selector: 'app-auth-form',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    TranslatePipe,
    TranslateErrorPipe,
    InputFieldComponent,
    DateFieldComponent,
    CheckboxFieldComponent,
    RadioFieldComponent,
  ],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  private readonly authService: AuthService = inject(AuthService);

  private readonly router: Router = inject(Router);

  private readonly modalService: ModalService = inject(ModalService);

  private readonly translationService: TranslationService = inject(TranslationService);

  public readonly authType: InputSignal<AuthType> = input<AuthType>(AUTH_TYPE.LOGIN);

  public readonly showPassword: WritableSignal<boolean> = signal<boolean>(false);

  public readonly showConfirmPassword: WritableSignal<boolean> = signal<boolean>(false);

  private readonly challengeId: WritableSignal<string | null> = signal<string | null>(null);

  public readonly artistTypeTexts: Readonly<Record<ArtistType, IArtistTypeTexts>> =
    ARTIST_TYPE_TEXTS;

  public readonly artistTypeOptions: Signal<readonly ISelectOption<ArtistType>[]> = computed(() =>
    this.translationService.translateOptions(ARTIST_TYPE_OPTIONS),
  );

  private readonly loginModel: WritableSignal<ILoginForm> = signal<ILoginForm>({
    email: Constants.EMPTY_STRING,
    password: Constants.EMPTY_STRING,
  });

  public readonly loginForm: FieldTree<ILoginForm> = form<ILoginForm>(
    this.loginModel,
    loginFormSchema,
    {
      submission: { action: () => this.login() },
    },
  );

  private readonly registerModel: WritableSignal<IRegisterForm> = signal<IRegisterForm>({
    name: Constants.EMPTY_STRING,
    surname: Constants.EMPTY_STRING,
    email: Constants.EMPTY_STRING,
    recoveryEmail: Constants.EMPTY_STRING,
    dateOfBirth: null,
    password: Constants.EMPTY_STRING,
    confirmPassword: Constants.EMPTY_STRING,
    addInformation: false,
    typeOfArtist: DEFAULT_ARTIST_TYPE,
    artistOrBandName: Constants.EMPTY_STRING,
    description: Constants.EMPTY_STRING,
  });

  public readonly registerForm: FieldTree<IRegisterForm> = form<IRegisterForm>(
    this.registerModel,
    registerFormSchema,
    {
      submission: { action: () => this.register() },
    },
  );

  public readonly loginError: Signal<ValidationError | undefined> = computed(() =>
    this.serverErrorOf(this.loginForm),
  );

  public readonly registerError: Signal<ValidationError | undefined> = computed(() =>
    this.serverErrorOf(this.registerForm),
  );

  public onForgetPassword(): DialogRef<string> {
    return this.modalService.open<string>(ForgetPasswordModalComponent, {
      ...FORGET_PASSWORD_MODAL_OPTIONS,
    });
  }

  public togglePasswordVisibility(index: number): void {
    if (index === Constants.ZERO) {
      this.showPassword.update((visibility) => !visibility);
    } else {
      this.showConfirmPassword.update((visibility) => !visibility);
    }
  }

  public onSwitchAuthType(): void {
    void this.router.navigate(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      this.authType() === AUTH_TYPE.LOGIN ? [Links.REGISTER_URL] : [Links.LOGIN_URL],
    );
  }

  private openTwoFactorModal(): DialogRef<string, TwoFactorModalComponent> {
    return this.modalService.open<string, ITwoFactorModalData, TwoFactorModalComponent>(
      TwoFactorModalComponent,
      {
        ...TWO_FACTOR_MODAL_OPTIONS,
        data: { email: this.loginModel().email, challengeId: this.challengeId() },
      },
    );
  }

  private serverErrorOf(
    fieldTree: FieldTree<ILoginForm | IRegisterForm>,
  ): ValidationError | undefined {
    return fieldTree()
      .errors()
      .find((error) => error.kind === Constants.SERVER_ERROR);
  }

  private async login(): Promise<ValidationError | undefined> {
    try {
      const loginData: IAuthResponse = await firstValueFrom(
        this.authService.login(this.loginModel()),
      );
      this.challengeId.set(loginData.challengeId);
      await firstValueFrom(this.openTwoFactorModal().closed);
      await this.router.navigate([Links.DEFAULT_PATH]);
      return undefined;
    } catch {
      return {
        kind: Constants.SERVER_ERROR,
        message: AuthValidationMessages.INVALID_LOGIN_PASSWORD,
      };
    }
  }

  private async register(): Promise<ValidationError.WithOptionalFieldTree | undefined> {
    const model: IRegisterForm = this.registerModel();
    const dateOfBirth: Date | null = model.dateOfBirth;

    if (!dateOfBirth) {
      return { kind: Constants.REQUIRED_PROPERTY, message: AuthValidationMessages.REQUIRED };
    }

    try {
      await firstValueFrom(this.authService.register(this.toRegisterData(model, dateOfBirth)));
      await this.router.navigate([Links.DEFAULT_PATH]);
      return undefined;
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === Constants.HTTP_CONFLICT_STATUS) {
        return {
          kind: Constants.SERVER_ERROR,
          message: AuthValidationMessages.EMAIL_TAKEN,
          fieldTree: this.registerForm.email,
        };
      }

      return { kind: Constants.SERVER_ERROR, message: AuthValidationMessages.REGISTRATION_FAILED };
    }
  }

  private toRegisterData(model: IRegisterForm, dateOfBirth: Date): IRegisterData {
    return {
      name: model.name,
      surname: model.surname,
      email: model.email,
      recoveryEmail: model.recoveryEmail || null,
      dateOfBirth: transformDateToString(dateOfBirth),
      password: model.password,
      artistInformation: {
        typeOfArtist: model.typeOfArtist.toUpperCase(),
        artistName: model.artistOrBandName || null,
        description: model.description || null,
      },
    };
  }
}
