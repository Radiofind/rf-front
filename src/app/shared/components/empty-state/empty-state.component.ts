import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})

export class EmptyStateComponent {
  public readonly emptyIconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly emptyTitle: InputSignal<string | null> = input<string | null>(null);

  public readonly emptyDescription: InputSignal<string | null> = input<string | null>(null);

  public readonly iconSize: string = Constants.EMPTY_STATE_ICON_SIZE;

  public readonly iconFontSize: string = Constants.EMPTY_STATE_ICON_FONT_SIZE;

  public readonly iconBorderRadius: string = Constants.EMPTY_STATE_ICON_BORDER_RADIUS;
}
