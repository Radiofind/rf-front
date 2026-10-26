import { describe, expect, it } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslateErrorPipe } from '../translate-error/translate-error.pipe';
import { TranslationService } from '../../services/translation-service/translation.service';

import type { ComponentFixture } from '@angular/core/testing';
import type { ITranslatableValidationError } from '../../models/translation.model';

@Component({
  template: `
    <p class="plain">{{ 'common.save' | translate }}</p>
    <p class="params">{{ 'common.removeItem' | translate: { item: 'Rock' } }}</p>
    <p class="error">{{ error | translateError }}</p>
    <p class="empty">{{ undefined | translateError }}</p>
  `,
  imports: [TranslatePipe, TranslateErrorPipe],
})
class HostComponent {
  public readonly error: ITranslatableValidationError = {
    kind: 'socialLink',
    message: 'validation.wrongSocialLink',
    params: { platform: 'Telegram' },
  };
}

describe('TranslatePipe and TranslateErrorPipe', () => {
  const textOf = (fixture: ComponentFixture<HostComponent>, selector: string): string =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent ?? '';

  it('re-renders bindings when the language changes', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    expect(textOf(fixture, '.plain')).toBe('Save');
    expect(textOf(fixture, '.params')).toBe('Remove Rock');
    expect(textOf(fixture, '.error')).toBe('This link must lead to Telegram');
    expect(textOf(fixture, '.empty')).toBe('');

    await TestBed.inject(TranslationService).use('RU');
    await fixture.whenStable();

    expect(textOf(fixture, '.plain')).toBe('Сохранить');
    expect(textOf(fixture, '.params')).toBe('Удалить Rock');
    expect(textOf(fixture, '.error')).toBe('Ссылка должна вести на Telegram');
  });
});
