import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UploadsTableComponent } from './uploads-table.component';
import { TrackStatusEnum } from '../../../../core/enums/track-status.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrack } from '../../../../core/models/track.model';

describe('UploadsTableComponent', () => {
  const midnight: ITrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.PENDING_REVIEW,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    coverUrl: '/api/tracks/1/cover',
    audioUrl: '/api/tracks/1/audio?token=a',
    createdAt: '2025-04-28T14:32:00Z',
  };

  const createFixture = async (inputs: {
    tracks: readonly ITrack[];
    canPlay?: boolean;
    currentTrackId?: number | null;
    isPlaying?: boolean;
  }): Promise<ComponentFixture<UploadsTableComponent>> => {
    await TestBed.configureTestingModule({ imports: [UploadsTableComponent] }).compileComponents();

    const fixture: ComponentFixture<UploadsTableComponent> =
      TestBed.createComponent(UploadsTableComponent);
    fixture.componentRef.setInput('tracks', inputs.tracks);
    fixture.componentRef.setInput('canPlay', inputs.canPlay ?? true);
    fixture.componentRef.setInput('currentTrackId', inputs.currentTrackId ?? null);
    fixture.componentRef.setInput('isPlaying', inputs.isPlaying ?? false);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<UploadsTableComponent>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  it.each([
    [TrackStatusEnum.APPROVED, 'Published'],
    [TrackStatusEnum.PENDING_REVIEW, 'Processing'],
    [TrackStatusEnum.REJECTED, 'Rejected'],
  ])('shows the %s status as "%s"', async (status: ITrack['status'], label: string) => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [{ ...midnight, status: status }],
    });

    expect(element(fixture).querySelector('.uploads__status')?.textContent.trim()).toBe(label);
  });

  it('names known genres and keeps unknown genre codes as they are', async () => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [{ ...midnight, genres: ['AMBIENT', 'MYSTERY_WAVE'] }],
    });

    const genres: string[] = Array.from(
      element(fixture).querySelectorAll('.uploads__genre'),
      (genre: Element) => genre.textContent.trim(),
    );

    expect(genres).toEqual(['Ambient', 'MYSTERY_WAVE']);
  });

  it('plays the upload whose cover is clicked', async () => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [midnight],
    });
    const playToggled = vi.fn();
    fixture.componentInstance.playToggled.subscribe(playToggled);

    element(fixture).querySelector<HTMLButtonElement>('.uploads__cover--playable')?.click();

    expect(playToggled).toHaveBeenCalledExactlyOnceWith(midnight);
  });

  it('offers to pause the upload that is playing', async () => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [midnight],
      currentTrackId: 1,
      isPlaying: true,
    });

    const cover: HTMLElement | null = element(fixture).querySelector('.uploads__cover--playable');

    expect(cover?.getAttribute('aria-label')).toBe('Pause "Midnight Dreams"');
    expect(cover?.querySelector('.uploads__equalizer')).not.toBeNull();
  });

  it.each([
    ['radio mode is on', midnight, false],
    ['the upload has no audio link', { ...midnight, audioUrl: null }, true],
  ])('offers no playback when %s', async (_: string, track: ITrack, canPlay: boolean) => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [track],
      canPlay: canPlay,
    });

    expect(element(fixture).querySelector('.uploads__cover--playable')).toBeNull();
  });

  it('falls back to a placeholder when the cover cannot be loaded', async () => {
    const fixture: ComponentFixture<UploadsTableComponent> = await createFixture({
      tracks: [midnight],
    });

    element(fixture).querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(element(fixture).querySelector('img')).toBeNull();
    expect(element(fixture).querySelector('.uploads__image--placeholder')).not.toBeNull();
  });
});
