import { Component, input, output } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { LibraryEmptyStateEnum } from '../../../enums/library-empty-state.enum';

import type { InputSignal, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-library-empty-state',
  templateUrl: './library-empty-state.component.html',
  styleUrl: './library-empty-state.component.scss',
  imports: [EmptyStateComponent, TranslatePipe],
})
export class LibraryEmptyStateComponent {
  public readonly kind: InputSignal<LibraryEmptyStateEnum> =
    input.required<LibraryEmptyStateEnum>();

  public readonly search: InputSignal<string> = input<string>('');

  public readonly resetClicked: OutputEmitterRef<void> = output();

  public readonly retryClicked: OutputEmitterRef<void> = output();

  protected readonly kinds: typeof LibraryEmptyStateEnum = LibraryEmptyStateEnum;
}
