import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TracksTableComponent } from './tracks-table.component';
import { MY_UPLOADS_TABLE_CONFIG } from '../../../constants/my-uploads.constant';
import { TrackStatusEnum } from '../../../../core/enums/track-status.enum';
import { OwnTracksSortEnum } from '../../../../core/enums/own-tracks-sort.enum';
import { SortDirectionEnum } from '../../../../core/enums/sort-direction.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITrack } from '../../../../core/models/track.model';
import type { ITracksTableConfig } from '../../../models/tracks-table.model';

describe('TracksTableComponent', () => {
  const midnight: ITrack = {
    id: 1,
    title: 'Midnight Dreams',
    artistName: 'Neon Lights',
    genres: ['AMBIENT'],
    description: null,
    status: TrackStatusEnum.PENDING_REVIEW,
    audioFormat: 'MP3',
    audioSizeBytes: 1024,
    durationSeconds: 214,
    coverUrl: '/api/tracks/1/cover',
    audioUrl: '/api/tracks/1/audio?token=a',
    playsCount: 0,
    likesCount: 0,
    liked: false,
    own: true,
    likedAt: null,
    createdAt: '2025-04-28T14:32:00Z',
  };

  const createFixture = async (inputs: {
    tracks: readonly ITrack[];
    config?: ITracksTableConfig<OwnTracksSortEnum>;
    canPlay?: boolean;
    currentTrackId?: number | null;
    isPlaying?: boolean;
    activeSort?: OwnTracksSortEnum;
    direction?: SortDirectionEnum;
  }): Promise<ComponentFixture<TracksTableComponent<OwnTracksSortEnum>>> => {
    await TestBed.configureTestingModule({ imports: [TracksTableComponent] }).compileComponents();

    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> =
      TestBed.createComponent<TracksTableComponent<OwnTracksSortEnum>>(TracksTableComponent);
    fixture.componentRef.setInput('tracks', inputs.tracks);
    fixture.componentRef.setInput('config', inputs.config ?? MY_UPLOADS_TABLE_CONFIG);
    fixture.componentRef.setInput('canPlay', inputs.canPlay ?? true);
    fixture.componentRef.setInput('currentTrackId', inputs.currentTrackId ?? null);
    fixture.componentRef.setInput('isPlaying', inputs.isPlaying ?? false);
    fixture.componentRef.setInput('activeSort', inputs.activeSort ?? OwnTracksSortEnum.UPLOADED);
    fixture.componentRef.setInput('direction', inputs.direction ?? SortDirectionEnum.DESC);
    await fixture.whenStable();

    return fixture;
  };

  const element = (
    fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>>,
  ): HTMLElement => fixture.nativeElement as HTMLElement;

  it.each([
    [TrackStatusEnum.APPROVED, 'Published'],
    [TrackStatusEnum.PENDING_REVIEW, 'Processing'],
    [TrackStatusEnum.REJECTED, 'Rejected'],
  ])('shows the %s status as "%s"', async (status: ITrack['status'], label: string) => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [{ ...midnight, status: status }],
    });

    expect(element(fixture).querySelector('.tracks-table__status')?.textContent.trim()).toBe(label);
  });

  it('names known genres and keeps unknown genre codes as they are', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [{ ...midnight, genres: ['AMBIENT', 'MYSTERY_WAVE'] }],
    });

    const genres: string[] = Array.from(
      element(fixture).querySelectorAll('.tracks-table__genre'),
      (genre: Element) => genre.textContent.trim(),
    );

    expect(genres).toEqual(['Ambient', 'MYSTERY_WAVE']);
  });

  it('plays the upload whose cover is clicked', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
    });
    const playToggled = vi.fn();
    fixture.componentInstance.playToggled.subscribe(playToggled);

    element(fixture).querySelector<HTMLButtonElement>('.tracks-table__cover--playable')?.click();

    expect(playToggled).toHaveBeenCalledExactlyOnceWith(midnight);
  });

  it('offers to pause the upload that is playing', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
      currentTrackId: 1,
      isPlaying: true,
    });

    const cover: HTMLElement | null = element(fixture).querySelector(
      '.tracks-table__cover--playable',
    );

    expect(cover?.getAttribute('aria-label')).toBe('Pause "Midnight Dreams"');
    expect(cover?.querySelector('.tracks-table__equalizer')).not.toBeNull();
  });

  it.each([
    ['radio mode is on', midnight, false],
    ['the upload has no audio link', { ...midnight, audioUrl: null }, true],
  ])('offers no playback when %s', async (_: string, track: ITrack, canPlay: boolean) => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [track],
      canPlay: canPlay,
    });

    expect(element(fixture).querySelector('.tracks-table__cover--playable')).toBeNull();
  });

  it('falls back to a placeholder when the cover cannot be loaded', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
    });

    element(fixture).querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(element(fixture).querySelector('img')).toBeNull();
    expect(element(fixture).querySelector('.tracks-table__image--placeholder')).not.toBeNull();
  });
  it('shows duration, plays and likes of an upload', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [{ ...midnight, durationSeconds: 214, playsCount: 1234, likesCount: 7, liked: true }],
    });

    const numbers: string[] = Array.from(
      element(fixture).querySelectorAll('.tracks-table__cell--number'),
      (cell: Element) => cell.textContent.trim(),
    );

    expect(numbers).toEqual(['3:34', '1.2K', '7']);
    expect(element(fixture).querySelector('.tracks-table__likes--liked')).not.toBeNull();
  });

  it('shows a dash for an upload whose duration is unknown', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [{ ...midnight, durationSeconds: null }],
    });

    expect(
      element(fixture).querySelector('.tracks-table__cell--duration')?.textContent.trim(),
    ).toBe('—');
  });

  it('asks to sort by the clicked column', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
    });
    const sortSelected = vi.fn();
    fixture.componentInstance.sortSelected.subscribe(sortSelected);

    element(fixture).querySelector<HTMLButtonElement>('button[title="Sort by Plays"]')?.click();

    expect(sortSelected).toHaveBeenCalledExactlyOnceWith(OwnTracksSortEnum.PLAYS);
  });

  it('marks only the sorted column with its direction', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
      activeSort: OwnTracksSortEnum.TITLE,
      direction: SortDirectionEnum.ASC,
    });

    const sorted: string[] = Array.from(
      element(fixture).querySelectorAll('th[aria-sort]:not([aria-sort="none"])'),
      (header: Element) => `${header.textContent.trim()} ${header.getAttribute('aria-sort') ?? ''}`,
    );

    expect(sorted).toEqual(['Track / Artist ascending']);
  });

  it('leaves the status column out when the table has no statuses', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
      config: { ...MY_UPLOADS_TABLE_CONFIG, hasStatus: false },
    });

    expect(element(fixture).querySelector('.tracks-table__status')).toBeNull();
    expect(element(fixture).querySelector('.tracks-table__head--status')).toBeNull();
  });

  it('shows a dash when the track has no date for the date column', async () => {
    const fixture: ComponentFixture<TracksTableComponent<OwnTracksSortEnum>> = await createFixture({
      tracks: [midnight],
      config: { ...MY_UPLOADS_TABLE_CONFIG, dateOf: () => null },
    });

    expect(element(fixture).querySelector('.tracks-table__cell--date')?.textContent.trim()).toBe(
      '—',
    );
  });
});
