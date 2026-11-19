import type { Locator, Page } from '@playwright/test';

export class StatisticsPage {
  public readonly root: Locator;
  public readonly title: Locator;
  public readonly skeleton: Locator;
  public readonly kpiLabels: Locator;
  public readonly kpiValues: Locator;
  public readonly kpiComparisons: Locator;
  public readonly timelineSubtitle: Locator;
  public readonly timelinePlot: Locator;
  public readonly timelineLabels: Locator;
  public readonly tooltipValues: Locator;
  public readonly genreNames: Locator;
  public readonly genreShares: Locator;
  public readonly topTrackNames: Locator;
  public readonly topTrackPlays: Locator;
  public readonly shareNames: Locator;
  public readonly shareValues: Locator;
  public readonly emptyNotes: Locator;

  public constructor(page: Page) {
    this.root = page.locator('app-statistics-page');
    this.title = this.root.getByRole('heading', { level: 1 });
    this.skeleton = this.root.locator('app-statistics-skeleton');
    this.kpiLabels = this.root.locator('.kpi__label');
    this.kpiValues = this.root.locator('.kpi__value');
    this.kpiComparisons = this.root.locator('.kpi__comparison');
    this.timelineSubtitle = this.root.locator('.statistics__card-subtitle');
    this.timelinePlot = this.root.getByRole('group', { name: 'Plays and downloads over time' });
    this.timelineLabels = this.root.locator('.timeline__x-label');
    this.tooltipValues = this.root.locator('.timeline__tooltip-value');
    this.genreNames = this.root.locator('.genres__name');
    this.genreShares = this.root.locator('.genres__share');
    this.topTrackNames = this.root.locator('.top-tracks__name');
    this.topTrackPlays = this.root.locator('.top-tracks__plays-value');
    this.shareNames = this.root.locator('.donut__legend-name');
    this.shareValues = this.root.locator('.donut__legend-share');
    this.emptyNotes = this.root.locator('.genres__empty, .top-tracks__empty, .donut__empty');
  }

  public period(label: string): Locator {
    return this.root.getByRole('button', { name: label, exact: true });
  }
}
