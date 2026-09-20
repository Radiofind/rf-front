import { Component, input } from '@angular/core';

import type { InputSignal } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})

export class HeaderComponent {
  public readonly isMainApplication: InputSignal<boolean> = input<boolean>(false);
}
