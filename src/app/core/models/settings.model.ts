import type { AccentColor } from '../types/accent-color.type';
import type { AudioQuality } from '../types/audio-quality.type';
import type { Language } from '../types/language.type';
import type { ProfileVisibility } from '../types/profile-visibility.type';

export interface IGeneralSettings {
  language: Language;
  radioMode: boolean;
  profileVisibility: ProfileVisibility;
  notificationsEnabled: boolean;
  audioQuality: AudioQuality;
  accentColor: AccentColor;
}
