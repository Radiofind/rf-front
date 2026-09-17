import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CodeFieldComponent } from './code-field.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';
import type { ValidationError } from '@angular/forms/signals';

describe('CodeFieldComponent', () => {
  const errors: readonly ValidationError.WithOptionalFieldTree[] = [
    { kind: 'server', message: 'Invalid verification code, please try again' },
  ] as readonly ValidationError.WithOptionalFieldTree[];

  const createFixture = async (): Promise<ComponentFixture<CodeFieldComponent>> => {
    await TestBed.configureTestingModule({ imports: [CodeFieldComponent] }).compileComponents();
    return TestBed.createComponent(CodeFieldComponent);
  };

  const cellsOf = (fixture: ComponentFixture<CodeFieldComponent>): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.code-field__cell'));

  const pasteEvent = (text: string): Event => {
    const event: Event = new Event('paste', { cancelable: true });

    Object.defineProperty(event, 'clipboardData', {
      value: { getData: (): string => text },
    });

    return event;
  };

  it('renders one empty cell per configured digit', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);

    expect(cells).toHaveLength(Constants.CODE_FIELD_DEFAULT_LENGTH);
    expect(fixture.componentInstance.cells()).toEqual(['', '', '', '', '', '']);
  });

  it('honours a custom code length', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('codeLength', 4);
    await fixture.whenStable();

    expect(cellsOf(fixture)).toHaveLength(4);
  });

  it('spreads an existing value across the cells', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '1234');
    await fixture.whenStable();

    expect(fixture.componentInstance.cells()).toEqual(['1', '2', '3', '4', '', '']);
  });

  it('writes a typed digit and moves focus to the next cell', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);
    cells[0]!.value = '7';
    cells[0]!.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('7');
    expect(document.activeElement).toBe(cells[1]);
  });

  it('ignores non-digit characters', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);
    cells[0]!.value = 'a';
    cells[0]!.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('');
    expect(cells[0]!.value).toBe('');
  });

  it('distributes a pasted code across the cells', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    cellsOf(fixture)[0]!.dispatchEvent(pasteEvent('12-34 56'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('123456');
  });

  it('keeps the value untouched when the pasted text has no digits', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '12');
    await fixture.whenStable();

    cellsOf(fixture)[0]!.dispatchEvent(pasteEvent('no digits'));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('12');
  });

  it('clears the current cell on backspace when it is filled', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '12');
    await fixture.whenStable();

    cellsOf(fixture)[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.BACKSPACE_KEY }));
    await fixture.whenStable();

    expect(fixture.componentInstance.cells()).toEqual(['1', '', '', '', '', '']);
  });

  it('clears the previous cell on backspace when the current one is empty', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '12');
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);
    cells[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.BACKSPACE_KEY }));
    await fixture.whenStable();

    expect(fixture.componentInstance.cells()).toEqual(['1', '', '', '', '', '']);
    expect(document.activeElement).toBe(cells[1]);
  });

  it('does nothing on backspace in the first empty cell', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    cellsOf(fixture)[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.BACKSPACE_KEY }));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('');
  });

  it('moves focus with the arrow keys and clamps at the edges', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '123456');
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);

    cells[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.ARROW_LEFT_KEY }));
    expect(document.activeElement).toBe(cells[1]);

    cells[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.ARROW_RIGHT_KEY }));
    expect(document.activeElement).toBe(cells[3]);

    cells[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.ARROW_LEFT_KEY }));
    expect(document.activeElement).toBe(cells[0]);

    cells[5]!.dispatchEvent(new KeyboardEvent('keydown', { key: Constants.ARROW_RIGHT_KEY }));
    expect(document.activeElement).toBe(cells[5]);
  });

  it('redirects focus to the first empty cell', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('value', '12');
    await fixture.whenStable();

    const cells: HTMLInputElement[] = cellsOf(fixture);
    cells[4]!.dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();

    expect(document.activeElement).toBe(cells[2]);
  });

  it('hides errors until the field is touched or dirty', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();

    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();

    expect(fixture.componentInstance.isCodeInvalid()).toBe(false);
    expect(fixture.nativeElement.querySelector('.code-field__errors')).toBeNull();

    fixture.componentRef.setInput('dirty', true);
    await fixture.whenStable();

    expect(fixture.componentInstance.isCodeInvalid()).toBe(true);
    expect(fixture.nativeElement.querySelector('.code-field__errors').textContent).toContain(
      'Invalid verification code, please try again',
    );
  });

  it('emits touch on blur', async () => {
    const fixture: ComponentFixture<CodeFieldComponent> = await createFixture();
    await fixture.whenStable();

    let touchCount: number = 0;
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    cellsOf(fixture)[0]!.dispatchEvent(new Event('blur'));

    expect(touchCount).toBe(1);
  });
});
