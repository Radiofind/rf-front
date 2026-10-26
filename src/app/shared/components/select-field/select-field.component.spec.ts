import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SelectFieldComponent } from './select-field.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ISelectOption } from '../../models/select-option.model';

type Fruit = 'apple' | 'pear' | 'plum';

describe('SelectFieldComponent', () => {
  const options: readonly ISelectOption<Fruit>[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'pear', label: 'Pear' },
    { value: 'plum', label: 'Plum' },
  ];

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  const createFixture = async (
    value: Fruit = 'pear',
  ): Promise<ComponentFixture<SelectFieldComponent<Fruit>>> => {
    await TestBed.configureTestingModule({ imports: [SelectFieldComponent] }).compileComponents();

    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> =
      TestBed.createComponent<SelectFieldComponent<Fruit>>(SelectFieldComponent);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();

    return fixture;
  };

  const control = (fixture: ComponentFixture<SelectFieldComponent<Fruit>>): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.select__control')!;

  const displayedValue = (fixture: ComponentFixture<SelectFieldComponent<Fruit>>): string =>
    (fixture.nativeElement as HTMLElement).querySelector('.select__value')!.textContent.trim();

  const menuItems = (): HTMLButtonElement[] =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('.dropdown-menu__item'));

  const open = async (fixture: ComponentFixture<SelectFieldComponent<Fruit>>): Promise<void> => {
    control(fixture).click();
    await fixture.whenStable();
  };

  const choose = async (
    fixture: ComponentFixture<SelectFieldComponent<Fruit>>,
    label: string,
  ): Promise<void> => {
    await open(fixture);
    menuItems()
      .find((item: HTMLButtonElement) => item.textContent.trim() === label)!
      .click();
    await fixture.whenStable();
  };

  it('shows the label of the selected option', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture('plum');

    expect(displayedValue(fixture)).toBe('Plum');
  });

  it('opens a custom menu with every option and marks the selected one', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    await open(fixture);

    expect(menuItems().map((item: HTMLButtonElement) => item.textContent.trim())).toEqual([
      'Apple',
      'Pear',
      'Plum',
    ]);
    expect(menuItems()[1]!.getAttribute('aria-checked')).toBe('true');
    expect(control(fixture).getAttribute('aria-expanded')).toBe('true');
  });

  it('follows model changes from the parent', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('value', 'apple');
    await fixture.whenStable();

    expect(displayedValue(fixture)).toBe('Apple');
  });

  it('updates the model, closes the menu and emits touch when the user picks an option', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    const changes: Fruit[] = [];
    let touchCount: number = 0;
    fixture.componentInstance.value.subscribe((value: Fruit) => changes.push(value));
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    await choose(fixture, 'Plum');

    expect(changes).toEqual(['plum']);
    expect(displayedValue(fixture)).toBe('Plum');
    expect(menuItems()).toHaveLength(0);
    expect(touchCount).toBe(1);
  });

  it('selects an option from a nested group', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('options', [
      { value: 'apple', label: 'Apple' },
      {
        value: 'pear',
        label: 'Stone fruit',
        children: [{ value: 'plum', label: 'Plum' }],
      },
    ]);
    await fixture.whenStable();
    await open(fixture);

    menuItems()[1]!.click();
    await fixture.whenStable();

    expect(menuItems().map((item: HTMLButtonElement) => item.textContent.trim())).toEqual([
      'Apple',
      'Stone fruit',
      'Plum',
    ]);

    menuItems()[2]!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('plum');
    expect(displayedValue(fixture)).toBe('Plum');
    expect(menuItems()).toHaveLength(0);
  });

  it('ignores a value that is not one of the options', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentInstance.onSelect('banana' as Fruit);

    expect(fixture.componentInstance.value()).toBe('pear');
  });

  it('disables the control', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(control(fixture).disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.select--disabled')).not.toBeNull();
  });

  it('links the control to its external label and description', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('labelledBy', 'row-title');
    fixture.componentRef.setInput('describedBy', 'row-description');
    await fixture.whenStable();

    expect(control(fixture).getAttribute('aria-labelledby')).toBe(
      `row-title ${control(fixture).id}`,
    );
    expect(control(fixture).getAttribute('aria-describedby')).toBe('row-description');
  });
});
