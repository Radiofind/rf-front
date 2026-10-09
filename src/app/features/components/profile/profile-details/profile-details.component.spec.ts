import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileDetailsComponent } from './profile-details.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('ProfileDetailsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetailsComponent],
    }).compileComponents();

    const fixture: ComponentFixture<ProfileDetailsComponent> =
      TestBed.createComponent(ProfileDetailsComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
