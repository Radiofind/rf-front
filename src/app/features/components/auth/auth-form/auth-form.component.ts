import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { EMPTY_STRING } from '../../../../core/constants/constants';

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private readonly emptyString = EMPTY_STRING;

  public readonly loginForm = this.fb.group({
    email: [this.emptyString, [Validators.required, Validators.email]],
    password: [this.emptyString, Validators.required],
  })

  public get emailLoginForm(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  public get passwordLoginForm(): FormControl<string> {
    return this.loginForm.controls.password;
  }
}
