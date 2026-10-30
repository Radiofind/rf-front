import { Component, input, signal } from '@angular/core';
import {
  AUDIOWAVE_BARS,
  AUDIOWAVE_GRADIENT_BOTTOM,
  AUDIOWAVE_GRADIENT_TOP,
  AUDIOWAVE_LOGO_VIEW_BOX,
} from '../../constants/audiowave.constant';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal, WritableSignal } from '@angular/core';
import type { IAudiowaveBar } from '../../models/audiowave-bar.model';

let nextGradientId: number = 0;

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  public readonly ariaLabel: InputSignal<string> = input.required<string>();

  public readonly bars: WritableSignal<readonly IAudiowaveBar[]> =
    signal<readonly IAudiowaveBar[]>(AUDIOWAVE_BARS);

  public readonly viewBox: WritableSignal<string> = signal<string>(AUDIOWAVE_LOGO_VIEW_BOX);

  public readonly gradientTop: WritableSignal<number> = signal<number>(AUDIOWAVE_GRADIENT_TOP);

  public readonly gradientBottom: WritableSignal<number> =
    signal<number>(AUDIOWAVE_GRADIENT_BOTTOM);

  public readonly gradientId: WritableSignal<string> = signal<string>(
    `${Constants.LOGO_GRADIENT_ID}${String(nextGradientId++)}`,
  );
}
