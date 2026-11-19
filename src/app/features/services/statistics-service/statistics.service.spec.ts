import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { ApiService } from '../../../core/services/api/api.service';
import { StatisticsPeriodEnum } from '../../../core/enums/statistics-period.enum';

describe('StatisticsService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for the statistics in the time zone of the viewer', () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'Europe/Zurich',
    } as Intl.ResolvedDateTimeFormatOptions);
    const getStatistics: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { getStatistics: getStatistics } }],
    });

    TestBed.inject(StatisticsService).getStatistics(StatisticsPeriodEnum.LAST_7_DAYS).subscribe();

    expect(getStatistics).toHaveBeenCalledExactlyOnceWith({
      period: StatisticsPeriodEnum.LAST_7_DAYS,
      zone: 'Europe/Zurich',
    });
  });
});
