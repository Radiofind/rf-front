import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DateFieldComponent } from './date-field.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ValidationError } from '@angular/forms/signals';

describe('DateFieldComponent', () => {
  const errors: readonly ValidationError.WithOptionalFieldTree[] = [
    { kind: 'required', message: 'Field is required' },
  ] as readonly ValidationError.WithOptionalFieldTree[];

  const createFixture = async (): Promise<ComponentFixture<DateFieldComponent>> => {
    await TestBed.configureTestingModule({ imports: [DateFieldComponent] }).compileComponents();
    return TestBed.createComponent(DateFieldComponent);
  };

  it('renders an empty date input by default', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');

    expect(input.type).toBe('date');
    expect(fixture.componentInstance.value()).toBeNull();
    expect(fixture.componentInstance.rawValue()).toBe('');
  });

  it('formats an existing value for the native input', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', new Date(1994, 2, 7));
    await fixture.whenStable();

    expect(fixture.componentInstance.rawValue()).toBe('1994-03-07');
    expect(fixture.nativeElement.querySelector('.field-input').value).toBe('1994-03-07');
  });

  it('parses user input back into a Date', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');
    input.value = '2001-01-05';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const value: Date | null = fixture.componentInstance.value();

    expect(value).toBeInstanceOf(Date);
    expect(value?.getFullYear()).toBe(2001);
    expect(value?.getMonth()).toBe(0);
    expect(value?.getDate()).toBe(5);
  });

  it('clears the value when the input is emptied', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', new Date(1994, 2, 7));
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('formats the min and max bounds', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();

    fixture.componentRef.setInput('min', new Date(1926, 0, 1));
    fixture.componentRef.setInput('max', new Date(2026, 11, 31));
    await fixture.whenStable();

    expect(fixture.componentInstance.minValue()).toBe('1926-01-01');
    expect(fixture.componentInstance.maxValue()).toBe('2026-12-31');
  });

  it('leaves the bounds null when no min or max is given', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance.minValue()).toBeNull();
    expect(fixture.componentInstance.maxValue()).toBeNull();
  });

  it('hides errors until the field is touched or dirty', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();

    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();

    expect(fixture.componentInstance.isInputInvalid()).toBe(false);

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    expect(fixture.componentInstance.isInputInvalid()).toBe(true);
    expect(fixture.nativeElement.querySelector('.error-message').textContent).toContain('Field is required');
  });

  it('emits touch on blur', async () => {
    const fixture: ComponentFixture<DateFieldComponent> = await createFixture();
    await fixture.whenStable();

    let touchCount: number = 0;
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    fixture.nativeElement.querySelector('.field-input').dispatchEvent(new Event('blur'));

    expect(touchCount).toBe(1);
  });
});
