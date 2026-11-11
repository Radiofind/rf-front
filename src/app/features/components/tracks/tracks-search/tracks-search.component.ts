import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { MY_UPLOADS_SEARCH_MAX_LENGTH } from '../../../constants/my-uploads.constant';

import type { InputSignal, OutputEmitterRef } from '@angular/core';

@Component({
  selector: 'app-tracks-search',
  templateUrl: './tracks-search.component.html',
  styleUrl: './tracks-search.component.scss',
  imports: [TranslatePipe],
})
export class TracksSearchComponent {
  public readonly value: InputSignal<string> = input.required<string>();

  public readonly placeholder: InputSignal<string> = input.required<string>();

  public readonly searchChanged: OutputEmitterRef<string> = output<string>();

  protected readonly maxLength: number = MY_UPLOADS_SEARCH_MAX_LENGTH;

  public onInput(event: Event): void {
    this.searchChanged.emit((event.target as HTMLInputElement).value);
  }
}
