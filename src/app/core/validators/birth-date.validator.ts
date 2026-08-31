import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Constants } from "../constants/constants";
import { transformStringToDate } from "../../shared/helpers/date.helpers";

export const birthDateValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    };

    const date: Date = transformStringToDate(control.value);

    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    };

    if (date > new Date()) {
      return { futureDate: true };
    };

    const minDate: Date = new Date();
    minDate.setFullYear(minDate.getFullYear() - Constants.MIN_BIRTH_DATE);

    if (date < minDate) {
      return {
        maxAgeHundredYears: {
          minAllowedDate: minDate,
          actualDate: date,
        },
      };
    };

    return null;
  };
}
