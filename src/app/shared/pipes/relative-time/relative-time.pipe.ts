import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';
import { toRelativeTime } from '../../helpers/date/date.helpers';

import type { PipeTransform } from '@angular/core';
import type { IRelativeTime } from '../../models/relative-time.model';

@Pipe({
  name: 'relativeTime',
  pure: false,
})
export class RelativeTimePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(isoDate: string): string {
    const { value, unit }: IRelativeTime = toRelativeTime(isoDate, new Date());
    return this.translationService.formatRelativeTime(value, unit);
  }
}
