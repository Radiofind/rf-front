import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const birthDateValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    };

    const date: Date = new Date(control.value);

    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    };

    if (date > new Date()) {
      return { futureDate: true };
    };

    return null;
  };
}
