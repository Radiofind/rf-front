import { Constants } from '../../constants/constants';

import type { ValidationError } from '@angular/forms/signals';
import type { IFileRules } from '../../models/file-rules.model';
import type { ITranslatableValidationError } from '../../../shared/models/translation.model';

const hasAllowedExtension = (fileName: string, extensions: readonly string[]): boolean => {
  const lowerCaseName: string = fileName.toLowerCase();
  return extensions.some((extension: string) => lowerCaseName.endsWith(extension));
};

export const fileError = (file: File | null, rules: IFileRules): ValidationError | undefined => {
  if (!file) {
    return undefined;
  }

  if (!hasAllowedExtension(file.name, rules.extensions)) {
    return { kind: Constants.FILE_TYPE_PROPERTY, message: rules.invalidTypeMessage };
  }

  if (file.size <= rules.maxSizeMb * Constants.BYTES_IN_MEGABYTE) {
    return undefined;
  }

  const error: ITranslatableValidationError = {
    kind: Constants.FILE_SIZE_PROPERTY,
    message: rules.tooLargeMessage,
    params: { size: rules.maxSizeMb },
  };

  return error;
};
