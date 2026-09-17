import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('HeaderComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<HeaderComponent>> => {
    await TestBed.configureTestingModule({ imports: [HeaderComponent] }).compileComponents();
    return TestBed.createComponent(HeaderComponent);
  };

  it('renders the brand title', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.header-title').textContent).toBe('RADIOFIND');
  });

  it('renders the logo from the assets folder', async () => {
    const fixture: ComponentFixture<HeaderComponent> = await createFixture();
    await fixture.whenStable();

    const logo: HTMLImageElement = fixture.nativeElement.querySelector('.header-logo');

    expect(logo.getAttribute('src')).toBe('/assets/images/audiowave.png');
    expect(logo.alt).toBe('Logo');
  });
});
