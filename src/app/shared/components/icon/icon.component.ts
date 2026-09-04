import { Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})

export class IconComponent {
  public readonly iconClass: InputSignal<string | null> = input<string | null>(null);

  public readonly iconMinWidth: InputSignal<string | null> = input<string | null>(null);

  public readonly iconHeight: InputSignal<string | null> = input<string | null>(null);

  public readonly iconBorderRadius: InputSignal<string | null> = input<string | null>(null);

  public readonly iconFontSize: InputSignal<string | null> = input<string | null>(null);
}
