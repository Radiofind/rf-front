import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileStatsComponent } from './profile-stats.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileStatsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatsComponent],
    }).compileComponents();

    const fixture: ComponentFixture<ProfileStatsComponent> =
      TestBed.createComponent(ProfileStatsComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
