import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CheckboxFieldComponent } from './checkbox-field.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('CheckboxFieldComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<CheckboxFieldComponent>> => {
    await TestBed.configureTestingModule({ imports: [CheckboxFieldComponent] }).compileComponents();
    return TestBed.createComponent(CheckboxFieldComponent);
  };

  it('is unchecked and enabled by default', async () => {
    const fixture: ComponentFixture<CheckboxFieldComponent> = await createFixture();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.checked).toBe(false);
    expect(input.disabled).toBe(false);
  });

  it('renders the label text', async () => {
    const fixture: ComponentFixture<CheckboxFieldComponent> = await createFixture();

    fixture.componentRef.setInput('checkboxText', 'I agree');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('label').textContent).toContain('I agree');
  });

  it('reflects the checked model in the DOM', async () => {
    const fixture: ComponentFixture<CheckboxFieldComponent> = await createFixture();

    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input').checked).toBe(true);
  });

  it('updates the model and emits touch when toggled', async () => {
    const fixture: ComponentFixture<CheckboxFieldComponent> = await createFixture();
    await fixture.whenStable();

    let touchCount: number = 0;
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(fixture.componentInstance.checked()).toBe(true);
    expect(touchCount).toBe(1);
  });

  it('disables the native input when disabled', async () => {
    const fixture: ComponentFixture<CheckboxFieldComponent> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });
});
