import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SnackbarComponent } from './snackbar.component';
import { Constants } from '../../../core/constants/constants';
import { SnackbarTypeEnum } from '../../../core/enums/snackbar-type.enum';

import type { ComponentFixture } from '@angular/core/testing';

describe('SnackbarComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<SnackbarComponent>> => {
    await TestBed.configureTestingModule({ imports: [SnackbarComponent] }).compileComponents();
    return TestBed.createComponent(SnackbarComponent);
  };

  it('defaults to the success type and its icon', async () => {
    const fixture: ComponentFixture<SnackbarComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance.iconClass()).toBe(Constants.SNACKBAR_SUCCESS_ICON_CLASS);
    expect(fixture.nativeElement.querySelector('.snackbar').classList).toContain('snackbar--success');
  });

  it.each([
    [SnackbarTypeEnum.ERROR, Constants.SNACKBAR_ERROR_ICON_CLASS],
    [SnackbarTypeEnum.WARNING, Constants.SNACKBAR_WARNING_ICON_CLASS],
    [SnackbarTypeEnum.INFO, Constants.SNACKBAR_INFO_ICON_CLASS],
  ])('maps the %s type to its icon', async (type, expectedIcon) => {
    const fixture: ComponentFixture<SnackbarComponent> = await createFixture();

    fixture.componentRef.setInput('snackbarType', type);
    await fixture.whenStable();

    expect(fixture.componentInstance.iconClass()).toBe(expectedIcon);
  });

  it('prefers an explicit icon class over the type icon', async () => {
    const fixture: ComponentFixture<SnackbarComponent> = await createFixture();

    fixture.componentRef.setInput('snackbarType', SnackbarTypeEnum.ERROR);
    fixture.componentRef.setInput('snackbarIconClass', 'bx bx-custom');
    await fixture.whenStable();

    expect(fixture.componentInstance.iconClass()).toBe('bx bx-custom');
  });

  it('renders the content text', async () => {
    const fixture: ComponentFixture<SnackbarComponent> = await createFixture();

    fixture.componentRef.setInput('snackbarContent', 'Saved');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.snackbar__text').textContent).toBe('Saved');
  });
});
