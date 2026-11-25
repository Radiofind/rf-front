import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ProfileTracksComponent } from './profile-tracks.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrack } from '../../../../core/models/track.model';

describe('ProfileTracksComponent', () => {
  const midnight = {
    id: 1,
    title: 'Midnight Dreams',
    coverUrl: null,
    audioUrl: '/api/tracks/1/audio?token=t',
    durationSeconds: 214,
    playsCount: 1200,
    likesCount: 3,
    liked: false,
  } as ITrack;

  const createFixture = async (inputs: {
    tracks: readonly ITrack[] | null;
    canPlay?: boolean;
    hasMore?: boolean;
  }): Promise<ComponentFixture<ProfileTracksComponent>> => {
    await TestBed.configureTestingModule({ imports: [ProfileTracksComponent] }).compileComponents();
    const fixture: ComponentFixture<ProfileTracksComponent> =
      TestBed.createComponent(ProfileTracksComponent);
    fixture.componentRef.setInput('tracks', inputs.tracks);
    fixture.componentRef.setInput('canPlay', inputs.canPlay ?? true);
    fixture.componentRef.setInput('hasMore', inputs.hasMore ?? false);
    await fixture.whenStable();
    return fixture;
  };

  it('says there are no tracks yet', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({ tracks: [] });

    expect(fixture.nativeElement.querySelector('.empty__title').textContent.trim()).toBe(
      'No tracks yet',
    );
  });

  it('shows nothing while the tracks are not loaded', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({ tracks: null });

    expect(fixture.nativeElement.querySelector('.tracks__list')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty__title')).toBeNull();
  });

  it('shows the title, duration, plays and likes of a track', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({
      tracks: [midnight],
    });
    const item: HTMLElement = fixture.nativeElement.querySelector('.tracks__item');

    expect(item.querySelector('.tracks__name')!.textContent.trim()).toBe('Midnight Dreams');
    expect(item.querySelector('.tracks__duration')!.textContent.trim()).toBe('3:34');
    expect(
      Array.from(item.querySelectorAll('.tracks__stat')).map((stat: Element) =>
        stat.textContent.trim(),
      ),
    ).toEqual(['1.2K', '3']);
  });

  it('plays the clicked track', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({
      tracks: [midnight],
    });
    const playToggled = vi.fn();
    fixture.componentInstance.playToggled.subscribe(playToggled);

    fixture.nativeElement.querySelector('.tracks__play').click();

    expect(playToggled).toHaveBeenCalledWith(midnight);
  });

  it('offers no playback in radio mode', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({
      tracks: [midnight],
      canPlay: false,
    });

    expect(fixture.nativeElement.querySelector('.tracks__play')).toBeNull();
  });

  it('asks for more tracks only while there are more', async () => {
    const fixture: ComponentFixture<ProfileTracksComponent> = await createFixture({
      tracks: [midnight],
      hasMore: true,
    });
    const moreClicked = vi.fn();
    fixture.componentInstance.moreClicked.subscribe(moreClicked);

    fixture.nativeElement.querySelector('.tracks__more').click();
    fixture.componentRef.setInput('hasMore', false);
    await fixture.whenStable();

    expect(moreClicked).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.tracks__more')).toBeNull();
  });
});
