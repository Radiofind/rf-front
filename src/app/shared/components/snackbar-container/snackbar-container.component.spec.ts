import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { SnackbarContainerComponent } from './snackbar-container.component';
import { SnackbarService } from '../../services/snackbar-service/snackbar.service';
import { Constants } from '../../../core/constants/constants';

import type { ComponentFixture } from '@angular/core/testing';

describe('SnackbarContainerComponent', () => {
  let fixture: ComponentFixture<SnackbarContainerComponent>;
  let snackbarService: SnackbarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbarContainerComponent],
      providers: [SnackbarService, { provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarContainerComponent);
    snackbarService = TestBed.inject(SnackbarService);
    await fixture.whenStable();
  });

  const snackbarsOf = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('app-snackbar'));

  it('renders an accessible but empty live region', () => {
    const container: HTMLElement = fixture.nativeElement.querySelector('.snackbar-container');

    expect(container.getAttribute('role')).toBe('status');
    expect(container.getAttribute('aria-live')).toBe('polite');
    expect(container.getAttribute('aria-label')).toBe('Notifications');
    expect(snackbarsOf()).toHaveLength(0);
  });

  it('renders one snackbar per service message', async () => {
    snackbarService.show('messages.settingsSaved', { duration: 0 });
    snackbarService.error('messages.settingsSaveFailed', { duration: 0 });
    await fixture.whenStable();

    expect(snackbarsOf()).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Settings saved');
    expect(fixture.nativeElement.textContent).toContain(
      'Could not save settings. Please try again.',
    );
  });

  it('interpolates translation params into the message', async () => {
    snackbarService.error('avatar.tooLarge', { duration: 0, params: { size: 5 } });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Image must not exceed 5 MB');
  });

  it('forwards type and icon to the rendered snackbar', async () => {
    snackbarService.error('messages.profileSaveFailed', { duration: 0 });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.snackbar').classList).toContain('snackbar--error');
    expect(fixture.nativeElement.querySelector('.snackbar__icon i').className).toBe(
      Constants.SNACKBAR_ERROR_ICON_CLASS,
    );
  });

  it('removes a snackbar once it is dismissed', async () => {
    const id: number = snackbarService.show('messages.settingsSaved', { duration: 0 });
    await fixture.whenStable();
    expect(snackbarsOf()).toHaveLength(1);

    snackbarService.dismiss(id);
    await fixture.whenStable();

    expect(snackbarsOf()).toHaveLength(0);
  });
});
