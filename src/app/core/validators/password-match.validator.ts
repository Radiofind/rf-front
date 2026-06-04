import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator = (): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const password: AbstractControl | null = group.get('password');
    const confirmPassword: AbstractControl | null = group.get('confirmPassword');

    return password?.value === confirmPassword?.value
      ? null
      : { passwordMismatch: true };
  };
}