import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { LoaderComponent } from './loader.component';
import { LoaderService } from '../../services/loader-service/loader.service';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;
  let loaderService: LoaderService;

  const createFixture = async (platform: string = 'browser'): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
      providers: [LoaderService, { provide: PLATFORM_ID, useValue: platform }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    loaderService = TestBed.inject(LoaderService);
    await fixture.whenStable();
  };

  afterEach(() => {
    document.body.classList.remove(Constants.LOADER_BODY_CLASS);
  });

  describe('in the browser', () => {
    beforeEach(async () => {
      await createFixture();
    });

    it('renders nothing while idle', () => {
      expect(fixture.nativeElement.querySelector('.loader')).toBeNull();
      expect(document.body.classList.contains(Constants.LOADER_BODY_CLASS)).toBe(false);
    });

    it('renders the overlay with its spinner and text while loading', async () => {
      loaderService.show();
      await fixture.whenStable();

      const overlay: HTMLElement = fixture.nativeElement.querySelector('.loader');

      expect(overlay).not.toBeNull();
      expect(overlay.getAttribute('aria-busy')).toBe('true');
      expect(overlay.getAttribute('aria-label')).toBe('Loading');
      expect(overlay.querySelector('.loader__text')?.textContent).toBe('Loading...');
      expect(overlay.querySelector('app-spinner')).not.toBeNull();
    });

    it('toggles the loading class on the document body', async () => {
      loaderService.show();
      await fixture.whenStable();
      expect(document.body.classList.contains(Constants.LOADER_BODY_CLASS)).toBe(true);

      loaderService.hide();
      await fixture.whenStable();
      expect(document.body.classList.contains(Constants.LOADER_BODY_CLASS)).toBe(false);
    });

    it('blurs the focused element when loading starts', async () => {
      const input: HTMLInputElement = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      expect(document.activeElement).toBe(input);

      loaderService.show();
      await fixture.whenStable();

      expect(document.activeElement).not.toBe(input);
      input.remove();
    });

    it('swallows blocked interaction events while loading', async () => {
      loaderService.show();
      await fixture.whenStable();

      const event: KeyboardEvent = new KeyboardEvent(Constants.LOADER_BLOCKED_EVENTS[0]!, {
        bubbles: true,
        cancelable: true,
      });

      document.body.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('lets interaction events through while idle', () => {
      const event: KeyboardEvent = new KeyboardEvent(Constants.LOADER_BLOCKED_EVENTS[0]!, {
        bubbles: true,
        cancelable: true,
      });

      document.body.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it('stops blocking events after the component is destroyed', async () => {
      loaderService.show();
      await fixture.whenStable();

      fixture.destroy();

      const event: KeyboardEvent = new KeyboardEvent(Constants.LOADER_BLOCKED_EVENTS[0]!, {
        bubbles: true,
        cancelable: true,
      });

      document.body.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('on the server', () => {
    it('never touches the document body', async () => {
      await createFixture('server');

      loaderService.show();
      await fixture.whenStable();

      expect(document.body.classList.contains(Constants.LOADER_BODY_CLASS)).toBe(false);
    });
  });
});
