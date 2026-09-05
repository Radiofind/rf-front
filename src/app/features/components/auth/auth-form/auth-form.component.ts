import {
  Component,
  computed,
  inject, input,
  type InputSignal,
  signal,
  type Signal,
  type WritableSignal
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { type FieldTree, form, FormField, FormRoot, type ValidationError } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Constants } from '../../../../core/constants/constants';
import type { ArtistType } from '../../../../core/types/artist-type.type';
import { Links } from '../../../../core/constants/links';
import type { AuthType } from '../../../../core/types/auth.type';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CheckboxFieldComponent } from '../../../../shared/components/checkbox-field/checkbox-field.component';
import { DateFieldComponent } from '../../../../shared/components/date-field/date-field.component';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { RadioFieldComponent } from '../../../../shared/components/radio-field/radio-field.component';
import type { IRegisterData } from '../../../models/auth-content.model';
import type { ILoginForm, IRegisterForm } from '../../../models/auth-form.model';
import { AuthValidationMessages } from '../../../constants/auth-error-messages.constant';
import { loginFormSchema, registerFormSchema } from '../../../schemas/auth-form.schema';
import { AuthService } from '../../../services/auth-service/auth.service';
import { ARTIST_TYPES, DEFAULT_ARTIST_TYPE } from '../../../constants/auth-content.constant';
import { AUTH_TYPE } from '../../../enums/auth-type.enum';

@Component({
  selector: 'app-auth-form',
  imports: [
    FormRoot,
    FormField,
    ButtonComponent,
    LowerCasePipe,
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

  public readonly authType: InputSignal<AuthType> = input<AuthType>(AUTH_TYPE.LOGIN);

  public readonly showPassword: WritableSignal<boolean> = signal<boolean>(false);

  public readonly showConfirmPassword: WritableSignal<boolean> = signal<boolean>(false);

  public readonly artistTypes: readonly ArtistType[] = ARTIST_TYPES;

  private readonly loginModel: WritableSignal<ILoginForm> = signal<ILoginForm>({
    email: Constants.EMPTY_STRING,
    password: Constants.EMPTY_STRING,
  });

  public readonly loginForm: FieldTree<ILoginForm> = form<ILoginForm>(this.loginModel, loginFormSchema, {
    submission: { action: () => this.login() },
  });

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

  public readonly registerForm: FieldTree<IRegisterForm> = form<IRegisterForm>(this.registerModel, registerFormSchema, {
    submission: { action: () => this.register() },
  });

  public readonly loginError: Signal<string | undefined> = computed(() => this.serverErrorOf(this.loginForm));

  public readonly registerError: Signal<string | undefined> = computed(() => this.serverErrorOf(this.registerForm));

  public togglePasswordVisibility(index: number): void {
    if (index === Constants.ZERO) {
      this.showPassword.update(visibility => !visibility);
    } else {
      this.showConfirmPassword.update(visibility => !visibility);
    };
  }

  public onSwitchAuthType(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    void this.router.navigate(this.authType() === AUTH_TYPE.LOGIN ? [Links.REGISTER_URL] : [Links.LOGIN_URL]);
  }

  private serverErrorOf(fieldTree: FieldTree<ILoginForm | IRegisterForm>): string | undefined {
    return fieldTree().errors().find(error => error.kind === Constants.SERVER_ERROR)?.message;
  }

  private async login(): Promise<ValidationError | undefined> {
    try {
      await firstValueFrom(this.authService.login(this.loginModel()));
      await this.router.navigate([Links.UPLOADS_URL]);
      return undefined;
    } catch {
      return { kind: Constants.SERVER_ERROR, message: Constants.INVALID_LOGIN_PASSWORD };
    }
  }

  private async register(): Promise<ValidationError | undefined> {
    const model: IRegisterForm = this.registerModel();
    const dateOfBirth: Date | null = model.dateOfBirth;

    if (!dateOfBirth) {
      return { kind: Constants.REQUIRED_PROPERTY, message: AuthValidationMessages.REQUIRED };
    };

    try {
      await firstValueFrom(this.authService.register(this.toRegisterData(model, dateOfBirth)));
      await this.router.navigate([Links.UPLOADS_URL]);
      return undefined;
    } catch {
      return { kind: Constants.SERVER_ERROR, message: Constants.REGISTRATION_FAILED };
    }
  }

  private toRegisterData(model: IRegisterForm, dateOfBirth: Date): IRegisterData {
    return {
      name: model.name,
      surname: model.surname,
      email: model.email,
      recoveryEmail: model.recoveryEmail || null,
      dateOfBirth: dateOfBirth,
      password: model.password,
      artistInformation: {
        typeOfArtist: model.typeOfArtist.toUpperCase(),
        artistName: model.artistOrBandName || null,
        description: model.description || null,
      },
    };
  }
}
