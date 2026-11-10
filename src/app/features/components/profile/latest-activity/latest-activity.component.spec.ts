import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LatestActivityComponent } from './latest-activity.component';
import { Links } from '../../../../core/constants/links';

import type { ComponentFixture } from '@angular/core/testing';
import type { IActivity } from '../../../../core/models/activity.model';

describe('LatestActivityComponent', () => {
  const uploadedTrack: IActivity = {
    id: 3,
    type: 'TRACK_UPLOADED',
    createdAt: '2026-11-03T10:00:00.123456Z',
    track: {
      id: 42,
      title: 'Midnight Dreams',
      artistName: 'The Engines',
      coverUrl: '/api/tracks/42/cover',
      status: 'PENDING_REVIEW',
    },
  };

  const createFixture = async (
    activities: readonly IActivity[] | null,
  ): Promise<ComponentFixture<LatestActivityComponent>> => {
    await TestBed.configureTestingModule({
      imports: [LatestActivityComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture: ComponentFixture<LatestActivityComponent> =
      TestBed.createComponent(LatestActivityComponent);
    fixture.componentRef.setInput('activities', activities);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<LatestActivityComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows neither the list nor the empty state while the activity is loading', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture(null);

    expect(element(fixture).querySelector('.activity__list')).toBeNull();
    expect(element(fixture).querySelector('.activity__empty')).toBeNull();
  });

  it('shows the empty state when there is no activity', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([]);

    expect(element(fixture).querySelector('.activity__list')).toBeNull();
    expect(element(fixture).querySelector('.empty__title')!.textContent).toBe('No activity yet');
  });

  it('renders the empty state call to action as a button', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([]);
    const cta: HTMLElement = element(fixture).querySelector('.activity__cta')!;

    expect(cta.tagName).toBe('BUTTON');
    expect(cta.textContent.trim()).toBe('Upload your first track');
  });

  it('navigates to the upload page when the call to action is clicked', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([]);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    element(fixture).querySelector<HTMLButtonElement>('.activity__cta')!.click();

    expect(navigate).toHaveBeenCalledExactlyOnceWith([Links.UPLOAD_TRACK_URL]);
  });

  it('shows the cover, title, artist and upload time of an uploaded track', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([uploadedTrack]);
    const item: HTMLElement = element(fixture).querySelector('.activity__item')!;

    expect(item.querySelector('img')!.getAttribute('src')).toBe('/api/tracks/42/cover');
    expect(item.querySelector('.activity__name')!.textContent.trim()).toBe('Midnight Dreams');
    expect(item.querySelector('.activity__artist')!.textContent.trim()).toBe('The Engines');
    expect(item.querySelector('.activity__event')!.textContent.trim()).toBe('Uploaded');
    expect(item.querySelector('.activity__date')!.textContent.trim()).toBe('2 days ago');
  });

  it('keeps showing a deleted track under the title and artist it had', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([
      {
        id: 4,
        type: 'TRACK_DELETED',
        createdAt: '2026-11-05T11:00:00Z',
        track: {
          id: null,
          title: 'Midnight Dreams',
          artistName: 'The Engines',
          coverUrl: null,
          status: null,
        },
      },
    ]);
    const item: HTMLElement = element(fixture).querySelector('.activity__item')!;

    expect(item.querySelector('.activity__name')!.textContent.trim()).toBe('Midnight Dreams');
    expect(item.querySelector('.activity__artist')!.textContent.trim()).toBe('The Engines');
    expect(item.querySelector('.activity__event')!.textContent.trim()).toBe('Deleted');
    expect(item.querySelector('.activity__date')!.textContent.trim()).toBe('1 hour ago');
  });

  it('shows a placeholder for a track without cover art', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([
      { ...uploadedTrack, track: { ...uploadedTrack.track!, coverUrl: null } },
    ]);
    const item: HTMLElement = element(fixture).querySelector('.activity__item')!;

    expect(item.querySelector('img')).toBeNull();
    expect(item.querySelector('.activity__thumb--placeholder')).not.toBeNull();
  });

  it('falls back to the placeholder when the cover cannot be loaded', async () => {
    const fixture: ComponentFixture<LatestActivityComponent> = await createFixture([uploadedTrack]);

    element(fixture).querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(element(fixture).querySelector('img')).toBeNull();
    expect(element(fixture).querySelector('.activity__thumb--placeholder')).not.toBeNull();
  });
});
