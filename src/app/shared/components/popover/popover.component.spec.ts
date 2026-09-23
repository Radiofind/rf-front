import { afterEach, describe, expect, it } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PopoverComponent } from './popover.component';
import { PopoverContentDirective } from '../../directives/popover-content.directive';
import { PopoverPositionEnum } from '../../../core/enums/popover-position.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { WritableSignal } from '@angular/core';
import type { PopoverPosition } from '../../../core/types/popover-position.type';

@Component({
  selector: 'app-popover-host-stub',
  imports: [PopoverComponent, PopoverContentDirective],
  template: `
    <app-popover
      #popover="appPopover"
      [popoverTitle]="popoverTitle()"
      [popoverActionText]="popoverActionText()"
      [popoverPosition]="popoverPosition()"
      [disabled]="disabled()"
      (opened)="openedCount = openedCount + 1"
      (closed)="closedCount = closedCount + 1"
      (actionClick)="actionCount = actionCount + 1"
    >
      <button class="trigger" type="button" [attr.aria-expanded]="popover.isOpen()">open</button>

      <ng-template appPopoverContent>
        <p class="stub">content</p>
      </ng-template>
    </app-popover>
  `,
})
class PopoverHostStubComponent {
  public readonly popoverTitle: WritableSignal<string | null> = signal<string | null>('Messages');

  public readonly popoverActionText: WritableSignal<string | null> = signal<string | null>(null);

  public readonly popoverPosition: WritableSignal<PopoverPosition> = signal<PopoverPosition>(
    PopoverPositionEnum.BOTTOM_END,
  );

  public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);

  public openedCount: number = 0;

  public closedCount: number = 0;

  public actionCount: number = 0;
}

describe('PopoverComponent', () => {
  let activeFixture: ComponentFixture<PopoverHostStubComponent> | undefined;

  const createFixture = async (): Promise<ComponentFixture<PopoverHostStubComponent>> => {
    await TestBed.configureTestingModule({
      imports: [PopoverHostStubComponent],
    }).compileComponents();

    const fixture: ComponentFixture<PopoverHostStubComponent> =
      TestBed.createComponent(PopoverHostStubComponent);
    await fixture.whenStable();

    activeFixture = fixture;

    return fixture;
  };

  afterEach(() => {
    activeFixture?.destroy();
    activeFixture = undefined;

    document.querySelectorAll('.cdk-overlay-container').forEach((container) => {
      container.remove();
    });
  });

  const clickTrigger = async (
    fixture: ComponentFixture<PopoverHostStubComponent>,
  ): Promise<void> => {
    fixture.nativeElement.querySelector('.trigger').click();
    await fixture.whenStable();
  };

  const panel = (): HTMLElement | null => document.querySelector('.popover');

  it('keeps the panel closed until the trigger is clicked', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    expect(panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.trigger').getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('projects the content template into the panel', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    await clickTrigger(fixture);

    expect(panel()?.querySelector('.stub')?.textContent).toBe('content');
    expect(panel()?.querySelector('.popover__title')?.textContent).toBe('Messages');
    expect(fixture.nativeElement.querySelector('.trigger').getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(fixture.componentInstance.openedCount).toBe(1);
  });

  it('toggles the panel with repeated trigger clicks', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    await clickTrigger(fixture);
    await clickTrigger(fixture);

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('does not open while disabled', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    await clickTrigger(fixture);

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.openedCount).toBe(0);
  });

  it('renders the action only when its text is provided and emits on click', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    await clickTrigger(fixture);

    expect(panel()?.querySelector('.popover__action')).toBeNull();

    fixture.componentInstance.popoverActionText.set('Mark all as read');
    await fixture.whenStable();

    const action: HTMLButtonElement | null | undefined = panel()?.querySelector('.popover__action');

    expect(action?.textContent.trim()).toBe('Mark all as read');

    action?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.actionCount).toBe(1);
  });

  it('flips the primary position when the popover opens above the trigger', async () => {
    const fixture: ComponentFixture<PopoverHostStubComponent> = await createFixture();

    const component: PopoverComponent = fixture.debugElement.children[0]!.componentInstance;

    expect(component.positions()[0]?.originY).toBe('bottom');
    expect(component.positions()[0]?.overlayX).toBe('end');

    fixture.componentInstance.popoverPosition.set(PopoverPositionEnum.TOP_START);
    await fixture.whenStable();

    expect(component.positions()[0]?.originY).toBe('top');
    expect(component.positions()[0]?.overlayX).toBe('start');
  });
});
