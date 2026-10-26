import type { SnackbarType } from '../../core/types/snackbar-type.type';
import type { TranslationKey, TranslationParams } from '../../core/types/translation.type';

export interface ISnackbarOptions {
  type?: SnackbarType;
  iconClass?: string | null;
  duration?: number;
  params?: TranslationParams;
}

export interface ISnackbarMessage {
  id: number;
  content: TranslationKey;
  params: TranslationParams | null;
  type: SnackbarType;
  iconClass: string | null;
}
