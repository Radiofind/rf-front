import { describe, expect, it } from 'vitest';
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

  const select = (fixture: ComponentFixture<SelectFieldComponent<Fruit>>): HTMLSelectElement =>
    (fixture.nativeElement as HTMLElement).querySelector('select')!;

  const choose = async (
    fixture: ComponentFixture<SelectFieldComponent<Fruit>>,
    value: string,
  ): Promise<void> => {
    select(fixture).value = value;
    select(fixture).dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  it('renders every option with its label', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    const rendered: string[] = Array.from(select(fixture).options, (option) =>
      option.textContent.trim(),
    );

    expect(rendered).toEqual(['Apple', 'Pear', 'Plum']);
  });

  it('selects the option matching the model', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture('plum');

    expect(select(fixture).value).toBe('plum');
  });

  it('follows model changes from the parent', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('value', 'apple');
    await fixture.whenStable();

    expect(select(fixture).value).toBe('apple');
  });

  it('updates the model and emits touch when the user picks an option', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    const changes: Fruit[] = [];
    let touchCount: number = 0;
    fixture.componentInstance.value.subscribe((value: Fruit) => changes.push(value));
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    await choose(fixture, 'plum');

    expect(changes).toEqual(['plum']);
    expect(fixture.componentInstance.value()).toBe('plum');
    expect(touchCount).toBe(1);
  });

  it('ignores a value that is not one of the options', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentInstance.onChange({ target: { value: 'banana' } } as unknown as Event);

    expect(fixture.componentInstance.value()).toBe('pear');
  });

  it('disables the native control', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(select(fixture).disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.select--disabled')).not.toBeNull();
  });

  it('links the control to its external label and description', async () => {
    const fixture: ComponentFixture<SelectFieldComponent<Fruit>> = await createFixture();

    fixture.componentRef.setInput('labelledBy', 'row-title');
    fixture.componentRef.setInput('describedBy', 'row-description');
    await fixture.whenStable();

    expect(select(fixture).getAttribute('aria-labelledby')).toBe('row-title');
    expect(select(fixture).getAttribute('aria-describedby')).toBe('row-description');
  });
});
