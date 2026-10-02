import {
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { Constants } from '../../../core/constants/constants';
import { PopoverPositionEnum } from '../../../core/enums/popover-position.enum';
import { PopoverContentDirective } from '../../directives/popover-content/popover-content.directive';

import type { InputSignal, OutputEmitterRef, Signal, WritableSignal } from '@angular/core';
import type {
  ConnectedPosition,
  HorizontalConnectionPos,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import type { PopoverPosition } from '../../../core/types/popover-position.type';

@Component({
  selector: 'app-popover',
  exportAs: 'appPopover',
  imports: [CdkConnectedOverlay, NgTemplateOutlet],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  host: {
    class: 'popover-origin',
    '(click)': 'onToggle()',
  },
})
export class PopoverComponent {
  public readonly hostElement: ElementRef<HTMLElement> =
    inject<ElementRef<HTMLElement>>(ElementRef);

  public readonly popoverTitle: InputSignal<string | null> = input<string | null>(null);

  public readonly popoverActionText: InputSignal<string | null> = input<string | null>(null);

  public readonly popoverPosition: InputSignal<PopoverPosition> = input<PopoverPosition>(
    PopoverPositionEnum.BOTTOM_END,
  );

  public readonly panelWidth: InputSignal<string> = input<string>(Constants.POPOVER_DEFAULT_WIDTH);

  public readonly overlayWidth: Signal<string> = computed(
    () => `
      ${Constants.MIN_SCSS_FUNCTION_OPENS}${this.panelWidth()}${Constants.COMMA} ${Constants.POPOVER_MAX_WIDTH}${Constants.CLOSING_BRACKET}
    `,
  );

  public readonly panelClass: InputSignal<string> = input<string>(Constants.EMPTY_STRING);

  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  public readonly opened: OutputEmitterRef<void> = output();

  public readonly closed: OutputEmitterRef<void> = output();

  public readonly actionClick: OutputEmitterRef<void> = output();

  public readonly content: Signal<PopoverContentDirective | undefined> =
    contentChild(PopoverContentDirective);

  private readonly isOpenState: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isOpen: Signal<boolean> = this.isOpenState.asReadonly();

  private readonly startAlignment: WritableSignal<HorizontalConnectionPos> = signal(Constants.START_HORIZONTAL_ALIGNMENT);

  private readonly centerAlignment: WritableSignal<HorizontalConnectionPos> = signal(Constants.CENTER_HORIZONTAL_ALIGNMENT);

  private readonly endAlignment: WritableSignal<HorizontalConnectionPos> = signal(Constants.END_HORIZONTAL_ALIGNMENT);

  private readonly topSide: WritableSignal<VerticalConnectionPos> = signal(Constants.TOP_VERTICAL_ALIGNMENT);

  private readonly bottomSide: WritableSignal<VerticalConnectionPos> = signal(Constants.BOTTOM_VERTICAL_ALIGNMENT);

  private readonly positionsMap: Readonly<Record<PopoverPosition, ConnectedPosition[]>> = {
    [PopoverPositionEnum.BOTTOM_START]: this.buildPositions(this.startAlignment(), false),
    [PopoverPositionEnum.BOTTOM_CENTER]: this.buildPositions(this.centerAlignment(), false),
    [PopoverPositionEnum.BOTTOM_END]: this.buildPositions(this.endAlignment(), false),
    [PopoverPositionEnum.TOP_START]: this.buildPositions(this.startAlignment(), true),
    [PopoverPositionEnum.TOP_CENTER]: this.buildPositions(this.centerAlignment(), true),
    [PopoverPositionEnum.TOP_END]: this.buildPositions(this.endAlignment(), true),
  };

  public readonly positions: Signal<ConnectedPosition[]> = computed(
    (): ConnectedPosition[] => this.positionsMap[this.popoverPosition()],
  );

  public onToggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }

    this.open();
  }

  public open(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }

    this.isOpenState.set(true);
    this.opened.emit();
  }

  public close(): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpenState.set(false);
    this.closed.emit();
  }

  public onAction(): void {
    this.actionClick.emit();
  }

  private buildPositions(
    alignment: HorizontalConnectionPos,
    isAbove: boolean,
  ): ConnectedPosition[] {
    const below: ConnectedPosition = {
      originX: alignment,
      originY: this.bottomSide(),
      overlayX: alignment,
      overlayY: this.topSide(),
      offsetY: Constants.POPOVER_OFFSET,
    };

    const above: ConnectedPosition = {
      originX: alignment,
      originY: this.topSide(),
      overlayX: alignment,
      overlayY: this.bottomSide(),
      offsetY: -Constants.POPOVER_OFFSET,
    };

    return isAbove ? [above, below] : [below, above];
  }
}
