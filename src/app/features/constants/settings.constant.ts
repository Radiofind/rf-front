import { Links } from '../../core/constants/links';
import { AccentColorEnum } from '../../core/enums/accent-color.enum';
import { AudioQualityEnum } from '../../core/enums/audio-quality.enum';
import { LanguageEnum } from '../../core/enums/language.enum';
import { ProfileVisibilityEnum } from '../../core/enums/profile-visibility.enum';

import type { IGeneralSettings } from '../../core/models/settings.model';
import type { AccentColor } from '../../core/types/accent-color.type';
import type { AudioQuality } from '../../core/types/audio-quality.type';
import type { Language } from '../../core/types/language.type';
import type { ProfileVisibility } from '../../core/types/profile-visibility.type';
import type { ISelectOption } from '../../shared/models/select-option.model';
import type { IAccentColorOption } from '../models/accent-color-option.model';
import type { ISettingsNavItem } from '../models/settings-nav-item.model';

export const DEFAULT_GENERAL_SETTINGS: Readonly<IGeneralSettings> = {
  language: LanguageEnum.EN,
  radioMode: true,
  profileVisibility: ProfileVisibilityEnum.EVERYONE,
  notificationsEnabled: true,
  audioQuality: AudioQualityEnum.HIGH,
  accentColor: AccentColorEnum.VIOLET,
};

export const LANGUAGE_OPTIONS: readonly ISelectOption<Language>[] = [
  { value: LanguageEnum.EN, label: 'English' },
  { value: LanguageEnum.DE, label: 'Deutsch' },
  { value: LanguageEnum.FR, label: 'Français' },
  { value: LanguageEnum.IT, label: 'Italiano' },
  { value: LanguageEnum.ES, label: 'Español' },
];

export const PROFILE_VISIBILITY_OPTIONS: readonly ISelectOption<ProfileVisibility>[] = [
  { value: ProfileVisibilityEnum.EVERYONE, label: 'Show to everyone' },
  { value: ProfileVisibilityEnum.FOLLOWERS, label: 'Followers only' },
  { value: ProfileVisibilityEnum.ONLY_ME, label: 'Only me' },
];

export const AUDIO_QUALITY_OPTIONS: readonly ISelectOption<AudioQuality>[] = [
  { value: AudioQualityEnum.LOW, label: 'Low (96 kbps)' },
  { value: AudioQualityEnum.NORMAL, label: 'Normal (160 kbps)' },
  { value: AudioQualityEnum.HIGH, label: 'High (320 kbps)' },
];

export const ACCENT_COLORS: Readonly<Record<AccentColor, IAccentColorOption>> = {
  [AccentColorEnum.VIOLET]: {
    value: AccentColorEnum.VIOLET,
    label: 'Violet',
    firstColor: '#6a5cff',
    secondColor: '#a855f7',
    mainColor: '#712be2',
  },
  [AccentColorEnum.OCEAN]: {
    value: AccentColorEnum.OCEAN,
    label: 'Ocean',
    firstColor: '#0ea5e9',
    secondColor: '#22d3ee',
    mainColor: '#0284c7',
  },
  [AccentColorEnum.ORCHID]: {
    value: AccentColorEnum.ORCHID,
    label: 'Orchid',
    firstColor: '#c084fc',
    secondColor: '#e879f9',
    mainColor: '#a855f7',
  },
  [AccentColorEnum.PLUM]: {
    value: AccentColorEnum.PLUM,
    label: 'Plum',
    firstColor: '#7e22ce',
    secondColor: '#a21caf',
    mainColor: '#6b21a8',
  },
};

export const ACCENT_COLOR_OPTIONS: readonly IAccentColorOption[] = [
  ACCENT_COLORS[AccentColorEnum.VIOLET],
  ACCENT_COLORS[AccentColorEnum.OCEAN],
  ACCENT_COLORS[AccentColorEnum.ORCHID],
  ACCENT_COLORS[AccentColorEnum.PLUM],
];

export const SETTINGS_NAV_ITEMS: readonly ISettingsNavItem[] = [
  { label: 'General', iconClass: 'bx bx-cog', link: Links.GENERAL_SETTINGS_PATH },
  { label: 'Account', iconClass: 'bx bx-user', link: Links.ACCOUNT_SETTINGS_PATH },
];
