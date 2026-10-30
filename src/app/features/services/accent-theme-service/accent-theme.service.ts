import { DOCUMENT, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import {
  ACCENT_COLORS,
  ARTWORK_ACCENT_COLOR,
  DEFAULT_GENERAL_SETTINGS,
} from '../../constants/settings.constant';
import { getHueShift } from '../../../shared/helpers/color/color.helpers';
import { createAudiowaveFavicon } from '../../../shared/helpers/favicon/favicon.helpers';

import type { Signal, WritableSignal } from '@angular/core';
import type { AccentColor } from '../../../core/types/accent-color.type';
import type { IAccentColorOption } from '../../models/accent-color-option.model';
import type { IStoredAccentTheme } from '../../models/stored-accent-theme.model';

@Service()
export class AccentThemeService {
  private readonly document: Document = inject(DOCUMENT);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly accentColorState: WritableSignal<AccentColor> = signal<AccentColor>(
    DEFAULT_GENERAL_SETTINGS.accentColor,
  );

  public readonly accentColor: Signal<AccentColor> = this.accentColorState.asReadonly();

  public init(): void {
    if (this.isBrowser) {
      this.apply(this.readStoredAccentColor() ?? DEFAULT_GENERAL_SETTINGS.accentColor);
    }
  }

  public apply(accentColorValue: AccentColor): void {
    const accentColor: IAccentColorOption = ACCENT_COLORS[accentColorValue];
    const hueShift: number = getHueShift(
      ACCENT_COLORS[ARTWORK_ACCENT_COLOR].mainColor,
      accentColor.mainColor,
    );
    const properties: Readonly<Record<string, string>> = {
      [Constants.FIRST_GRADIENT_COLOR_PROPERTY]: accentColor.firstColor,
      [Constants.SECOND_GRADIENT_COLOR_PROPERTY]: accentColor.secondColor,
      [Constants.MAIN_COLOR_PROPERTY]: accentColor.mainColor,
      [Constants.ACCENT_HUE_SHIFT_PROPERTY]: String(hueShift) + Constants.DEGREE_UNIT,
    };

    Object.entries(properties).forEach(([name, value]: [string, string]) => {
      this.document.documentElement.style.setProperty(name, value);
    });

    this.accentColorState.set(accentColorValue);
    this.applyFavicon(accentColor);
    this.storeAccentTheme({ accentColor: accentColorValue, properties: properties });
  }

  private applyFavicon(accentColor: IAccentColorOption): void {
    const favicon: HTMLLinkElement | null = this.document.head.querySelector<HTMLLinkElement>(
      Constants.FAVICON_SELECTOR,
    );

    if (!favicon) {
      return;
    }

    favicon.type = Constants.SVG_MIME_TYPE;
    favicon.href = createAudiowaveFavicon(accentColor.secondColor, accentColor.mainColor);
  }

  private readStoredAccentColor(): AccentColor | null {
    try {
      const theme: Partial<IStoredAccentTheme> | null = JSON.parse(
        localStorage.getItem(Constants.ACCENT_THEME_KEY) ?? Constants.NULL_JSON,
      ) as Partial<IStoredAccentTheme> | null;
      const accentColor: string | undefined = theme?.accentColor;

      return accentColor && accentColor in ACCENT_COLORS ? (accentColor as AccentColor) : null;
    } catch {
      return null;
    }
  }

  private storeAccentTheme(theme: IStoredAccentTheme): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.ACCENT_THEME_KEY, JSON.stringify(theme));
    }
  }
}
