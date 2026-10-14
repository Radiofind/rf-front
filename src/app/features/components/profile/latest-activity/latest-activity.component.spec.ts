import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LatestActivityComponent } from './latest-activity.component';
import { Links } from '../../../../core/constants/links';

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

  it('renders the empty state call to action as a button', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture();
    const cta: HTMLElement = fixture.nativeElement.querySelector('.activity__cta');

    expect(cta.tagName).toBe('BUTTON');
    expect(cta.textContent.trim()).toBe('Upload your first track');
  });

  it('navigates to the upload page when the call to action is clicked', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.activity__cta').click();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith([Links.UPLOAD_TRACK_URL]);
  });
});
