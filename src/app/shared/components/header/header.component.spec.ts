import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('HeaderComponent', () => {
  let activeFixture: ComponentFixture<HeaderComponent> | undefined;

  const createFixture = async (): Promise<ComponentFixture<HeaderComponent>> => {
    await TestBed.configureTestingModule({ imports: [HeaderComponent] }).compileComponents();

    activeFixture = TestBed.createComponent(HeaderComponent);

    return activeFixture;
  };

  const createMainFixture = async (): Promise<ComponentFixture<HeaderComponent>> => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();

    fixture.componentRef.setInput('isMainApplication', true);
    await fixture.whenStable();

    return fixture;
  };

  const popoverPanel = (): HTMLElement | null => document.querySelector('.popover');

  afterEach(() => {
    activeFixture?.destroy();
    activeFixture = undefined;

    document.querySelectorAll('.cdk-overlay-container').forEach(container => {
      container.remove();
    });
  });

  it('renders the brand title', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.header-title').textContent).toBe('RADIOFIND');
  });

  it('renders the logo from the assets folder', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();
    await fixture.whenStable();

    const logo: HTMLImageElement = fixture.nativeElement.querySelector('.header-logo');

    expect(logo.getAttribute('src')).toBe('/assets/images/audiowave.png');
    expect(logo.alt).toBe('Logo');
  });

  it('renders the search and the actions only for the main application', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.header-main')).toBeNull();

    fixture.componentRef.setInput('isMainApplication', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.header-search-input')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-popover').length).toBe(3);
  });

  it('clears the search value with the clear action', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createMainFixture();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.header-search-input');

    input.value = 'daft punk';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.searchValue()).toBe('daft punk');

    fixture.nativeElement.querySelector('.header-search-clear').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.searchValue()).toBe(Constants.EMPTY_STRING);
    expect(fixture.nativeElement.querySelector('.header-search-clear')).toBeNull();
  });

  it('opens the messages popover with its empty state', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createMainFixture();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      `[aria-label="Messages"]`,
    );

    trigger.click();
    await fixture.whenStable();

    expect(popoverPanel()?.querySelector('.popover__title')?.textContent).toBe('Messages');
    expect(popoverPanel()?.querySelector('.empty__title')?.textContent).toBe('No messages yet');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the notifications popover with its empty state', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createMainFixture();

    fixture.nativeElement
      .querySelector(`[aria-label="Notifications"]`)
      .click();
    await fixture.whenStable();

    expect(popoverPanel()?.querySelector('.popover__title')?.textContent).toBe('Notifications');
    expect(popoverPanel()?.querySelector('.empty__title')?.textContent).toBe('You are all caught up');
  });
});
