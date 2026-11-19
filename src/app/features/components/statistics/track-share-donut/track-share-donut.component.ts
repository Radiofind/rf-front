import { Component, computed, input, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { PercentValuePipe } from '../../../../shared/pipes/percent-value/percent-value.pipe';
import { donutSegments } from '../../../../shared/helpers/chart/chart.helpers';
import { DONUT_SEGMENT_GAP } from '../../../constants/statistics.constant';

import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import type { IDonutSegment } from '../../../../shared/models/chart.model';
import type { ITrackShare } from '../../../models/statistics-view.model';

@Component({
  selector: 'app-track-share-donut',
  imports: [TranslatePipe, CompactNumberPipe, PercentValuePipe],
  templateUrl: './track-share-donut.component.html',
  styleUrl: './track-share-donut.component.scss',
})
export class TrackShareDonutComponent {
  public readonly shares: InputSignal<readonly ITrackShare[]> =
    input.required<readonly ITrackShare[]>();

  public readonly totalPlays: InputSignal<number> = input.required<number>();

  protected readonly activeIndex: WritableSignal<number | null> = signal<number | null>(null);

  protected readonly segments: Signal<IDonutSegment[]> = computed<IDonutSegment[]>(() =>
    donutSegments(
      this.shares().map((share: ITrackShare) => share.share),
      DONUT_SEGMENT_GAP,
    ),
  );

  protected readonly active: Signal<ITrackShare | null> = computed<ITrackShare | null>(() => {
    const index: number | null = this.activeIndex();

    return index === null ? null : (this.shares()[index] ?? null);
  });

  public onActivate(index: number): void {
    this.activeIndex.set(index);
  }

  public onDeactivate(): void {
    this.activeIndex.set(null);
  }
}
