import { DOCUMENT, inject, Service } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { ACCENT_COLORS, ARTWORK_ACCENT_COLOR } from '../../constants/settings.constant';
import { getHueShift } from '../../../shared/helpers/color/color.helpers';
import { createAudiowaveFavicon } from '../../../shared/helpers/favicon/favicon.helpers';

import type { AccentColor } from '../../../core/types/accent-color.type';
import type { IAccentColorOption } from '../../models/accent-color-option.model';

@Service()
export class AccentThemeService {
  private readonly document: Document = inject(DOCUMENT);

  public apply(accentColorValue: AccentColor): void {
    const root: HTMLElement = this.document.documentElement;
    const accentColor: IAccentColorOption = ACCENT_COLORS[accentColorValue];
    const hueShift: number = getHueShift(
      ACCENT_COLORS[ARTWORK_ACCENT_COLOR].mainColor,
      accentColor.mainColor,
    );

    root.style.setProperty(Constants.FIRST_GRADIENT_COLOR_PROPERTY, accentColor.firstColor);
    root.style.setProperty(Constants.SECOND_GRADIENT_COLOR_PROPERTY, accentColor.secondColor);
    root.style.setProperty(Constants.MAIN_COLOR_PROPERTY, accentColor.mainColor);
    root.style.setProperty(
      Constants.ACCENT_HUE_SHIFT_PROPERTY,
      String(hueShift) + Constants.DEGREE_UNIT,
    );

    this.applyFavicon(accentColor);
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
}
