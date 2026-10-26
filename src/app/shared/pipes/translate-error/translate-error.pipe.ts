import { inject, Pipe } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { TranslationService } from '../../services/translation-service/translation.service';

import type { PipeTransform } from '@angular/core';
import type { ValidationError } from '@angular/forms/signals';
import type { ITranslatableValidationError } from '../../models/translation.model';

@Pipe({
  name: 'translateError',
  pure: false,
})
export class TranslateErrorPipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(error: ValidationError | undefined): string {
    const { message, params }: ITranslatableValidationError = (error ??
      {}) as ITranslatableValidationError;

    return message ? this.translationService.translate(message, params) : Constants.EMPTY_STRING;
  }
}
