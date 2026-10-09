import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileHeroComponent } from './profile-hero.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileHeroComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHeroComponent],
    }).compileComponents();

    const fixture: ComponentFixture<ProfileHeroComponent> =
      TestBed.createComponent(ProfileHeroComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
