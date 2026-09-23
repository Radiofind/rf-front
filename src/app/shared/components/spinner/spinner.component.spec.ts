import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('SpinnerComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<SpinnerComponent>> => {
    await TestBed.configureTestingModule({ imports: [SpinnerComponent] }).compileComponents();
    return TestBed.createComponent(SpinnerComponent);
  };

  it('falls back to the default size, thickness and aria-label', async () => {
    const fixture: ComponentFixture<SpinnerComponent> = await createFixture();
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const spinner: HTMLElement = host.querySelector<HTMLElement>('.spinner')!;

    expect(host.style.getPropertyValue('--spinner-size')).toBe(Constants.SPINNER_DEFAULT_SIZE);
    expect(host.style.getPropertyValue('--spinner-thickness')).toBe(
      Constants.SPINNER_DEFAULT_THICKNESS,
    );
    expect(spinner.getAttribute('aria-label')).toBe('Loading');
    expect(spinner.getAttribute('role')).toBe('status');
  });

  it('writes the custom size and thickness as host css variables', async () => {
    const fixture: ComponentFixture<SpinnerComponent> = await createFixture();

    fixture.componentRef.setInput('size', '64px');
    fixture.componentRef.setInput('thickness', '5px');
    fixture.componentRef.setInput('ariaLabel', 'Please wait');
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.style.getPropertyValue('--spinner-size')).toBe('64px');
    expect(host.style.getPropertyValue('--spinner-thickness')).toBe('5px');
    expect(host.querySelector('.spinner')?.getAttribute('aria-label')).toBe('Please wait');
  });
});
