import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { InputFieldComponent } from './input-field.component';
import { InputTypeEnum } from '../../../core/enums/input-type.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { ValidationError } from '@angular/forms/signals';

describe('InputFieldComponent', () => {
  const errors: readonly ValidationError.WithOptionalFieldTree[] = [
    { kind: 'required', message: 'Field is required' },
  ] as readonly ValidationError.WithOptionalFieldTree[];

  const createFixture = async (): Promise<ComponentFixture<InputFieldComponent>> => {
    await TestBed.configureTestingModule({ imports: [InputFieldComponent] }).compileComponents();
    return TestBed.createComponent(InputFieldComponent);
  };

  it('renders a text input by default', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');

    expect(input.type).toBe(InputTypeEnum.TEXT);
    expect(fixture.nativeElement.querySelector('.field-textarea')).toBeNull();
  });

  it('renders a textarea with the configured rows instead of an input', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('isTextareaField', true);
    fixture.componentRef.setInput('textareaRows', 4);
    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('.field-textarea');

    expect(textarea.rows).toBe(4);
    expect(fixture.nativeElement.querySelector('.field-input')).toBeNull();
  });

  it('renders label, optional marker and icon', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('fieldLabel', 'Recovery Email');
    fixture.componentRef.setInput('hasOptionalLabel', true);
    fixture.componentRef.setInput('iconClass', 'bx bx-envelope-alt');
    await fixture.whenStable();

    const label: HTMLElement = fixture.nativeElement.querySelector('.label');

    expect(label.textContent).toContain('Recovery Email');
    expect(label.textContent).toContain('(optional)');
    expect(fixture.nativeElement.querySelector('i.default').className).toContain(
      'bx bx-envelope-alt',
    );
  });

  it('writes typed input into the value model', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');
    input.value = 'user@example.com';
    input.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.value()).toBe('user@example.com');
  });

  it('writes typed textarea content into the value model', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('isTextareaField', true);
    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('.field-textarea');
    textarea.value = 'About my music';
    textarea.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.value()).toBe('About my music');
  });

  it('emits touch on blur', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();
    await fixture.whenStable();

    let touchCount: number = 0;
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    fixture.nativeElement.querySelector('.field-input').dispatchEvent(new Event('blur'));

    expect(touchCount).toBe(1);
  });

  it('hides errors while the field is neither touched nor dirty', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('errors', errors);
    await fixture.whenStable();

    expect(fixture.componentInstance.visibleErrors()).toEqual([]);
    expect(fixture.componentInstance.isInputInvalid()).toBe(false);
    expect(fixture.nativeElement.querySelector('.error-message').textContent.trim()).toBe('');
  });

  it.each(['touched', 'dirty'])('shows errors once the field is %s', async (flag) => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('errors', errors);
    fixture.componentRef.setInput(flag, true);
    await fixture.whenStable();

    expect(fixture.componentInstance.isInputInvalid()).toBe(true);
    expect(fixture.nativeElement.querySelector('.error-message').textContent).toContain(
      'Field is required',
    );
    expect(fixture.nativeElement.querySelector('.field-input').classList).toContain('invalid');
  });

  it('emits inputActionEmiter from the action button', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('hasInputAction', true);
    fixture.componentRef.setInput('inputActionIconClass', 'bx bx-eye');
    await fixture.whenStable();

    let actionCount: number = 0;
    fixture.componentInstance.inputActionEmiter.subscribe(() => {
      actionCount += 1;
    });

    fixture.nativeElement.querySelector('.action-icon').click();

    expect(actionCount).toBe(1);
  });

  it('emits additionalFieldAction from the secondary label', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('additionalFieldLabel', 'Forgot password?');
    await fixture.whenStable();

    let actionCount: number = 0;
    fixture.componentInstance.additionalFieldAction.subscribe(() => {
      actionCount += 1;
    });

    fixture.nativeElement.querySelector('.label-color').click();

    expect(actionCount).toBe(1);
  });

  it('forwards disabled and required to the native input', async () => {
    const fixture: ComponentFixture<InputFieldComponent> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.field-input');

    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
  });
});
