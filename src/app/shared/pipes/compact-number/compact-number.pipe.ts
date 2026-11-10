import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatCompactNumber } from '../../helpers/number/number.helpers';

import type { PipeTransform } from '@angular/core';

@Pipe({
  name: 'compactNumber',
  pure: false,
})
export class CompactNumberPipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(value: number): string {
    return formatCompactNumber(value, this.translationService.locale());
  }
}
