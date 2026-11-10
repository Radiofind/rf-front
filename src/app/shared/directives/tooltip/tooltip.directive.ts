import {
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  PLATFORM_ID,
  Renderer2,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Constants } from '../../../core/constants/constants';
import { TooltipPlacementEnum } from '../../../core/enums/tooltip-placement.enum';
import { TooltipComponent } from '../../components/tooltip/tooltip.component';

import type { ComponentRef, InputSignal, Signal } from '@angular/core';
import type {
  ConnectedOverlayPositionChange,
  FlexibleConnectedPositionStrategy,
  OverlayRef,
} from '@angular/cdk/overlay';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '[attr.aria-describedby]': 'describedBy()',
  },
})
export class TooltipDirective {
  public readonly text: InputSignal<string | null> = input<string | null>(null, {
    alias: 'appTooltip',
  });

  private readonly host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly injector: Injector = inject(Injector);

  private readonly document: Document = inject(DOCUMENT);

  private readonly renderer: Renderer2 = inject(Renderer2);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly descriptionId: string = inject(_IdGenerator).getId(Constants.TOOLTIP_ID_PREFIX);

  private description: HTMLElement | null = null;

  private overlayRef: OverlayRef | null = null;

  private tooltipRef: ComponentRef<TooltipComponent> | null = null;

  protected readonly describedBy: Signal<string | null> = computed<string | null>(() =>
    this.isBrowser && this.text() ? this.descriptionId : null,
  );

  constructor() {
    effect(() => {
      const text: string | null = this.text();

      this.syncDescription(text);

      if (!text) {
        this.hide();
      } else {
        this.tooltipRef?.setInput('text', text);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.overlayRef?.dispose();
      this.description?.remove();
    });
  }

  public show(): void {
    const text: string | null = this.text();

    if (!text || !this.isBrowser) {
      return;
    }

    this.overlayRef ??= this.createOverlay();

    if (!this.overlayRef.hasAttached()) {
      this.tooltipRef = this.overlayRef.attach(new ComponentPortal(TooltipComponent));
    }

    this.tooltipRef?.setInput('text', text);
    this.tooltipRef?.changeDetectorRef.detectChanges();
    this.overlayRef.updatePosition();
  }

  public hide(): void {
    this.overlayRef?.detach();
    this.tooltipRef = null;
  }

  private createOverlay(): OverlayRef {
    const strategy: FlexibleConnectedPositionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      this.host,
    )
      .withPositions([...Constants.TOOLTIP_POSITIONS])
      .withPush(true)
      .withFlexibleDimensions(false)
      .withViewportMargin(Constants.TOOLTIP_VIEWPORT_MARGIN);

    strategy.positionChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((change: ConnectedOverlayPositionChange) => this.placeArrow(change));

    return createOverlayRef(this.injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.injector),
      panelClass: Constants.TOOLTIP_PANE_CLASS,
    });
  }

  private placeArrow(change: ConnectedOverlayPositionChange): void {
    const pane: HTMLElement | undefined = this.overlayRef?.overlayElement;

    if (!this.tooltipRef || !pane) {
      return;
    }

    const hostRect: DOMRect = this.host.nativeElement.getBoundingClientRect();
    const paneRect: DOMRect = pane.getBoundingClientRect();

    this.tooltipRef.setInput(
      'placement',
      change.connectionPair.originY === Constants.TOP_VERTICAL_ALIGNMENT
        ? TooltipPlacementEnum.ABOVE
        : TooltipPlacementEnum.BELOW,
    );
    this.tooltipRef.setInput(
      'arrowOffset',
      hostRect.left + hostRect.width / Constants.TWO - paneRect.left,
    );
  }

  private syncDescription(text: string | null): void {
    if (!this.isBrowser) {
      return;
    }

    if (!text) {
      this.description?.remove();
      this.description = null;
      return;
    }

    if (!this.description) {
      this.description = this.renderer.createElement('div') as HTMLElement;
      this.renderer.setAttribute(this.description, 'id', this.descriptionId);
      this.renderer.addClass(this.description, Constants.VISUALLY_HIDDEN_CLASS);
      this.renderer.appendChild(this.document.body, this.description);
    }

    this.description.textContent = text;
  }
}
