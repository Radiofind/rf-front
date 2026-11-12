import type { ISecurityOverview } from '../../core/models/settings.model';
import type { TwoFactorMethod } from '../../core/types/two-factor-method.type';
import type { Observable } from 'rxjs';
import type { TranslationKey } from '../../core/types/translation.type';

export interface IPasswordConfirmModalData<R> {
  message: TranslationKey;
  description?: TranslationKey;
  confirmText: TranslationKey;
  isDanger?: boolean;
  submit: (password: string) => Observable<R>;
}

export interface IBackupCodesModalData {
  codes: readonly string[];
}

export interface ITwoFactorMethodModalData {
  security: ISecurityOverview;
}

export interface ITwoFactorMethodOption {
  value: TwoFactorMethod;
  label: TranslationKey;
  description: TranslationKey;
  iconClass: string;
}
