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
    expect(container.getAttribute('aria-label')).toBe(Constants.SNACKBAR_CONTAINER_ARIA_LABEL);
    expect(snackbarsOf()).toHaveLength(0);
  });

  it('renders one snackbar per service message', async () => {
    snackbarService.show('first', { duration: 0 });
    snackbarService.error('second', { duration: 0 });
    await fixture.whenStable();

    expect(snackbarsOf()).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('first');
    expect(fixture.nativeElement.textContent).toContain('second');
  });

  it('forwards type and icon to the rendered snackbar', async () => {
    snackbarService.error('went wrong', { duration: 0 });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.snackbar').classList).toContain('snackbar--error');
    expect(fixture.nativeElement.querySelector('.snackbar__icon i').className).toBe(
      Constants.SNACKBAR_ERROR_ICON_CLASS,
    );
  });

  it('removes a snackbar once it is dismissed', async () => {
    const id: number = snackbarService.show('first', { duration: 0 });
    await fixture.whenStable();
    expect(snackbarsOf()).toHaveLength(1);

    snackbarService.dismiss(id);
    await fixture.whenStable();

    expect(snackbarsOf()).toHaveLength(0);
  });
});
