import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { of } from 'rxjs';
import { MainContainerComponent } from './main-container.component';
import { UserService } from '../../../features/services/user-service/user.service';
import { AvatarStateService } from '../../../features/services/avatar-state-service/avatar-state.service';
import { SettingsStateService } from '../../../features/services/settings-state-service/settings-state.service';
import { NotificationStateService } from '../../../features/services/notification-state-service/notification-state.service';

import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import type { ICurrentUser } from '../../../core/models/user.model';

describe('MainContainerComponent', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    avatarUrl: null,
  };

  let fixture: ComponentFixture<MainContainerComponent>;
  let avatarUrl: WritableSignal<string | null>;
  let loadAvatar: ReturnType<typeof vi.fn>;
  let clear: ReturnType<typeof vi.fn>;
  let loadSettings: ReturnType<typeof vi.fn>;
  let clearSettings: ReturnType<typeof vi.fn>;
  let hasUnread: WritableSignal<boolean>;
  let loadNotifications: ReturnType<typeof vi.fn>;
  let markAllAsRead: ReturnType<typeof vi.fn>;
  let clearNotifications: ReturnType<typeof vi.fn>;

  const avatarSources = (): (string | null)[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        '.header-profile-image, .sidebar__user-image',
      ),
    ).map((image: HTMLImageElement) => image.getAttribute('src'));

  beforeEach(async () => {
    TestBed.resetTestingModule();
    avatarUrl = signal<string | null>(null);
    loadAvatar = vi.fn().mockResolvedValue(undefined);
    clear = vi.fn();
    loadSettings = vi.fn().mockResolvedValue(true);
    clearSettings = vi.fn();
    hasUnread = signal<boolean>(false);
    loadNotifications = vi.fn().mockResolvedValue(undefined);
    markAllAsRead = vi.fn().mockResolvedValue(undefined);
    clearNotifications = vi.fn();

    await TestBed.configureTestingModule({
      imports: [MainContainerComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: UserService,
          useValue: {
            getCurrentUserData: vi.fn().mockReturnValue(of(currentUser)),
            currentUser: signal(currentUser).asReadonly(),
          },
        },
        {
          provide: AvatarStateService,
          useValue: { avatarUrl: avatarUrl.asReadonly(), loadAvatar: loadAvatar, clear: clear },
        },
        {
          provide: SettingsStateService,
          useValue: { loadSettings: loadSettings, clear: clearSettings },
        },
        {
          provide: NotificationStateService,
          useValue: {
            notifications: signal([]).asReadonly(),
            hasUnread: hasUnread.asReadonly(),
            loadNotifications: loadNotifications,
            markAllAsRead: markAllAsRead,
            clear: clearNotifications,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainContainerComponent);
    await fixture.whenStable();
  });

  it('loads the avatar once on init', () => {
    expect(loadAvatar).toHaveBeenCalledTimes(1);
  });

  it('shows placeholders in the header and the sidebar without an avatar', () => {
    expect(avatarSources()).toEqual([]);
  });

  it('shows the avatar in the header and the sidebar', async () => {
    avatarUrl.set('blob:avatar');
    await fixture.whenStable();

    expect(avatarSources()).toEqual(['blob:avatar', 'blob:avatar']);
  });

  it('updates both places when the avatar changes', async () => {
    avatarUrl.set('blob:avatar');
    await fixture.whenStable();

    avatarUrl.set(null);
    await fixture.whenStable();

    expect(avatarSources()).toEqual([]);
  });

  it('clears the avatar when the layout is destroyed', () => {
    fixture.destroy();

    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('loads the user settings once on init so the accent color applies everywhere', () => {
    expect(loadSettings).toHaveBeenCalledTimes(1);
  });

  it('resets the user settings when the layout is destroyed', () => {
    fixture.destroy();

    expect(clearSettings).toHaveBeenCalledTimes(1);
  });

  it('loads the notifications once on init', () => {
    expect(loadNotifications).toHaveBeenCalledOnce();
  });

  it('marks the bell in the header while notifications are unread', async () => {
    hasUnread.set(true);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.header-action-badge'),
    ).not.toBeNull();
  });

  it('reloads the notifications and marks them read when the bell is opened', async () => {
    Array.from<HTMLButtonElement>(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.header-action'),
    )
      .find((button) => button.querySelector('.bx-bell'))!
      .click();
    await fixture.whenStable();
    document.querySelector('.cdk-overlay-container')?.remove();

    expect(loadNotifications).toHaveBeenCalledTimes(2);
    expect(markAllAsRead).toHaveBeenCalledOnce();
  });

  it('forgets the notifications when the layout is destroyed', () => {
    fixture.destroy();

    expect(clearNotifications).toHaveBeenCalledOnce();
  });
});
