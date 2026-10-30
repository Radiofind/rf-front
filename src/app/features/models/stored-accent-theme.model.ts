import type { AccentColor } from '../../core/types/accent-color.type';

export interface IStoredAccentTheme {
  accentColor: AccentColor;
  properties: Readonly<Record<string, string>>;
}
