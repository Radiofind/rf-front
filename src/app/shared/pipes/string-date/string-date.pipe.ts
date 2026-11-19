import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatStringDate } from '../../helpers/date/date.helpers';

import type { PipeTransform } from '@angular/core';
import type { DateFormatEnum } from '../../../core/enums/date-format.enum';

@Pipe({
  name: 'stringDate',
  pure: false,
})
export class StringDatePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(isoDate: string, format: DateFormatEnum): string {
    return formatStringDate(isoDate, format, this.translationService.locale());
  }
}
