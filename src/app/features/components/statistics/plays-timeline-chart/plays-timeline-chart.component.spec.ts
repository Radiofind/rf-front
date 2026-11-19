import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PlaysTimelineChartComponent } from './plays-timeline-chart.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITimelinePoint } from '../../../../core/models/statistics.model';

describe('PlaysTimelineChartComponent', () => {
  const points: ITimelinePoint[] = [
    { start: '2026-11-17', plays: 120, downloads: 4 },
    { start: '2026-11-18', plays: 260, downloads: 9 },
    { start: '2026-11-19', plays: 90, downloads: 1 },
  ];

  const createFixture = async (
    isMonthly: boolean = false,
  ): Promise<ComponentFixture<PlaysTimelineChartComponent>> => {
    await TestBed.configureTestingModule({
      imports: [PlaysTimelineChartComponent],
    }).compileComponents();

    const fixture: ComponentFixture<PlaysTimelineChartComponent> = TestBed.createComponent(
      PlaysTimelineChartComponent,
    );
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('isMonthly', isMonthly);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<PlaysTimelineChartComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const pressKey = async (
    fixture: ComponentFixture<PlaysTimelineChartComponent>,
    key: string,
  ): Promise<void> => {
    element(fixture)
      .querySelector('.timeline__plot')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
    await fixture.whenStable();
  };

  it('scales the axis to whole steps above the busiest day', async () => {
    const fixture: ComponentFixture<PlaysTimelineChartComponent> = await createFixture();

    expect(
      Array.from(element(fixture).querySelectorAll('.timeline__y-label'), (label: Element) =>
        label.textContent.trim(),
      ),
    ).toEqual(['0', '100', '200', '300', '400']);
  });

  it('shows the plays and downloads of the day reached with the keyboard', async () => {
    const fixture: ComponentFixture<PlaysTimelineChartComponent> = await createFixture();

    await pressKey(fixture, 'ArrowRight');
    await pressKey(fixture, 'ArrowRight');

    expect(
      Array.from(element(fixture).querySelectorAll('.timeline__tooltip p'), (row: Element) =>
        row.textContent.replace(/\s+/g, ' ').trim(),
      ),
    ).toEqual(['Wed, November 18', 'Plays 260', 'Downloads 9']);
  });

  it('hides the details again on escape', async () => {
    const fixture: ComponentFixture<PlaysTimelineChartComponent> = await createFixture();
    await pressKey(fixture, 'ArrowLeft');

    await pressKey(fixture, 'Escape');

    expect(element(fixture).querySelector('.timeline__tooltip')).toBeNull();
  });

  it('names months instead of days on a monthly timeline', async () => {
    const fixture: ComponentFixture<PlaysTimelineChartComponent> = await createFixture(true);

    expect(element(fixture).querySelector('.timeline__x-label')?.textContent.trim()).toBe('Nov');
  });

  it('lists every point in a table for screen readers', async () => {
    const fixture: ComponentFixture<PlaysTimelineChartComponent> = await createFixture();

    expect(element(fixture).querySelectorAll('tbody tr')).toHaveLength(3);
  });
});
