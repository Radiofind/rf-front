import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { of } from 'rxjs';
import { MainContainerComponent } from './main-container.component';
import { UserService } from '../../../features/services/user-service/user.service';
import { AvatarStateService } from '../../../features/services/avatar-state-service/avatar-state.service';

import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import type { ICurrentUser } from '../../../core/models/user.model';

describe('MainContainerComponent', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
  };

  let fixture: ComponentFixture<MainContainerComponent>;
  let avatarUrl: WritableSignal<string | null>;
  let loadAvatar: ReturnType<typeof vi.fn>;
  let clear: ReturnType<typeof vi.fn>;

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

    await TestBed.configureTestingModule({
      imports: [MainContainerComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: UserService,
          useValue: { getCurrentUserData: vi.fn().mockReturnValue(of(currentUser)) },
        },
        {
          provide: AvatarStateService,
          useValue: { avatarUrl: avatarUrl.asReadonly(), loadAvatar: loadAvatar, clear: clear },
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
});
