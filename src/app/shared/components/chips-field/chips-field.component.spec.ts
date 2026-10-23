import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ChipsFieldComponent } from './chips-field.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ValidationError } from '@angular/forms/signals';
import type { Mock } from 'vitest';
import type { ISelectOption } from '../../models/select-option.model';

describe('ChipsFieldComponent', () => {
  const options: readonly ISelectOption<string>[] = [
    { value: 'ROCK', label: 'Rock' },
    { value: 'JAZZ', label: 'Jazz' },
    { value: 'POP', label: 'Pop' },
  ];

  const createFixture = async (
    value: string[] = [],
  ): Promise<ComponentFixture<ChipsFieldComponent<string>>> => {
    await TestBed.configureTestingModule({ imports: [ChipsFieldComponent] }).compileComponents();

    const fixture: ComponentFixture<ChipsFieldComponent<string>> =
      TestBed.createComponent<ChipsFieldComponent<string>>(ChipsFieldComponent);

    fixture.componentRef.setInput('fieldId', 'genres');
    fixture.componentRef.setInput('fieldLabel', 'Genres');
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();

    return fixture;
  };

  const element = (fixture: ComponentFixture<ChipsFieldComponent<string>>): HTMLElement =>
    fixture.nativeElement as HTMLElement;

  const chipLabels = (fixture: ComponentFixture<ChipsFieldComponent<string>>): string[] =>
    Array.from(element(fixture).querySelectorAll('.chips-field__chip span')).map((chip) =>
      chip.textContent.trim(),
    );

  const select = (fixture: ComponentFixture<ChipsFieldComponent<string>>): HTMLSelectElement =>
    element(fixture).querySelector('select')!;

  const selectableValues = (fixture: ComponentFixture<ChipsFieldComponent<string>>): string[] =>
    Array.from(select(fixture).options)
      .map((option) => option.value)
      .filter(Boolean);

  const pick = async (
    fixture: ComponentFixture<ChipsFieldComponent<string>>,
    value: string,
  ): Promise<void> => {
    select(fixture).value = value;
    select(fixture).dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  it('renders the selected values as chips with their labels', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture([
      'JAZZ',
      'ROCK',
    ]);

    expect(chipLabels(fixture)).toEqual(['Jazz', 'Rock']);
  });

  it('keeps values that are missing from the options visible as they are', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture([
      'Shoegaze',
    ]);

    expect(chipLabels(fixture)).toEqual(['Shoegaze']);
  });

  it('offers only options that are neither selected nor excluded', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);

    fixture.componentRef.setInput('excludedValues', ['POP']);
    await fixture.whenStable();

    expect(selectableValues(fixture)).toEqual(['JAZZ']);
  });

  it('adds the picked option, resets the picker and emits touch', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);
    const touch: Mock<() => void> = vi.fn<() => void>();
    fixture.componentInstance.touch.subscribe(touch);

    await pick(fixture, 'JAZZ');

    expect(fixture.componentInstance.value()).toEqual(['ROCK', 'JAZZ']);
    expect(chipLabels(fixture)).toEqual(['Rock', 'Jazz']);
    expect(select(fixture).value).toBe('');
    expect(touch).toHaveBeenCalled();
  });

  it('removes a chip with its remove button', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture([
      'ROCK',
      'JAZZ',
    ]);

    element(fixture).querySelector<HTMLButtonElement>('[aria-label="Remove Rock"]')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toEqual(['JAZZ']);
  });

  it('hides the picker and shows the counter once the limit is reached', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);

    fixture.componentRef.setInput('maxItems', 2);
    await fixture.whenStable();

    expect(element(fixture).querySelector('.chips-field__counter')!.textContent.trim()).toBe('1/2');

    await pick(fixture, 'POP');

    expect(element(fixture).querySelector('select')).toBeNull();
    expect(element(fixture).querySelector('.chips-field__counter')!.textContent.trim()).toBe('2/2');
  });

  it('disables the picker and the remove buttons when disabled', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(select(fixture).disabled).toBe(true);
    expect(
      element(fixture).querySelector<HTMLButtonElement>('.chips-field__remove')!.disabled,
    ).toBe(true);
  });

  it('shows errors only after the field was touched', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture();
    const errors: readonly ValidationError.WithOptionalFieldTree[] = [
      { kind: 'maxLength', message: 'Too many genres' },
    ] as readonly ValidationError.WithOptionalFieldTree[];

    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();

    expect(element(fixture).querySelector('.chips-field__errors')!.textContent.trim()).toBe('');

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    expect(element(fixture).querySelector('.chips-field__errors')!.textContent.trim()).toBe(
      'Too many genres',
    );
  });

  it('shows chips without remove buttons and picker in read-only mode', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);

    fixture.componentRef.setInput('isReadonly', true);
    await fixture.whenStable();

    expect(chipLabels(fixture)).toEqual(['Rock']);
    expect(element(fixture).querySelector('.chips-field__remove')).toBeNull();
    expect(element(fixture).querySelector('select')).toBeNull();
  });

  it('renders no header when there is neither a label nor a limit', async () => {
    const fixture: ComponentFixture<ChipsFieldComponent<string>> = await createFixture(['ROCK']);

    fixture.componentRef.setInput('fieldLabel', null);
    await fixture.whenStable();

    expect(element(fixture).querySelector('.chips-field__header')).toBeNull();
    expect(
      element(fixture).querySelector('.chips-field__list')!.hasAttribute('aria-labelledby'),
    ).toBe(false);
  });
});
