import { Component, DestroyRef, DOCUMENT, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import { LoaderService } from '../../services/loader-service/loader.service';
import { SpinnerComponent } from '../spinner/spinner.component';

import type { Signal } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [SpinnerComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})

export class LoaderComponent {
  private readonly loaderService: LoaderService = inject(LoaderService);

  private readonly document: Document = inject(DOCUMENT);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  public readonly isLoading: Signal<boolean> = this.loaderService.isLoading;

  public readonly spinnerSize: string = Constants.LOADER_SPINNER_SIZE;

  public readonly spinnerThickness: string = Constants.LOADER_SPINNER_THICKNESS;

  public readonly loaderText: string = Constants.LOADER_TEXT;

  public readonly loaderAriaLabel: string = Constants.SPINNER_ARIA_LABEL;

  public constructor() {
    if (!this.isBrowser) {
      return;
    };

    this.blockInteractionEvents();

    effect(() => {
      const isLoading: boolean = this.isLoading();

      this.document.body.classList.toggle(Constants.LOADER_BODY_CLASS, isLoading);

      if (isLoading) {
        this.releaseFocus();
      };
    });
  }

  private readonly interceptEvent = (event: Event): void => {
    if (!this.isLoading()) {
      return;
    };

    event.preventDefault();
    event.stopPropagation();
  };

  private blockInteractionEvents(): void {
    const options: AddEventListenerOptions = { capture: true, passive: false };

    Constants.LOADER_BLOCKED_EVENTS.forEach(eventName => {
      this.document.addEventListener(eventName, this.interceptEvent, options);
    });

    this.destroyRef.onDestroy(() => {
      Constants.LOADER_BLOCKED_EVENTS.forEach(eventName => {
        this.document.removeEventListener(eventName, this.interceptEvent, options);
      });
    });
  }

  private releaseFocus(): void {
    const activeElement: Element | null = this.document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    };
  }
}
