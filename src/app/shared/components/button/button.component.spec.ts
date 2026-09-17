import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ButtonTypeEnum } from '../../../core/enums/button-type.enum';

import type { ComponentFixture } from '@angular/core/testing';

describe('ButtonComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<ButtonComponent>> => {
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    return TestBed.createComponent(ButtonComponent);
  };

  it('renders the default button type', async () => {
    const fixture: ComponentFixture<ButtonComponent> = await createFixture();
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.type).toBe(ButtonTypeEnum.BUTTON);
    expect(button.disabled).toBe(false);
  });

  it('projects text, icon class and additional class', async () => {
    const fixture: ComponentFixture<ButtonComponent> = await createFixture();

    fixture.componentRef.setInput('contentText', 'Log In');
    fixture.componentRef.setInput('contentIconClass', 'bx bx-arrow');
    fixture.componentRef.setInput('additionalClass', 'button--secondary');
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.querySelector('p')?.textContent).toBe('Log In');
    expect(button.querySelector('i')?.className).toBe('bx bx-arrow');
    expect(button.classList.contains('button--secondary')).toBe(true);
  });

  it('emits clickAction on click', async () => {
    const fixture: ComponentFixture<ButtonComponent> = await createFixture();
    await fixture.whenStable();

    let emitCount: number = 0;
    fixture.componentInstance.clickAction.subscribe(() => {
      emitCount += 1;
    });

    fixture.nativeElement.querySelector('button').click();

    expect(emitCount).toBe(1);
  });

  it('is disabled when the disabled input is set', async () => {
    const fixture: ComponentFixture<ButtonComponent> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});
