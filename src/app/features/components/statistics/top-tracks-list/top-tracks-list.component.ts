import { Component, input } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';

import type { InputSignal } from '@angular/core';
import type { ITopTrack } from '../../../../core/models/statistics.model';

@Component({
  selector: 'app-top-tracks-list',
  imports: [TranslatePipe, CompactNumberPipe],
  templateUrl: './top-tracks-list.component.html',
  styleUrl: './top-tracks-list.component.scss',
})
export class TopTracksListComponent {
  public readonly tracks: InputSignal<readonly ITopTrack[]> =
    input.required<readonly ITopTrack[]>();
}
