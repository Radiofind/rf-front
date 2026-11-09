import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MainContainerComponent } from './main-container.component';
import { MainLayoutActions } from '../../../store/ui/main-layout.actions';
import { avatarFeature } from '../../../store/avatar/avatar.feature';
import { notificationsFeature } from '../../../store/notifications/notifications.feature';
import { userFeature } from '../../../store/user/user.feature';
import { initialPlayerState } from '../../../store/player/player.feature';
import { initialSettingsState } from '../../../store/settings/settings.feature';

import type { ComponentFixture } from '@angular/core/testing';

describe('MainContainerComponent', () => {
  let fixture: ComponentFixture<MainContainerComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;

  const avatarSources = (): (string | null)[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>(
        '.header-profile-image, .sidebar__user-image',
      ),
    ).map((image: HTMLImageElement) => image.getAttribute('src'));

  afterEach(() => {
    TestBed.inject(MockStore).resetSelectors();
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [MainContainerComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        provideMockStore({
          initialState: { player: initialPlayerState, settings: initialSettingsState },
          selectors: [
            { selector: avatarFeature.selectUrl, value: null },
            { selector: notificationsFeature.selectNotifications, value: [] },
            { selector: notificationsFeature.selectHasUnread, value: false },
            { selector: userFeature.selectFullName, value: 'Ada Lovelace' },
            { selector: userFeature.selectEmail, value: 'ada@example.com' },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatch = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(MainContainerComponent);
    await fixture.whenStable();
  });

  it('reports the layout as opened on init', () => {
    expect(dispatch).toHaveBeenCalledExactlyOnceWith(MainLayoutActions.opened());
  });

  it('reports the layout as closed when it is destroyed', () => {
    fixture.destroy();

    expect(dispatch).toHaveBeenLastCalledWith(MainLayoutActions.closed());
  });

  it('shows placeholders in the header and the sidebar without an avatar', () => {
    expect(avatarSources()).toEqual([]);
  });

  it('shows the avatar in the header and the sidebar', async () => {
    store.overrideSelector(avatarFeature.selectUrl, 'blob:avatar');
    store.refreshState();
    await fixture.whenStable();

    expect(avatarSources()).toEqual(['blob:avatar', 'blob:avatar']);
  });

  it('shows the audio player below the page content', () => {
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.main__column app-audio-player'),
    ).not.toBeNull();
  });

  it('marks the bell in the header while notifications are unread', async () => {
    store.overrideSelector(notificationsFeature.selectHasUnread, true);
    store.refreshState();
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.header-action-badge'),
    ).not.toBeNull();
  });

  it('reports the opened notifications when the bell is clicked', async () => {
    Array.from<HTMLButtonElement>(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.header-action'),
    )
      .find((button) => button.querySelector('.bx-bell'))!
      .click();
    await fixture.whenStable();
    document.querySelector('.cdk-overlay-container')?.remove();

    expect(dispatch).toHaveBeenLastCalledWith(MainLayoutActions.notificationsOpened());
  });
});
