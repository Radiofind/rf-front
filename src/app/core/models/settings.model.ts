import type { TwoFactorMethod } from '../types/two-factor-method.type';
import type { AccentColor } from '../types/accent-color.type';
import type { AudioQuality } from '../types/audio-quality.type';
import type { Language } from '../types/language.type';
import type { ProfileVisibility } from '../types/profile-visibility.type';

export interface IGeneralSettings {
  language: Language;
  radioMode: boolean;
  profileVisibility: ProfileVisibility;
  audioQuality: AudioQuality;
  accentColor: AccentColor;
}

export interface INotificationSettings {
  trackUpdates: boolean;
  radioUpdates: boolean;
  likes: boolean;
}

export interface ISecurityOverview {
  twoFactorMethod: TwoFactorMethod;
  email: string;
  recoveryEmail: string | null;
  backupCodesRemaining: number;
}

export interface ITwoFactorEnrollment {
  method: TwoFactorMethod;
  destination: string | null;
  secret: string | null;
  otpauthUri: string | null;
}

export interface IStartTwoFactorEnrollmentData {
  method: TwoFactorMethod;
  password: string;
}

export interface IConfirmTwoFactorEnrollmentData {
  code: string;
}

export interface IBackupCodes {
  codes: string[];
}

export interface IPasswordConfirmationData {
  password: string;
}
