import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { PercentValuePipe } from '../../../../shared/pipes/percent-value/percent-value.pipe';

import type { InputSignal } from '@angular/core';
import type { IGenreShare } from '../../../models/statistics-view.model';

@Component({
  selector: 'app-genre-share-list',
  imports: [TranslatePipe, CompactNumberPipe, PercentValuePipe],
  templateUrl: './genre-share-list.component.html',
  styleUrl: './genre-share-list.component.scss',
})
export class GenreShareListComponent {
  public readonly shares: InputSignal<readonly IGenreShare[]> =
    input.required<readonly IGenreShare[]>();
}
