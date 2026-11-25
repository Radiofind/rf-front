import { inject, Service } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { findSelectOption } from '../../../shared/helpers/select-option/select-option.helpers';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';
import { GENRE_OPTIONS } from '../../constants/genre.constant';

import type { TranslationKey } from '../../../core/types/translation.type';
import type { ISelectOption } from '../../../shared/models/select-option.model';

@Service()
export class GenreLabelService {
  private readonly translationService: TranslationService = inject(TranslationService);

  public join(genres: readonly string[] | undefined): string | null {
    if (!genres?.length) {
      return null;
    }

    return genres.map((genre: string) => this.label(genre)).join(Constants.SLASH_WITH_SPACES);
  }

  private label(genre: string): string {
    const option: ISelectOption<string, TranslationKey> | undefined = findSelectOption(
      GENRE_OPTIONS,
      genre,
    );

    if (option) {
      return this.translationService.translate(option.label);
    }

    return genre
      .split(Constants.UNDERSCORE)
      .map(
        (word: string) =>
          word.charAt(Constants.ZERO).toUpperCase() + word.slice(Constants.ONE).toLowerCase(),
      )
      .join(Constants.EMPTY_SPACE_STRING);
  }
}
