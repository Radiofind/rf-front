import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatPercent } from '../../helpers/number/number.helpers';

import type { PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentValue',
  pure: false,
})
export class PercentValuePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(ratio: number, signed: boolean = false): string {
    return formatPercent(ratio, this.translationService.locale(), signed);
  }
}
