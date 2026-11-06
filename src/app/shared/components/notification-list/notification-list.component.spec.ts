import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { INotification } from '../../../core/models/notification.model';

describe('NotificationListComponent', () => {
  const submittedTrack: INotification = {
    id: 5,
    type: 'TRACK_SUBMITTED_FOR_REVIEW',
    read: false,
    createdAt: '2026-11-05T11:58:00Z',
    track: {
      id: 42,
      title: 'Midnight Dreams',
      artistName: 'The Engines',
      coverUrl: '/api/tracks/42/cover',
      status: 'PENDING_REVIEW',
    },
  };

  const renderItem = async (notification: INotification): Promise<HTMLElement> => {
    await TestBed.configureTestingModule({
      imports: [NotificationListComponent],
    }).compileComponents();

    const fixture: ComponentFixture<NotificationListComponent> =
      TestBed.createComponent(NotificationListComponent);
    fixture.componentRef.setInput('notifications', [notification]);
    await fixture.whenStable();

    return (fixture.nativeElement as HTMLElement).querySelector('.notification-list__item')!;
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the translated message, the cover and the time of a notification', async () => {
    const item: HTMLElement = await renderItem(submittedTrack);

    expect(item.querySelector('.notification-list__text')!.textContent.trim()).toBe(
      'Your track "Midnight Dreams" was uploaded and sent for quality review',
    );
    expect(item.querySelector('img')!.getAttribute('src')).toBe('/api/tracks/42/cover');
    expect(item.querySelector('.notification-list__time')!.textContent.trim()).toBe(
      '2 minutes ago',
    );
  });

  it('highlights an unread notification', async () => {
    const item: HTMLElement = await renderItem(submittedTrack);

    expect(item.classList).toContain('notification-list__item--unread');
    expect(item.querySelector('.notification-list__dot')).not.toBeNull();
  });

  it('does not highlight a notification that was already read', async () => {
    const item: HTMLElement = await renderItem({ ...submittedTrack, read: true });

    expect(item.classList).not.toContain('notification-list__item--unread');
    expect(item.querySelector('.notification-list__dot')).toBeNull();
  });

  it('shows a placeholder for a track without cover art', async () => {
    const item: HTMLElement = await renderItem({
      ...submittedTrack,
      track: { ...submittedTrack.track!, coverUrl: null },
    });

    expect(item.querySelector('img')).toBeNull();
    expect(item.querySelector('.notification-list__thumb--icon')).not.toBeNull();
  });

  it('falls back to the placeholder when the cover cannot be loaded', async () => {
    const item: HTMLElement = await renderItem(submittedTrack);

    item.querySelector('img')!.dispatchEvent(new Event('error'));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(item.querySelector('img')).toBeNull();
    expect(item.querySelector('.notification-list__thumb--icon')).not.toBeNull();
  });
});
