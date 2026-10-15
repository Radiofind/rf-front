import { Component, input } from '@angular/core';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-settings-row',
  templateUrl: './settings-row.component.html',
  styleUrl: './settings-row.component.scss',
})
export class SettingsRowComponent {
  public readonly rowId: InputSignal<string> = input.required<string>();

  public readonly iconClass: InputSignal<string> = input.required<string>();

  public readonly rowTitle: InputSignal<string> = input.required<string>();

  public readonly rowDescription: InputSignal<string> = input.required<string>();
}
