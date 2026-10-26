import { Constants } from '../../../core/constants/constants';

import type { TranslationParams } from '../../../core/types/translation.type';
import type { TranslationDictionary } from '../../models/translation.model';

interface ITranslationTree {
  readonly [key: string]: string | ITranslationTree;
}

export function flattenTranslations(
  tree: ITranslationTree,
  prefix: string = Constants.EMPTY_STRING,
): TranslationDictionary {
  return Object.entries(tree).reduce(
    (dictionary: Record<string, string>, [key, value]: [string, string | ITranslationTree]) => {
      const path: string = prefix + key;

      return typeof value === 'string'
        ? { ...dictionary, [path]: value }
        : { ...dictionary, ...flattenTranslations(value, path + Constants.DOT) };
    },
    {},
  );
}

export function interpolateTranslation(template: string, params: TranslationParams): string {
  return template.replace(
    Constants.TRANSLATION_PARAM_PATTERN,
    (placeholder: string, name: string) => {
      const value: string | number | undefined = params[name];
      return value === undefined ? placeholder : String(value);
    },
  );
}
