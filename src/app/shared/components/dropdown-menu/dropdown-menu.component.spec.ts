import { afterEach, describe, expect, it } from 'vitest';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DropdownMenuComponent } from './dropdown-menu.component';
import { DropdownTriggerDirective } from '../../directives/dropdown-trigger/dropdown-trigger.directive';

import type { WritableSignal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  imports: [DropdownMenuComponent, DropdownTriggerDirective],
  template: `
    <button type="button" class="trigger" [appDropdownTriggerFor]="dropdown">Open</button>
    <app-dropdown-menu
      #dropdown="appDropdownMenu"
      [options]="options()"
      [selectedValue]="selected()"
      (optionSelect)="selected.set($event)"
    />
  `,
})
class DropdownHostComponent {
  public readonly options: WritableSignal<readonly ISelectOption<string>[]> = signal<
    readonly ISelectOption<string>[]
  >([
    { value: 'POP', label: 'Pop' },
    {
      value: 'METAL',
      label: 'Metal',
      children: [
        { value: 'THRASH_METAL', label: 'Thrash Metal' },
        {
          value: 'INDUSTRIAL',
          label: 'Industrial',
          children: [{ value: 'INDUSTRIAL_METAL', label: 'Industrial Metal' }],
        },
      ],
    },
  ]);

  public readonly selected: WritableSignal<string | null> = signal<string | null>(null);
}

describe('DropdownMenuComponent', () => {
  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  const createFixture = async (): Promise<ComponentFixture<DropdownHostComponent>> => {
    await TestBed.configureTestingModule({ imports: [DropdownHostComponent] }).compileComponents();

    const fixture: ComponentFixture<DropdownHostComponent> =
      TestBed.createComponent(DropdownHostComponent);
    await fixture.whenStable();

    return fixture;
  };

  const panels = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>('.dropdown-menu'));

  const item = (label: string): HTMLButtonElement =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('.dropdown-menu__item')).find(
      (candidate: HTMLButtonElement) => candidate.textContent.trim() === label,
    )!;

  const open = async (fixture: ComponentFixture<DropdownHostComponent>): Promise<void> => {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.trigger')!.click();
    await fixture.whenStable();
  };

  it('renders groups as submenu triggers and leaves as selectable items', async () => {
    const fixture: ComponentFixture<DropdownHostComponent> = await createFixture();

    await open(fixture);

    expect(panels()).toHaveLength(1);
    expect(item('Pop').getAttribute('role')).toBe('menuitemradio');
    expect(item('Metal').getAttribute('role')).toBe('menuitem');
    expect(item('Metal').getAttribute('aria-haspopup')).toBe('menu');
  });

  it('opens nested levels and selects a deeply nested option', async () => {
    const fixture: ComponentFixture<DropdownHostComponent> = await createFixture();

    await open(fixture);
    item('Metal').click();
    await fixture.whenStable();
    item('Industrial').click();
    await fixture.whenStable();

    expect(panels()).toHaveLength(3);

    item('Industrial Metal').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected()).toBe('INDUSTRIAL_METAL');
    expect(panels()).toHaveLength(0);
  });

  it('keeps a submenu open when its group is clicked after hovering it', async () => {
    const fixture: ComponentFixture<DropdownHostComponent> = await createFixture();

    await open(fixture);
    item('Metal').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();

    expect(panels()).toHaveLength(2);

    item('Metal').click();
    await fixture.whenStable();

    expect(panels()).toHaveLength(2);
    expect(item('Metal').getAttribute('aria-expanded')).toBe('true');
  });

  it('marks the selected option and the group that contains it', async () => {
    const fixture: ComponentFixture<DropdownHostComponent> = await createFixture();

    fixture.componentInstance.selected.set('THRASH_METAL');
    await open(fixture);

    expect(item('Metal').classList).toContain('dropdown-menu__item--active');

    item('Metal').click();
    await fixture.whenStable();

    expect(item('Thrash Metal').getAttribute('aria-checked')).toBe('true');
    expect(item('Industrial').classList).not.toContain('dropdown-menu__item--active');
  });

  it('reflects option changes made while the trigger was already used', async () => {
    const fixture: ComponentFixture<DropdownHostComponent> = await createFixture();

    await open(fixture);
    await open(fixture);
    fixture.componentInstance.options.set([{ value: 'JAZZ', label: 'Jazz' }]);
    await open(fixture);

    expect(item('Jazz')).toBeDefined();
    expect(item('Pop')).toBeUndefined();
  });
});
