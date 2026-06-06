import { 
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Constants } from '../../../../core/constants/constants';
import { birthDateValidator } from '../../../../core/validators/birth-date.validator';
import { passwordValidator } from '../../../../core/validators/password.validator';
import { passwordMatchValidator } from '../../../../core/validators/password-match.validator';
import { ArtistType } from '../../../../core/types/artist-type.type';
import { Links } from '../../../../core/constants/links';
import { AuthType } from '../../../../core/types/auth.type';
import { ButtonComponent } from "../../../../shared/components/button/button.component";

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule, ButtonComponent, DatePipe, LowerCasePipe],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private readonly router: Router = inject(Router);

  public readonly authType: InputSignal<AuthType> = input<AuthType>('login');

  public showPassword: WritableSignal<boolean> = signal<boolean>(false);

  public showConfirmPassword: WritableSignal<boolean> = signal<boolean>(false);

  public readonly currentDate: Date = new Date();

  public readonly minDate: Signal<Date> = computed(() => {
    const minusHundredYears: number = new Date().getFullYear() - 100;
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
    dateOfBirth: [new Date, [Validators.required, birthDateValidator()]],
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

  public get dateOfBirthRegisterForm(): FormControl<Date> {
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
  }

  public onSwitchAuthType(): void {
    this.router.navigate(this.authType() === 'login' ? [Links.REGISTER_URL] : [Links.LOGIN_URL]);
  }
}
