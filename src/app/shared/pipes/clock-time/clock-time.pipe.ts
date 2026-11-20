import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatClockTime } from '../../helpers/date/date.helpers';

import type { PipeTransform } from '@angular/core';

@Pipe({
  name: 'clockTime',
  pure: false,
})
export class ClockTimePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(date: Date): string {
    return formatClockTime(date, this.translationService.locale());
  }
}
