import { Component, input } from '@angular/core';
import { TooltipPlacementEnum } from '../../../core/enums/tooltip-placement.enum';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  host: {
    role: 'tooltip',
    class: 'tooltip',
    '[class.tooltip--below]': 'placement() === placements.BELOW',
    '[style.--tooltip-arrow-x.px]': 'arrowOffset()',
  },
})
export class TooltipComponent {
  public readonly text: InputSignal<string> = input.required<string>();

  public readonly placement: InputSignal<TooltipPlacementEnum> = input<TooltipPlacementEnum>(
    TooltipPlacementEnum.ABOVE,
  );

  public readonly arrowOffset: InputSignal<number | null> = input<number | null>(null);

  protected readonly placements: typeof TooltipPlacementEnum = TooltipPlacementEnum;
}
