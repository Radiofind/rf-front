import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StatisticsKpiCardComponent } from './statistics-kpi-card.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { IStatisticsKpi } from '../../../models/statistics-view.model';

describe('StatisticsKpiCardComponent', () => {
  const createFixture = async (
    change: number | null,
  ): Promise<ComponentFixture<StatisticsKpiCardComponent>> => {
    await TestBed.configureTestingModule({
      imports: [StatisticsKpiCardComponent],
    }).compileComponents();

    const fixture: ComponentFixture<StatisticsKpiCardComponent> = TestBed.createComponent(
      StatisticsKpiCardComponent,
    );
    const kpi: IStatisticsKpi = {
      metric: 'plays',
      label: 'statistics.kpis.plays',
      iconClass: 'bx bx-play',
      value: 48200,
      change: change,
    };
    fixture.componentRef.setInput('kpi', kpi);
    await fixture.whenStable();

    return fixture;
  };

  const comparison = (fixture: ComponentFixture<StatisticsKpiCardComponent>): Element | null =>
    (fixture.nativeElement as HTMLElement).querySelector('.kpi__comparison');

  it.each([
    [0.124, '+12.4%', 'kpi__change--up'],
    [-0.012, '-1.2%', 'kpi__change--down'],
  ])(
    'marks a change of %f against the previous period as %s',
    async (change: number, text: string, modifier: string) => {
      const fixture: ComponentFixture<StatisticsKpiCardComponent> = await createFixture(change);

      const pill: Element | null | undefined = comparison(fixture)?.querySelector('.kpi__change');

      expect(pill?.textContent.trim()).toBe(text);
      expect(pill?.classList).toContain(modifier);
    },
  );

  it('says there is nothing to compare with when the previous period was empty', async () => {
    const fixture: ComponentFixture<StatisticsKpiCardComponent> = await createFixture(null);

    expect(comparison(fixture)?.textContent.trim()).toBe('No earlier data');
  });
});
