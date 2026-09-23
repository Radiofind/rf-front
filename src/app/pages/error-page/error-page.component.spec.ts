import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DeferBlockBehavior } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { ErrorPageComponent } from './error-page.component';
import { ERROR_PAGE_CONTENT } from '../../features/constants/error-content.constant';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';
import { ErrorTypeEnum } from '../../core/enums/error-type.enum';

import type { ComponentFixture } from '@angular/core/testing';
import type { Data } from '@angular/router';
import type { ErrorType } from '../../core/types/error-type.type';

describe('ErrorPageComponent', () => {
  let navigate: ReturnType<typeof vi.fn>;

  const createFixture = async (data: Data): Promise<ComponentFixture<ErrorPageComponent>> => {
    await TestBed.configureTestingModule({
      imports: [ErrorPageComponent],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
      providers: [
        { provide: ActivatedRoute, useValue: { data: of(data) } },
        { provide: Router, useValue: { navigate: navigate } },
        { provide: Location, useValue: { back: vi.fn() } },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<ErrorPageComponent> =
      TestBed.createComponent(ErrorPageComponent);
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    navigate = vi.fn().mockResolvedValue(true);
  });

  it.each([ErrorTypeEnum.NOT_FOUND, ErrorTypeEnum.FORBIDDEN, ErrorTypeEnum.SERVER_ERROR])(
    'renders the %s content',
    async (errorType) => {
      const fixture: ComponentFixture<ErrorPageComponent> = await createFixture({
        [Constants.ERROR_TYPE_PROP]: errorType,
      });
      const expected = ERROR_PAGE_CONTENT[errorType as ErrorType];

      expect(fixture.componentInstance.errorType()).toBe(errorType);
      expect(fixture.nativeElement.querySelector('.error-code').textContent).toBe(expected.code);
      expect(fixture.nativeElement.querySelector('.error-title').textContent).toContain(
        expected.title.trim(),
      );
      expect(fixture.nativeElement.querySelector('.error-title span').textContent).toBe(
        expected.titleColor,
      );
      expect(fixture.nativeElement.querySelector('.error-description').textContent).toBe(
        expected.description,
      );
      expect(fixture.nativeElement.querySelector('.error-badge .icon i').className).toBe(
        expected.iconClass,
      );
    },
  );

  it('falls back to the not-found content when the route carries no error type', async () => {
    const fixture: ComponentFixture<ErrorPageComponent> = await createFixture({});

    expect(fixture.componentInstance.errorType()).toBe(ErrorTypeEnum.NOT_FOUND);
    expect(fixture.componentInstance.content()).toEqual(
      ERROR_PAGE_CONTENT[ErrorTypeEnum.NOT_FOUND],
    );
  });

  it('renders the home action with its label and icon', async () => {
    const fixture: ComponentFixture<ErrorPageComponent> = await createFixture({
      [Constants.ERROR_TYPE_PROP]: ErrorTypeEnum.FORBIDDEN,
    });

    const button: HTMLElement = fixture.nativeElement.querySelector('.error-actions button');

    expect(button.querySelector('p')?.textContent).toBe('Back to Home');
    expect(button.querySelector('i')?.className).toBe('bx bx-home');
  });

  it('navigates home from the action button', async () => {
    const fixture: ComponentFixture<ErrorPageComponent> = await createFixture({
      [Constants.ERROR_TYPE_PROP]: ErrorTypeEnum.NOT_FOUND,
    });

    (fixture.nativeElement.querySelector('.error-actions button') as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledWith([Links.DEFAULT_PATH]);
  });

  it('renders the shared header', async () => {
    const fixture: ComponentFixture<ErrorPageComponent> = await createFixture({});

    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
  });
});
