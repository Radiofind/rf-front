import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileStatsComponent } from './profile-stats.component';
import { Constants } from '../../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileStatsComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<ProfileStatsComponent>> => {
    await TestBed.configureTestingModule({ imports: [ProfileStatsComponent] }).compileComponents();
    return TestBed.createComponent(ProfileStatsComponent);
  };

  const stats = (fixture: ComponentFixture<ProfileStatsComponent>): [string, string][] =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stats__item')).map(
      (item: HTMLElement) => [
        item.querySelector('.stats__value')!.textContent.trim(),
        item.querySelector('.stats__label')!.textContent.trim(),
      ],
    );

  it('renders every stat with a placeholder join date by default', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();
    await fixture.whenStable();

    expect(stats(fixture)).toEqual([
      ['0', 'Followers'],
      ['0', 'Uploads'],
      ['0', 'Likes'],
      [Constants.DASH, 'Joined'],
    ]);
  });

  it('shows the registration date as the join date', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();

    fixture.componentRef.setInput('registeredAt', 'Oct 2026');
    await fixture.whenStable();

    expect(stats(fixture)[3]).toEqual(['Oct 2026', 'Joined']);
  });
});
