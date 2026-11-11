import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TracksSearchComponent } from './tracks-search.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('TracksSearchComponent', () => {
  const createFixture = async (value: string): Promise<ComponentFixture<TracksSearchComponent>> => {
    await TestBed.configureTestingModule({ imports: [TracksSearchComponent] }).compileComponents();
    const fixture: ComponentFixture<TracksSearchComponent> =
      TestBed.createComponent(TracksSearchComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('placeholder', 'Search in your library...');
    await fixture.whenStable();

    return fixture;
  };

  it('passes on what is typed', async () => {
    const fixture: ComponentFixture<TracksSearchComponent> = await createFixture('');
    const searchChanged = vi.fn();
    fixture.componentInstance.searchChanged.subscribe(searchChanged);
    const input: HTMLInputElement = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('input')!;

    input.value = 'neon';
    input.dispatchEvent(new Event('input'));

    expect(searchChanged).toHaveBeenCalledExactlyOnceWith('neon');
  });

  it('clears the search on request', async () => {
    const fixture: ComponentFixture<TracksSearchComponent> = await createFixture('neon');
    const searchChanged = vi.fn();
    fixture.componentInstance.searchChanged.subscribe(searchChanged);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.tracks-search__clear')
      ?.click();

    expect(searchChanged).toHaveBeenCalledExactlyOnceWith('');
  });

  it('offers no clearing while the search is empty', async () => {
    const fixture: ComponentFixture<TracksSearchComponent> = await createFixture('');

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.tracks-search__clear'),
    ).toBeNull();
  });
});
