import { afterEach, describe, expect, it } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';

import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

@Component({
  imports: [TooltipDirective],
  template: `<button type="button" [appTooltip]="hint()">Like</button>`,
})
class TooltipHostComponent {
  public readonly hint: WritableSignal<string | null> = signal<string | null>('Not yet');
}

describe('TooltipDirective', () => {
  const createFixture = async (): Promise<ComponentFixture<TooltipHostComponent>> => {
    await TestBed.configureTestingModule({ imports: [TooltipHostComponent] }).compileComponents();
    const fixture: ComponentFixture<TooltipHostComponent> =
      TestBed.createComponent(TooltipHostComponent);
    await fixture.whenStable();
    return fixture;
  };

  const host = (fixture: ComponentFixture<TooltipHostComponent>): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!;

  const tooltip = (): HTMLElement | null => document.querySelector('[role="tooltip"]');

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows the hint while the pointer is over the element', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();

    host(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();

    expect(tooltip()?.textContent.trim()).toBe('Not yet');
  });

  it('hides the hint when the pointer leaves', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();
    host(fixture).dispatchEvent(new MouseEvent('mouseenter'));

    host(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();

    expect(tooltip()).toBeNull();
  });

  it('shows the hint to keyboard users on focus and lets Escape close it', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();
    host(fixture).dispatchEvent(new FocusEvent('focusin'));
    await fixture.whenStable();
    const shownOnFocus: boolean = tooltip() !== null;

    host(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(shownOnFocus).toBe(true);
    expect(tooltip()).toBeNull();
  });

  it('describes the element with the hint for screen readers', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();

    const description: HTMLElement | null = document.getElementById(
      host(fixture).getAttribute('aria-describedby') ?? '',
    );

    expect(description?.textContent).toBe('Not yet');
  });

  it('stays silent without a hint', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();
    fixture.componentInstance.hint.set(null);
    await fixture.whenStable();

    host(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();

    expect(tooltip()).toBeNull();
    expect(host(fixture).hasAttribute('aria-describedby')).toBe(false);
  });

  it('removes its screen reader description together with the element', async () => {
    const fixture: ComponentFixture<TooltipHostComponent> = await createFixture();
    const descriptionId: string = host(fixture).getAttribute('aria-describedby') ?? '';

    fixture.destroy();

    expect(document.getElementById(descriptionId)).toBeNull();
  });
});
