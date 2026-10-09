import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LatestActivityComponent } from './latest-activity.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('LatestActivityComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<LatestActivityComponent>> => {
    await TestBed.configureTestingModule({
      imports: [LatestActivityComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture: ComponentFixture<LatestActivityComponent> =
      TestBed.createComponent(LatestActivityComponent);
    await fixture.whenStable();

    return fixture;
  };

  it('shows the empty state instead of the activity list', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('.activity__list')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty__title').textContent).toBe(
      'No activity yet',
    );
  });

  it('links the empty state to the upload page', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('.activity__cta').getAttribute('href')).toBe(
      '/upload-track',
    );
  });
});
