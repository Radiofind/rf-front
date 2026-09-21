import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SidebarMenuComponent } from './sidebar-menu.component';
import { SidebarMenuItemEnum } from '../../../core/enums/sidebar-menu-item.enum';
import { SIDEBAR_MENU_ITEMS } from '../../../features/constants/sidebar-menu.constant';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('SidebarMenuComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<SidebarMenuComponent>> => {
    await TestBed.configureTestingModule({ imports: [SidebarMenuComponent] }).compileComponents();

    const fixture: ComponentFixture<SidebarMenuComponent> =
      TestBed.createComponent(SidebarMenuComponent);
    await fixture.whenStable();

    return fixture;
  };

  const items = (fixture: ComponentFixture<SidebarMenuComponent>): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.sidebar__item'));

  it('renders every menu item', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(items(fixture).map(item => item.textContent.trim())).toEqual(
      SIDEBAR_MENU_ITEMS.map(item => item.label),
    );
  });

  it('marks the media library as the active item by default', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    const activeItem: HTMLButtonElement = items(fixture)[0]!;

    expect(activeItem.classList.contains('sidebar__item--active')).toBe(true);
    expect(activeItem.getAttribute('aria-current')).toBe(Constants.PAGE_ARIA_CURRENT);
  });

  it('moves the active state to the clicked item', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    items(fixture)[1]!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.activeItemId()).toBe(SidebarMenuItemEnum.UPLOAD_TRACK);
    expect(items(fixture)[1]!.classList.contains('sidebar__item--active')).toBe(true);
    expect(items(fixture)[0]!.classList.contains('sidebar__item--active')).toBe(false);
  });

  it('renders the user card and its online status', async () => {
    const fixture: ComponentFixture<SidebarMenuComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('.sidebar__user-name').textContent).toBe(
      Constants.SIDEBAR_USER_NAME,
    );
    expect(fixture.nativeElement.querySelector('.sidebar__user-email').textContent).toBe(
      Constants.SIDEBAR_USER_EMAIL,
    );
    expect(fixture.nativeElement.querySelector('.sidebar__user-status')).toBeNull();

    fixture.componentRef.setInput('isUserOnline', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.sidebar__user-status')).not.toBeNull();
  });
});
