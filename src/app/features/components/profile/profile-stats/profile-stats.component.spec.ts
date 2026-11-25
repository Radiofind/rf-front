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

  it('renders every stat with a placeholder by default', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();
    await fixture.whenStable();

    expect(stats(fixture)).toEqual([
      [Constants.DASH, 'Followers'],
      [Constants.DASH, 'Uploads'],
      [Constants.DASH, 'Likes'],
      [Constants.DASH, 'Joined'],
    ]);
  });

  it('shows the registration date as the join date', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();

    fixture.componentRef.setInput('registeredAt', 'Oct 2026');
    await fixture.whenStable();

    expect(stats(fixture)[3]).toEqual(['Oct 2026', 'Joined']);
  });

  it('shows the number of uploads', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();

    fixture.componentRef.setInput('uploadsCount', '3');
    await fixture.whenStable();

    expect(stats(fixture)[1]).toEqual(['3', 'Uploads']);
  });

  it('shows the number of followers and likes', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();

    fixture.componentRef.setInput('followersCount', '12');
    fixture.componentRef.setInput('likesCount', '40');
    await fixture.whenStable();

    expect(stats(fixture)[0]).toEqual(['12', 'Followers']);
    expect(stats(fixture)[2]).toEqual(['40', 'Likes']);
  });

  it('names the uploads with the bound label', async () => {
    const fixture: ComponentFixture<ProfileStatsComponent> = await createFixture();

    fixture.componentRef.setInput('uploadsLabel', 'profile.tracks');
    await fixture.whenStable();

    expect(stats(fixture)[1]).toEqual([Constants.DASH, 'Tracks']);
  });
});
