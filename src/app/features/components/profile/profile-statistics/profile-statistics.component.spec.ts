import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileStatisticsComponent } from './profile-statistics.component';
import { StatisticsPeriodEnum } from '../../../../core/enums/statistics-period.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { IStatisticsKpi } from '../../../models/statistics-view.model';

describe('ProfileStatisticsComponent', () => {
  const kpis: IStatisticsKpi[] = [
    {
      metric: 'plays',
      label: 'statistics.kpis.plays',
      iconClass: 'bx bx-play',
      value: 48200,
      change: 0.124,
    },
    {
      metric: 'downloads',
      label: 'statistics.kpis.downloads',
      iconClass: 'bx bx-arrow-down-circle',
      value: 6900,
      change: null,
    },
    {
      metric: 'likes',
      label: 'statistics.kpis.likes',
      iconClass: 'bx bx-heart',
      value: 3000,
      change: 0,
    },
    {
      metric: 'uniqueListeners',
      label: 'statistics.kpis.uniqueListeners',
      iconClass: 'bx bx-broadcast',
      value: 19800,
      change: -0.05,
    },
  ];

  const createFixture = async (): Promise<ComponentFixture<ProfileStatisticsComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatisticsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture: ComponentFixture<ProfileStatisticsComponent> = TestBed.createComponent(
      ProfileStatisticsComponent,
    );
    fixture.componentRef.setInput('period', StatisticsPeriodEnum.LAST_7_DAYS);

    return fixture;
  };

  const element = (fixture: ComponentFixture<ProfileStatisticsComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const period = (
    fixture: ComponentFixture<ProfileStatisticsComponent>,
    label: string,
  ): HTMLButtonElement =>
    Array.from(
      element(fixture).querySelectorAll<HTMLButtonElement>('.profile-statistics__period'),
    ).find((button: HTMLButtonElement) => button.textContent.trim() === label)!;

  it('offers a week, a month and a year with the chosen one pressed', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();
    await fixture.whenStable();

    expect(
      Array.from(
        element(fixture).querySelectorAll('.profile-statistics__period'),
        (button: Element) => [button.textContent.trim(), button.getAttribute('aria-pressed')],
      ),
    ).toEqual([
      ['1 Week', 'true'],
      ['1 Month', 'false'],
      ['1 Year', 'false'],
    ]);
  });

  it('reports another period once it is chosen', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();
    const selected = vi.fn();
    fixture.componentInstance.periodSelected.subscribe(selected);
    await fixture.whenStable();

    period(fixture, '1 Year').click();

    expect(selected).toHaveBeenCalledExactlyOnceWith(StatisticsPeriodEnum.LAST_12_MONTHS);
  });

  it('does not report the period already shown', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();
    const selected = vi.fn();
    fixture.componentInstance.periodSelected.subscribe(selected);
    await fixture.whenStable();

    period(fixture, '1 Week').click();

    expect(selected).not.toHaveBeenCalled();
  });

  it('links to the extended statistics on the chosen period', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();

    fixture.componentRef.setInput('period', StatisticsPeriodEnum.LAST_30_DAYS);
    await fixture.whenStable();

    const link: HTMLAnchorElement = element(fixture).querySelector('.profile-statistics__link')!;
    expect(link.textContent.trim()).toBe('Go to extended statistics');
    expect(link.getAttribute('href')).toBe('/statistics?period=LAST_30_DAYS');
  });

  it('shows placeholders until the first statistics arrive', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();
    await fixture.whenStable();

    expect(element(fixture).querySelectorAll('.profile-statistics__skeleton').length).toBe(4);
    expect(element(fixture).querySelector('.kpi')).toBeNull();
  });

  it('shows every key figure of the period', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();

    fixture.componentRef.setInput('kpis', kpis);
    await fixture.whenStable();

    expect(
      Array.from(
        element(fixture).querySelectorAll('.kpi'),
        (card: Element) =>
          `${card.querySelector('.kpi__label')?.textContent.trim() ?? ''} ${card.querySelector('.kpi__value')?.textContent.trim() ?? ''}`,
      ),
    ).toEqual(['Total plays 48.2K', 'Downloads 6.9K', 'Likes 3K', 'Unique listeners 19.8K']);
  });

  it('keeps the figures visible but marked as busy while another period loads', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();

    fixture.componentRef.setInput('kpis', kpis);
    fixture.componentRef.setInput('isLoading', true);
    await fixture.whenStable();

    const figures: HTMLElement = element(fixture).querySelector('.profile-statistics__kpis')!;
    expect(figures.getAttribute('aria-busy')).toBe('true');
    expect(figures.querySelectorAll('.kpi').length).toBe(4);
  });

  it('offers to load again when the statistics could not be loaded', async () => {
    const fixture: ComponentFixture<ProfileStatisticsComponent> = await createFixture();
    const retried = vi.fn();
    fixture.componentInstance.retryClicked.subscribe(retried);
    fixture.componentRef.setInput('hasLoadFailed', true);
    await fixture.whenStable();

    element(fixture)
      .querySelector<HTMLButtonElement>('.profile-statistics__failure button')!
      .click();

    expect(element(fixture).querySelector('.profile-statistics__failure')?.textContent).toContain(
      'We could not load your statistics',
    );
    expect(retried).toHaveBeenCalledOnce();
  });
});
