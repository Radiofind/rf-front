import { Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Constants } from '../../../../core/constants/constants';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number/compact-number.pipe';
import { LocalDateTimePipe } from '../../../../shared/pipes/local-date-time/local-date-time.pipe';
import {
  areaPath,
  axisTicks,
  linePath,
  nearestIndex,
  xPosition,
  yPosition,
} from '../../../../shared/helpers/chart/chart.helpers';
import {
  TIMELINE_AXIS_INTERVALS,
  TIMELINE_FORMATS,
  TIMELINE_LABEL_COUNT,
} from '../../../constants/statistics.constant';

import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import type { StatisticsGranularityEnum } from '../../../../core/enums/statistics-granularity.enum';
import type { ITimelinePoint } from '../../../../core/models/statistics.model';
import type { ITimelineFormat } from '../../../models/statistics-view.model';

interface IAxisLabel {
  start: string;
  left: number;
}

interface IHoveredPoint {
  point: ITimelinePoint;
  left: number;
  playsTop: number;
  downloadsTop: number;
  alignsEnd: boolean;
}

const TOOLTIP_FLIP_POSITION: number = 60;

const PERCENT: number = 100;

@Component({
  selector: 'app-plays-timeline-chart',
  imports: [NgTemplateOutlet, TranslatePipe, CompactNumberPipe, LocalDateTimePipe],
  templateUrl: './plays-timeline-chart.component.html',
  styleUrl: './plays-timeline-chart.component.scss',
})
export class PlaysTimelineChartComponent {
  public readonly points: InputSignal<readonly ITimelinePoint[]> =
    input.required<readonly ITimelinePoint[]>();

  public readonly granularity: InputSignal<StatisticsGranularityEnum> =
    input.required<StatisticsGranularityEnum>();

  protected readonly hoveredIndex: WritableSignal<number | null> = signal<number | null>(null);

  protected readonly ticks: Signal<number[]> = computed<number[]>(() =>
    axisTicks(
      Math.max(
        Constants.ZERO,
        ...this.points().map((point: ITimelinePoint) => Math.max(point.plays, point.downloads)),
      ),
      TIMELINE_AXIS_INTERVALS,
    ),
  );

  protected readonly axisMax: Signal<number> = computed<number>(
    () => this.ticks().at(-Constants.ONE) ?? Constants.ZERO,
  );

  protected readonly playsLine: Signal<string> = computed<string>(() =>
    linePath(this.plays(), this.axisMax()),
  );

  protected readonly playsArea: Signal<string> = computed<string>(() =>
    areaPath(this.plays(), this.axisMax()),
  );

  protected readonly downloadsLine: Signal<string> = computed<string>(() =>
    linePath(
      this.points().map((point: ITimelinePoint) => point.downloads),
      this.axisMax(),
    ),
  );

  protected readonly axisLabels: Signal<IAxisLabel[]> = computed<IAxisLabel[]>(() => {
    const count: number = this.points().length;
    const step: number = Math.max(Constants.ONE, Math.ceil(count / TIMELINE_LABEL_COUNT));

    return this.points().flatMap((point: ITimelinePoint, index: number): IAxisLabel[] =>
      index % step === Constants.ZERO
        ? [{ start: point.start, left: xPosition(index, count) }]
        : [],
    );
  });

  protected readonly hovered: Signal<IHoveredPoint | null> = computed<IHoveredPoint | null>(() => {
    const index: number | null = this.hoveredIndex();
    const point: ITimelinePoint | undefined = index === null ? undefined : this.points()[index];

    if (index === null || !point) {
      return null;
    }

    const left: number = xPosition(index, this.points().length);

    return {
      point: point,
      left: left,
      playsTop: yPosition(point.plays, this.axisMax()),
      downloadsTop: yPosition(point.downloads, this.axisMax()),
      alignsEnd: left > TOOLTIP_FLIP_POSITION,
    };
  });

  protected readonly format: Signal<ITimelineFormat> = computed<ITimelineFormat>(
    () => TIMELINE_FORMATS[this.granularity()],
  );

  private readonly plays: Signal<number[]> = computed<number[]>(() =>
    this.points().map((point: ITimelinePoint) => point.plays),
  );

  protected tickPosition(tick: number): number {
    return this.axisMax() > Constants.ZERO ? (tick / this.axisMax()) * PERCENT : Constants.ZERO;
  }

  public onPointerMove(event: PointerEvent): void {
    const plot: HTMLElement = event.currentTarget as HTMLElement;
    const bounds: DOMRect = plot.getBoundingClientRect();

    if (!bounds.width || !this.points().length) {
      return;
    }

    this.hoveredIndex.set(
      nearestIndex((event.clientX - bounds.left) / bounds.width, this.points().length),
    );
  }

  public onKeydown(event: KeyboardEvent): void {
    const last: number = this.points().length - Constants.ONE;
    const current: number | null = this.hoveredIndex();

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.hoveredIndex.set(
        current === null ? Constants.ZERO : Math.min(current + Constants.ONE, last),
      );
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.hoveredIndex.set(
        current === null ? last : Math.max(current - Constants.ONE, Constants.ZERO),
      );
    } else if (event.key === 'Escape') {
      this.hoveredIndex.set(null);
    }
  }

  public onLeave(): void {
    this.hoveredIndex.set(null);
  }
}
