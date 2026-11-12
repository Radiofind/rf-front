import type { TwoFactorMethod } from '../../core/types/two-factor-method.type';

export interface ITwoFactorModalData {
  email: string;
  challengeId: string | null;
  method: TwoFactorMethod;
}
