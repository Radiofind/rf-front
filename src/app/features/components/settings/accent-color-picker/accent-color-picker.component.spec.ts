import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccentColorPickerComponent } from './accent-color-picker.component';
import { ACCENT_COLOR_OPTIONS } from '../../../constants/settings.constant';

import { translate } from '../../../../../test-translate';
import type { ComponentFixture } from '@angular/core/testing';
import type { AccentColor } from '../../../../core/types/accent-color.type';

describe('AccentColorPickerComponent', () => {
  const createFixture = async (
    value: AccentColor = 'VIOLET',
  ): Promise<ComponentFixture<AccentColorPickerComponent>> => {
    await TestBed.configureTestingModule({
      imports: [AccentColorPickerComponent],
    }).compileComponents();

    const fixture: ComponentFixture<AccentColorPickerComponent> = TestBed.createComponent(
      AccentColorPickerComponent,
    );
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();

    return fixture;
  };

  const radios = (fixture: ComponentFixture<AccentColorPickerComponent>): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('input[type="radio"]'));

  it('renders one labelled radio per accent color', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture();

    expect(radios(fixture).map((radio) => radio.getAttribute('aria-label'))).toEqual(
      ACCENT_COLOR_OPTIONS.map((option) => translate(option.label)),
    );
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  it('paints every swatch with its gradient', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture();

    const swatch: HTMLElement = fixture.nativeElement.querySelector('.picker__swatch');

    expect(swatch.style.background).toContain('linear-gradient');
  });

  it('checks the swatch matching the model', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture('ORCHID');

    expect(
      radios(fixture)
        .filter((radio) => radio.checked)
        .map((radio) => radio.value),
    ).toEqual(['ORCHID']);
  });

  it('updates the model and emits touch when a swatch is picked', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture();

    const changes: AccentColor[] = [];
    let touchCount: number = 0;
    fixture.componentInstance.value.subscribe((value: AccentColor) => changes.push(value));
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    radios(fixture)[1]!.click();
    await fixture.whenStable();

    expect(changes).toEqual(['OCEAN']);
    expect(touchCount).toBe(1);
  });

  it('disables every swatch', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(radios(fixture).every((radio) => radio.disabled)).toBe(true);
  });

  it('links the group to its external label and description', async () => {
    const fixture: ComponentFixture<AccentColorPickerComponent> = await createFixture();

    fixture.componentRef.setInput('labelledBy', 'row-title');
    fixture.componentRef.setInput('describedBy', 'row-description');
    await fixture.whenStable();

    const group: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');

    expect(group.getAttribute('aria-labelledby')).toBe('row-title');
    expect(group.getAttribute('aria-describedby')).toBe('row-description');
  });
});
