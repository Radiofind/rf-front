import { inject, Pipe } from '@angular/core';
import { TranslationService } from '../../services/translation-service/translation.service';

import type { PipeTransform } from '@angular/core';
import type { TranslationKey, TranslationParams } from '../../../core/types/translation.type';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService: TranslationService = inject(TranslationService);

  public transform(key: TranslationKey, params?: TranslationParams): string {
    return this.translationService.translate(key, params);
  }
}
