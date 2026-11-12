import { Links } from '../../core/constants/links';
import { AccentColorEnum } from '../../core/enums/accent-color.enum';
import { AudioQualityEnum } from '../../core/enums/audio-quality.enum';
import { LanguageEnum } from '../../core/enums/language.enum';
import { ProfileVisibilityEnum } from '../../core/enums/profile-visibility.enum';
import { TwoFactorMethodEnum } from '../../core/enums/two-factor-method.enum';

import type { IGeneralSettings, INotificationSettings } from '../../core/models/settings.model';
import type { AccentColor } from '../../core/types/accent-color.type';
import type { AudioQuality } from '../../core/types/audio-quality.type';
import type { Language } from '../../core/types/language.type';
import type { ProfileVisibility } from '../../core/types/profile-visibility.type';
import type { TranslationKey } from '../../core/types/translation.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { IAccentColorOption } from '../models/accent-color-option.model';
import type { ISettingsNavItem } from '../models/settings-nav-item.model';
import type { ITwoFactorMethodOption } from '../models/account-settings-dialog.model';
import type { TwoFactorMethod } from '../../core/types/two-factor-method.type';

export const DEFAULT_GENERAL_SETTINGS: Readonly<IGeneralSettings> = {
  language: LanguageEnum.EN,
  radioMode: true,
  profileVisibility: ProfileVisibilityEnum.EVERYONE,
  audioQuality: AudioQualityEnum.HIGH,
  accentColor: AccentColorEnum.VIOLET,
};

export const DEFAULT_NOTIFICATION_SETTINGS: Readonly<INotificationSettings> = {
  trackUpdates: true,
  radioUpdates: true,
  likes: true,
};

export const LANGUAGE_OPTIONS: readonly ISelectOption<Language>[] = [
  { value: LanguageEnum.EN, label: 'English', imageSrc: '/assets/flags/us.svg' },
  { value: LanguageEnum.DE, label: 'Deutsch', imageSrc: '/assets/flags/de.svg' },
  { value: LanguageEnum.FR, label: 'Français', imageSrc: '/assets/flags/fr.svg' },
  { value: LanguageEnum.IT, label: 'Italiano', imageSrc: '/assets/flags/it.svg' },
  { value: LanguageEnum.ES, label: 'Español', imageSrc: '/assets/flags/es.svg' },
  { value: LanguageEnum.RU, label: 'Русский', imageSrc: '/assets/flags/ru.svg' },
];

export const PROFILE_VISIBILITY_OPTIONS: readonly ISelectOption<
  ProfileVisibility,
  TranslationKey
>[] = [
  { value: ProfileVisibilityEnum.EVERYONE, label: 'settings.visibilityEveryone' },
  { value: ProfileVisibilityEnum.FOLLOWERS, label: 'settings.visibilityFollowers' },
  { value: ProfileVisibilityEnum.ONLY_ME, label: 'settings.visibilityOnlyMe' },
];

export const AUDIO_QUALITY_OPTIONS: readonly ISelectOption<AudioQuality, TranslationKey>[] = [
  { value: AudioQualityEnum.LOW, label: 'settings.audioLow' },
  { value: AudioQualityEnum.NORMAL, label: 'settings.audioNormal' },
  { value: AudioQualityEnum.HIGH, label: 'settings.audioHigh' },
];

export const ACCENT_COLORS: Readonly<Record<AccentColor, IAccentColorOption>> = {
  [AccentColorEnum.VIOLET]: {
    value: AccentColorEnum.VIOLET,
    label: 'settings.colorViolet',
    firstColor: '#6a5cff',
    secondColor: '#a855f7',
    mainColor: '#712be2',
  },
  [AccentColorEnum.OCEAN]: {
    value: AccentColorEnum.OCEAN,
    label: 'settings.colorOcean',
    firstColor: '#0ea5e9',
    secondColor: '#22d3ee',
    mainColor: '#0284c7',
  },
  [AccentColorEnum.ORCHID]: {
    value: AccentColorEnum.ORCHID,
    label: 'settings.colorOrchid',
    firstColor: '#c084fc',
    secondColor: '#e879f9',
    mainColor: '#a855f7',
  },
  [AccentColorEnum.PLUM]: {
    value: AccentColorEnum.PLUM,
    label: 'settings.colorPlum',
    firstColor: '#7e22ce',
    secondColor: '#a21caf',
    mainColor: '#6b21a8',
  },
};

export const ARTWORK_ACCENT_COLOR: AccentColor = AccentColorEnum.VIOLET;

export const ACCENT_COLOR_OPTIONS: readonly IAccentColorOption[] = [
  ACCENT_COLORS[AccentColorEnum.VIOLET],
  ACCENT_COLORS[AccentColorEnum.OCEAN],
  ACCENT_COLORS[AccentColorEnum.ORCHID],
  ACCENT_COLORS[AccentColorEnum.PLUM],
];

export const SETTINGS_NAV_ITEMS: readonly ISettingsNavItem[] = [
  { label: 'settings.general', iconClass: 'bx bx-cog', link: Links.GENERAL_SETTINGS_PATH },
  { label: 'settings.account', iconClass: 'bx bx-user', link: Links.ACCOUNT_SETTINGS_PATH },
];

export const TWO_FACTOR_METHOD_OPTIONS: readonly ITwoFactorMethodOption[] = [
  {
    value: TwoFactorMethodEnum.EMAIL,
    label: 'accountSettings.methods.email',
    description: 'accountSettings.methods.emailDescription',
    iconClass: 'bx bx-envelope-alt',
  },
  {
    value: TwoFactorMethodEnum.RECOVERY_EMAIL,
    label: 'accountSettings.methods.recoveryEmail',
    description: 'accountSettings.methods.recoveryEmailDescription',
    iconClass: 'bx bx-inbox',
  },
  {
    value: TwoFactorMethodEnum.AUTHENTICATOR,
    label: 'accountSettings.methods.authenticator',
    description: 'accountSettings.methods.authenticatorDescription',
    iconClass: 'bx bx-lock-keyhole',
  },
];

export const TWO_FACTOR_METHOD_LABELS: Readonly<Record<TwoFactorMethod, TranslationKey>> = {
  [TwoFactorMethodEnum.EMAIL]: 'accountSettings.methods.email',
  [TwoFactorMethodEnum.RECOVERY_EMAIL]: 'accountSettings.methods.recoveryEmail',
  [TwoFactorMethodEnum.AUTHENTICATOR]: 'accountSettings.methods.authenticator',
};
