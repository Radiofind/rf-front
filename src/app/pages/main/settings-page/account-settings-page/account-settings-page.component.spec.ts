import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccountSettingsPageComponent } from './account-settings-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('AccountSettingsPageComponent', () => {
  it('renders the account settings section', async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSettingsPageComponent],
    }).compileComponents();

    const fixture: ComponentFixture<AccountSettingsPageComponent> = TestBed.createComponent(
      AccountSettingsPageComponent,
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('Account Settings');
  });
});
