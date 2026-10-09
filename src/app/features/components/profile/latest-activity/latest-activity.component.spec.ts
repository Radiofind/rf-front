import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LatestActivityComponent } from './latest-activity.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('LatestActivityComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [LatestActivityComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture: ComponentFixture<LatestActivityComponent> =
      TestBed.createComponent(LatestActivityComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
