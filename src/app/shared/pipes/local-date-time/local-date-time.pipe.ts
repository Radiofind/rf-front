import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { formatLocalDateTime } from '../../helpers/date/date.helpers';

import type { PipeTransform } from '@angular/core';
import type { DateFormatEnum } from '../../../core/enums/date-format.enum';

@Pipe({
  name: 'localDateTime',
  pure: false,
})
export class LocalDateTimePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(localDateTime: string, format: DateFormatEnum): string {
    return formatLocalDateTime(localDateTime, format, this.translationService.locale());
  }
}
