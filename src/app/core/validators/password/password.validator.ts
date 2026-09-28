import { Constants } from '../../constants/constants';
import { AuthValidationMessages } from '../../../features/constants/auth-error-messages.constant';

import type { ValidationError } from '@angular/forms/signals';

export const passwordRuleErrors = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!Constants.UPPERCASE_VALIDATOR_PATTERN.test(password)) {
    errors.push({ kind: Constants.UPPERCASE, message: AuthValidationMessages.UPPERCASE });
  }

  if (!Constants.LOWERCASE_VALIDATOR_PATTERN.test(password)) {
    errors.push({ kind: Constants.LOWERCASE, message: AuthValidationMessages.LOWERCASE });
  }

  if (!Constants.DECIMAL_VALIDATOR_PATTERN.test(password)) {
    errors.push({ kind: Constants.NUMBER_PROPERTY, message: AuthValidationMessages.NUMBER });
  }

  if (!Constants.SPECIAL_CHARACTER_VALIDATOR_PATTERN.test(password)) {
    errors.push({
      kind: Constants.SPECIAL_CHARACTER,
      message: AuthValidationMessages.SPECIAL_CHARACTER,
    });
  }

  if (Constants.SPACES_VALIDATOR_PATTERN.test(password)) {
    errors.push({ kind: Constants.SPACES_PROPERTY, message: AuthValidationMessages.SPACES });
  }

  return errors;
};
