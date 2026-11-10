import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatDateTime } from '../../helpers/date/date.helpers';

import type { PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTime',
  pure: false,
})
export class DateTimePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(isoDate: string): string {
    return formatDateTime(isoDate, this.translationService.locale());
  }
}
