import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Constants } from "../constants/constants";

export const passwordValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const password: string = control.value as string;

    const errors: ValidationErrors = {};

    if (!Constants.UPPERCASE_VALIDATOR_PATTERN.test(password)) {
      errors[Constants.UPPERCASE] = true;
    };

    if (!Constants.LOWERCASE_VALIDATOR_PATTERN.test(password)) {
      errors[Constants.LOWERCASE] = true;
    };

    if (!Constants.DECIMAL_VALIDATOR_PATTERN.test(password)) {
      errors[Constants.NUMBER_PROPERTY] = true;
    }

    if (!Constants.SPECIAL_CHARACTER_VALIDATOR_PATTERN.test(password)) {
      errors[Constants.SPECIAL_CHARACTER] = true;
    }

    if (Constants.SPACES_VALIDATOR_PATTERN.test(password)) {
      errors[Constants.SPACES_PROPERTY] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}