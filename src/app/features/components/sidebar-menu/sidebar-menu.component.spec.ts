import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, of, tap } from 'rxjs';
import { SidebarMenuComponent } from './sidebar-menu.component';
import { UserService } from '../../services/user-service/user.service';
import {
  MOBILE_SIDEBAR_MENU_ITEMS,
  SIDEBAR_MENU_ITEMS,
} from '../../../features/constants/sidebar-menu.constant';
import { Constants } from '../../../core/constants/constants';
import { Links } from '../../../core/constants/links';

import { translate } from '../../../../test-translate';
import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import type { Routes } from '@angular/router';
import type { ICurrentUser } from '../../../core/models/user.model';

describe('SidebarMenuComponent', () => {
  const routes: Routes = SIDEBAR_MENU_ITEMS.map((item) => ({ path: item.link, children: [] }));

  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
    avatarUrl: null,
  };

  let getCurrentUserData: ReturnType<typeof vi.fn>;

  let currentUserState: WritableSignal<ICurrentUser | null>;

  const serve = (user$: Observable<ICurrentUser>): Observable<ICurrentUser> =>
    user$.pipe(tap((user: ICurrentUser) => currentUserState.set(user)));

  let isMobile: boolean;

  const createFixture = async (): Promise<ComponentFixture<SidebarMenuComponent>> => {
    await TestBed.configureTestingModule({
      imports: [SidebarMenuComponent],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        {
          provide: UserService,
          useValue: {
            getCurrentUserData: getCurrentUserData,
            currentUser: currentUserState.asReadonly(),
          },
        },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: isMobile, breakpoints: {} }) },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<SidebarMenuComponent> =
      TestBed.createComponent(SidebarMenuComponent);
    await fixture.whenStable();

    return fixture;
  };

  const items = (fixture: ComponentFixture<SidebarMenuComponent>): HTMLAnchorElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.sidebar__item'));

  const navigateTo = async (
    fixture: ComponentFixture<SidebarMenuComponent>,
    url: string,
  ): Promise<void> => {
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    currentUserState = signal<ICurrentUser | null>(null);
    getCurrentUserData = vi.fn().mockReturnValue(serve(of(currentUser)));
    isMobile = false;
  });

  it('renders every menu item', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(items(fixture).map((item) => item.textContent.trim())).toEqual(
      SIDEBAR_MENU_ITEMS.map((item) => translate(item.label)),
    );
  });

  it('swaps Media Library and My Uploads on mobile', async () => {
    isMobile = true;

    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(items(fixture).map((item) => item.textContent.trim())).toEqual([
      'My Uploads',
      'Upload Track',
      'Media Library',
      'Statistics',
      'Support',
    ]);
    expect(items(fixture).map((item) => item.getAttribute('href'))).toEqual(
      MOBILE_SIDEBAR_MENU_ITEMS.map((item) => `/${item.link}`),
    );
  });

  it('points every item at its route', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(items(fixture).map((item) => item.getAttribute('href'))).toEqual(
      SIDEBAR_MENU_ITEMS.map((item) => `/${item.link}`),
    );
  });

  it('marks nothing as active before navigating', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(items(fixture).some((item) => item.classList.contains('sidebar__item--active'))).toBe(
      false,
    );
  });

  it('follows the current url with the active state', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    await navigateTo(fixture, `/${SIDEBAR_MENU_ITEMS[0]!.link}`);

    expect(items(fixture)[0]!.classList.contains('sidebar__item--active')).toBe(true);
    expect(items(fixture)[0]!.getAttribute('aria-current')).toBe('page');

    await navigateTo(fixture, `/${SIDEBAR_MENU_ITEMS[3]!.link}`);

    expect(items(fixture)[0]!.classList.contains('sidebar__item--active')).toBe(false);
    expect(items(fixture)[0]!.getAttribute('aria-current')).toBeNull();
    expect(items(fixture)[3]!.classList.contains('sidebar__item--active')).toBe(true);
    expect(items(fixture)[3]!.getAttribute('aria-current')).toBe('page');
  });

  it('toggles the collapsed state with the chevron', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    const sidebar: HTMLElement = fixture.nativeElement.querySelector('.sidebar');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.sidebar__toggle');

    expect(sidebar.classList.contains('sidebar--collapsed')).toBe(false);
    expect(toggle.getAttribute('aria-label')).toBe(
      translate(Constants.SIDEBAR_COLLAPSE_ARIA_LABEL),
    );
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.isCollapsed()).toBe(true);
    expect(sidebar.classList.contains('sidebar--collapsed')).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe(translate(Constants.SIDEBAR_EXPAND_ARIA_LABEL));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.isCollapsed()).toBe(false);
    expect(sidebar.classList.contains('sidebar--collapsed')).toBe(false);
  });

  it('renders the user card and its online status', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('.sidebar__user-status')).toBeNull();

    fixture.componentRef.setInput('isUserOnline', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.sidebar__user-status')).not.toBeNull();
  });

  it('asks the user service for the signed-in user once on init', async () => {
    await createFixture();

    expect(getCurrentUserData).toHaveBeenCalledTimes(1);
  });

  it('shows the full name and the email of the signed-in user', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(fixture.componentInstance.userName()).toBe('Ada Lovelace');
    expect(fixture.componentInstance.userEmail()).toBe(currentUser.email);
    expect(fixture.nativeElement.querySelector('.sidebar__user-name').textContent).toBe(
      'Ada Lovelace',
    );
    expect(fixture.nativeElement.querySelector('.sidebar__user-email').textContent).toBe(
      currentUser.email,
    );
  });

  it('leaves the user card empty until the request resolves', async () => {
    let resolveUser: (user: ICurrentUser) => void = () => undefined;

    getCurrentUserData = vi.fn().mockReturnValue(
      serve(
        new Observable<ICurrentUser>((subscriber) => {
          resolveUser = (user: ICurrentUser): void => {
            subscriber.next(user);
            subscriber.complete();
          };
        }),
      ),
    );

    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(fixture.componentInstance.userName()).toBe(Constants.EMPTY_STRING);
    expect(fixture.componentInstance.userEmail()).toBe(Constants.EMPTY_STRING);

    resolveUser(currentUser);
    await fixture.whenStable();

    expect(fixture.componentInstance.userName()).toBe('Ada Lovelace');
  });

  it('follows changes of the current user without reloading', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    currentUserState.set({ ...currentUser, name: 'Grace', surname: 'Hopper' });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.sidebar__user-name').textContent).toBe(
      'Grace Hopper',
    );
  });

  it('navigates to the account settings on profile', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance.onProfile();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([Links.SETTINGS_URL, Links.ACCOUNT_SETTINGS_PATH]);
  });

  it('navigates to the account settings from the rendered user card', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.sidebar__user').click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([Links.SETTINGS_URL, Links.ACCOUNT_SETTINGS_PATH]);
  });
});
