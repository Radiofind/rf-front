import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { catchError, of } from 'rxjs';
import { Constants } from '../../../../core/constants/constants';
import { birthDateValidator } from '../../../../core/validators/birth-date.validator';
import { passwordValidator } from '../../../../core/validators/password.validator';
import { passwordMatchValidator } from '../../../../core/validators/password-match.validator';
import { ArtistType } from '../../../../core/types/artist-type.type';
import { Links } from '../../../../core/constants/links';
import { AuthType } from '../../../../core/types/auth.type';
import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { ILoginData, IRegisterData } from '../../../models/auth-content.model';
import { transformStringToDate } from '../../../../shared/helpers/date.helpers';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule, ButtonComponent, DatePipe, LowerCasePipe],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AuthFormComponent {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private readonly authService: AuthService = inject(AuthService);

  private readonly router: Router = inject(Router);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly authType: InputSignal<AuthType> = input<AuthType>('login');

  public showPassword: WritableSignal<boolean> = signal<boolean>(false);

  public showConfirmPassword: WritableSignal<boolean> = signal<boolean>(false);

  public loginError: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  public readonly currentDate: Date = new Date();

  public readonly minDate: Signal<Date> = computed(() => {
    const minusHundredYears: number = new Date().getFullYear() - Constants.MIN_BIRTH_DATE;
    return new Date(minusHundredYears, this.currentDate.getMonth(), this.currentDate.getDate());
  })

  public readonly loginForm = this.fb.group({
    email: [Constants.EMPTY_STRING, [Validators.required, Validators.email]],
    password: [Constants.EMPTY_STRING, Validators.required],
  })

  public get emailLoginForm(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  public get passwordLoginForm(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  public readonly registerForm = this.fb.group({
    name: [Constants.EMPTY_STRING, [
      Validators.required,
      Validators.minLength(Constants.MIN_LINGTH_FORM_VALIDATION_NAME),
      Validators.pattern(Constants.NAME_VALIDATOR_PATTERN)
    ]],
    surname: [Constants.EMPTY_STRING, [Validators.required, Validators.pattern(Constants.NAME_VALIDATOR_PATTERN)]],
    email: [Constants.EMPTY_STRING, [Validators.required, Validators.email]],
    recoveryEmail: [Constants.EMPTY_STRING, [Validators.email]],
    dateOfBirth: [Constants.EMPTY_STRING, [Validators.required, birthDateValidator()]],
    password: [Constants.EMPTY_STRING, [
      Validators.required,
      Validators.minLength(Constants.MIN_LINGTS_FORM_VALIDATION_PASSWORD),
      Validators.maxLength(Constants.MAX_LENGTH_FORM_VALIDATION_PASSWORD),
      passwordValidator()
    ]],
    confirmPassword: [Constants.EMPTY_STRING, [Validators.required]],
    addInformation: [false],
    typeOfArtist: this.fb.control<ArtistType>('Artist'),
    artistOrBandName: [Constants.EMPTY_STRING, [Validators.maxLength(Constants.MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME)]],
    description: [Constants.EMPTY_STRING]
  },
  {
    validators: passwordMatchValidator(),
  })

  public get nameRegisterForm(): FormControl<string> {
    return this.registerForm.controls.name;
  }

  public get surnameRegisterForm(): FormControl<string> {
    return this.registerForm.controls.surname;
  }

  public get emailRegisterForm(): FormControl<string> {
    return this.registerForm.controls.email;
  }

  public get recoveryEmailRegisterForm(): FormControl<string> {
    return this.registerForm.controls.recoveryEmail;
  }

  public get dateOfBirthRegisterForm(): FormControl<string> {
    return this.registerForm.controls.dateOfBirth;
  }

  public get passwordRegisterForm(): FormControl<string> {
    return this.registerForm.controls.password;
  }

  public get confirmPasswordRegisterForm(): FormControl<string> {
    return this.registerForm.controls.confirmPassword;
  }

  public get addInformationRegisterForm(): FormControl<boolean> {
    return this.registerForm.controls.addInformation;
  }

  public get typeOfArtistRegisterForm(): FormControl<ArtistType> {
    return this.registerForm.controls.typeOfArtist;
  }

  public get artistOrBandNameRegisterForm(): FormControl<string> {
    return this.registerForm.controls.artistOrBandName;
  }

  public get descriptionRegisterForm(): FormControl<string> {
    return this.registerForm.controls.description;
  }

  public togglePasswordVisibility(index: number): void {
    if (index === Constants.ZERO) {
      this.showPassword.update(visibility => !visibility);
    } else {
      this.showConfirmPassword.update(visibility => !visibility);
    } 
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    const data: ILoginData | IRegisterData = this.prepareFormData();
    
    if (this.authType() === 'login') {
      this.authService.login(data as ILoginData).pipe(
        takeUntilDestroyed(this.destroyRef), 
        catchError(() => {
          this.loginError.set(Constants.INVALID_LOGIN_PASSWORD);
          return of(null);
      })
    ).subscribe(() => {
        this.loginError.set(Constants.EMPTY_STRING);
        this.router.navigate([Links.UPLOADS_URL]);
      });
    } else {
      this.authService.register(data as IRegisterData).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(() => {
        this.router.navigate([Links.UPLOADS_URL]);
      });
    };
  }

  public onSwitchAuthType(): void {
    this.router.navigate(this.authType() === 'login' ? [Links.REGISTER_URL] : [Links.LOGIN_URL]);
  }

  private prepareFormData(): ILoginData | IRegisterData {
    if (this.authType() === 'login') {
      return {
        email: this.emailLoginForm.value,
        password: this.passwordLoginForm.value,
      };
    };

    const dateOfBirth: Date = transformStringToDate(this.dateOfBirthRegisterForm.value);

    return {
      name: this.nameRegisterForm.value,
      surname: this.surnameRegisterForm.value,
      email: this.emailRegisterForm.value,
      recoveryEmail: this.recoveryEmailRegisterForm.value ?? null,
      dateOfBirth: dateOfBirth,
      password: this.passwordRegisterForm.value,
      artistInformation: {
        typeOfArtist: this.typeOfArtistRegisterForm.value.toUpperCase() ?? null,
        artistName: this.artistOrBandNameRegisterForm.value ?? null,
        description: this.descriptionRegisterForm.value ?? null,
      }
    }
  }
}
