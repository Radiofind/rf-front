import {
  AUDIOWAVE_BARS,
  AUDIOWAVE_FAVICON_VIEW_BOX,
  AUDIOWAVE_GRADIENT_BOTTOM,
  AUDIOWAVE_GRADIENT_TOP,
} from '../../constants/audiowave.constant';

import type { IAudiowaveBar } from '../../models/audiowave-bar.model';

const SVG_DATA_URL_PREFIX: string = 'data:image/svg+xml,';

export function createAudiowaveFavicon(topColor: string, bottomColor: string): string {
  const bars: string = AUDIOWAVE_BARS.map(
    (bar: IAudiowaveBar) =>
      `<rect x="${String(bar.x)}" y="${String(bar.y)}" width="${String(bar.width)}" ` +
      `height="${String(bar.height)}" rx="${String(bar.width / 2)}"/>`,
  ).join('');

  const svg: string =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${AUDIOWAVE_FAVICON_VIEW_BOX}">` +
    `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="${String(AUDIOWAVE_GRADIENT_TOP)}" x2="0" y2="${String(AUDIOWAVE_GRADIENT_BOTTOM)}">` +
    `<stop offset="0" stop-color="${topColor}"/><stop offset="1" stop-color="${bottomColor}"/>` +
    `</linearGradient><g fill="url(#g)">${bars}</g></svg>`;

  return SVG_DATA_URL_PREFIX + encodeURIComponent(svg);
}
