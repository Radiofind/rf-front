import type { IAudiowaveBar } from '../models/audiowave-bar.model';

export const AUDIOWAVE_LOGO_VIEW_BOX: string = '0 0 64 64';

export const AUDIOWAVE_FAVICON_VIEW_BOX: string = '8 8 48 48';

export const AUDIOWAVE_GRADIENT_TOP: number = 13.5;

export const AUDIOWAVE_GRADIENT_BOTTOM: number = 50.5;

export const AUDIOWAVE_BARS: readonly IAudiowaveBar[] = [
  { x: 10.5, y: 28.5, width: 3, height: 7 },
  { x: 15.75, y: 24, width: 3.5, height: 16 },
  { x: 22.5, y: 19.5, width: 3.5, height: 25 },
  { x: 30.25, y: 13.5, width: 3.5, height: 37 },
  { x: 38, y: 19.5, width: 3.5, height: 25 },
  { x: 44.75, y: 24, width: 3.5, height: 16 },
  { x: 50.5, y: 28.5, width: 3, height: 7 },
];
