import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-follow-button',
  templateUrl: './follow-button.component.html',
  styleUrl: './follow-button.component.scss',
  imports: [TranslatePipe],
})
export class FollowButtonComponent {
  public readonly name: InputSignal<string> = input.required<string>();

  public readonly following: InputSignal<boolean> = input<boolean>(false);

  public readonly pending: InputSignal<boolean> = input<boolean>(false);

  public readonly followClicked: OutputEmitterRef<void> = output();

  public readonly unfollowClicked: OutputEmitterRef<void> = output();

  public onClick(): void {
    if (this.following()) {
      this.unfollowClicked.emit();
      return;
    }

    this.followClicked.emit();
  }
}
