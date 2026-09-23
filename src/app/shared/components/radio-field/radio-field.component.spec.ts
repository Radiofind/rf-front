import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RadioFieldComponent } from './radio-field.component';

import type { ComponentFixture } from '@angular/core/testing';
import type { ArtistType } from '../../../core/types/artist-type.type';

describe('RadioFieldComponent', () => {
  const options: readonly ArtistType[] = ['Artist', 'Band'];

  const createFixture = async (): Promise<ComponentFixture<RadioFieldComponent<ArtistType>>> => {
    await TestBed.configureTestingModule({ imports: [RadioFieldComponent] }).compileComponents();

    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> =
      TestBed.createComponent<RadioFieldComponent<ArtistType>>(RadioFieldComponent);

    fixture.componentRef.setInput('value', 'Artist');
    fixture.componentRef.setInput('options', options);

    return fixture;
  };

  it('renders one radio per option', async () => {
    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> = await createFixture();
    await fixture.whenStable();

    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));

    expect(inputs).toHaveLength(2);
    expect(inputs.map((input) => input.value)).toEqual(['Artist', 'Band']);
  });

  it('checks only the selected option', async () => {
    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> = await createFixture();
    await fixture.whenStable();

    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));

    expect(inputs.map((input) => input.checked)).toEqual([true, false]);
  });

  it('renders the field label', async () => {
    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> = await createFixture();

    fixture.componentRef.setInput('fieldLabel', 'Who are you?');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.radio-field__label').textContent).toContain(
      'Who are you?',
    );
  });

  it('updates the model and emits touch on change', async () => {
    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> = await createFixture();
    await fixture.whenStable();

    let touchCount: number = 0;
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    fixture.componentInstance.onChange('Band');
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('Band');
    expect(touchCount).toBe(1);

    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));
    expect(inputs.map((input) => input.checked)).toEqual([false, true]);
  });

  it('disables every radio when disabled', async () => {
    const fixture: ComponentFixture<RadioFieldComponent<ArtistType>> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const inputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('input'));

    expect(inputs.every((input) => input.disabled)).toBe(true);
  });
});
