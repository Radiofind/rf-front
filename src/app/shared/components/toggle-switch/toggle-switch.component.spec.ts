import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToggleSwitchComponent } from './toggle-switch.component';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('ToggleSwitchComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<ToggleSwitchComponent>> => {
    await TestBed.configureTestingModule({ imports: [ToggleSwitchComponent] }).compileComponents();

    const fixture: ComponentFixture<ToggleSwitchComponent> =
      TestBed.createComponent(ToggleSwitchComponent);
    await fixture.whenStable();

    return fixture;
  };

  const input = (fixture: ComponentFixture<ToggleSwitchComponent>): HTMLInputElement =>
    (fixture.nativeElement as HTMLElement).querySelector('input')!;

  const stateText = (fixture: ComponentFixture<ToggleSwitchComponent>): string =>
    (fixture.nativeElement as HTMLElement).querySelector('.toggle__text')!.textContent.trim();

  it('renders an unchecked, enabled switch by default', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    expect(input(fixture).getAttribute('role')).toBe('switch');
    expect(input(fixture).checked).toBe(false);
    expect(input(fixture).disabled).toBe(false);
    expect(stateText(fixture)).toBe(Constants.TOGGLE_DISABLED_TEXT);
  });

  it('reflects the checked model and shows the enabled text', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();

    expect(input(fixture).checked).toBe(true);
    expect(stateText(fixture)).toBe(Constants.TOGGLE_ENABLED_TEXT);
  });

  it('supports custom state texts', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    fixture.componentRef.setInput('checkedText', 'On');
    fixture.componentRef.setInput('uncheckedText', 'Off');
    await fixture.whenStable();

    expect(stateText(fixture)).toBe('Off');

    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();

    expect(stateText(fixture)).toBe('On');
  });

  it('updates the model and emits touch when toggled', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    const changes: boolean[] = [];
    let touchCount: number = 0;
    fixture.componentInstance.checked.subscribe((value: boolean) => changes.push(value));
    fixture.componentInstance.touch.subscribe(() => {
      touchCount += 1;
    });

    input(fixture).click();
    await fixture.whenStable();

    expect(changes).toEqual([true]);
    expect(touchCount).toBe(1);
    expect(stateText(fixture)).toBe(Constants.TOGGLE_ENABLED_TEXT);
  });

  it('cannot be toggled while disabled', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    input(fixture).click();
    await fixture.whenStable();

    expect(input(fixture).disabled).toBe(true);
    expect(fixture.componentInstance.checked()).toBe(false);
    expect(fixture.nativeElement.querySelector('.toggle--disabled')).not.toBeNull();
  });

  it('links the switch to its external label and description', async () => {
    const fixture: ComponentFixture<ToggleSwitchComponent> = await createFixture();

    expect(input(fixture).hasAttribute('aria-labelledby')).toBe(false);

    fixture.componentRef.setInput('labelledBy', 'row-title');
    fixture.componentRef.setInput('describedBy', 'row-description');
    await fixture.whenStable();

    expect(input(fixture).getAttribute('aria-labelledby')).toBe('row-title');
    expect(input(fixture).getAttribute('aria-describedby')).toBe('row-description');
  });
});
