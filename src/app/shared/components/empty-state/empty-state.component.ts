import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

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
}
