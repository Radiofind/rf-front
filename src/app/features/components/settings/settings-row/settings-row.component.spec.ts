import { describe, expect, it } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SettingsRowComponent } from './settings-row.component';

import type { ComponentFixture } from '@angular/core/testing';

@Component({
  imports: [SettingsRowComponent],
  template: `
    <app-settings-row
      rowId="settings-language"
      iconClass="bx bx-globe"
      rowTitle="Language"
      rowDescription="Choose your language."
    >
      <button class="projected-control" type="button">Control</button>
    </app-settings-row>
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class SettingsRowHostComponent {}

describe('SettingsRowComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<SettingsRowHostComponent>> => {
    await TestBed.configureTestingModule({
      imports: [SettingsRowHostComponent],
    }).compileComponents();

    const fixture: ComponentFixture<SettingsRowHostComponent> =
      TestBed.createComponent(SettingsRowHostComponent);
    await fixture.whenStable();

    return fixture;
  };

  it('renders the title and description with ids derived from the row id', async () => {
    const element: HTMLElement = (await createFixture()).nativeElement;

    const title: HTMLElement = element.querySelector('.row__title')!;
    const description: HTMLElement = element.querySelector('.row__description')!;

    expect(title.textContent.trim()).toBe('Language');
    expect(title.id).toBe('settings-language-title');
    expect(description.textContent.trim()).toBe('Choose your language.');
    expect(description.id).toBe('settings-language-description');
  });

  it('renders the icon as decoration', async () => {
    const icon: HTMLElement = (await createFixture()).nativeElement.querySelector('.row__icon');

    expect(icon.classList).toContain('bx-globe');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('projects the control into the control slot', async () => {
    const element: HTMLElement = (await createFixture()).nativeElement;

    expect(element.querySelector('.row__control .projected-control')).not.toBeNull();
  });
});
