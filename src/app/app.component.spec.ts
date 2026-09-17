import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AppComponent } from './app.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('AppComponent', () => {
  const createFixture = async (): Promise<ComponentFixture<AppComponent>> => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), { provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    return fixture;
  };

  it('creates the application shell', async () => {
    const fixture: ComponentFixture<AppComponent> = await createFixture();

    expect(fixture.componentInstance).toBeInstanceOf(AppComponent);
  });

  it('hosts the router outlet plus the global loader and snackbar host', async () => {
    const fixture: ComponentFixture<AppComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-loader')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-snackbar-container')).not.toBeNull();
  });

  it('keeps the loader overlay hidden while nothing is in flight', async () => {
    const fixture: ComponentFixture<AppComponent> = await createFixture();

    expect(fixture.nativeElement.querySelector('.loader')).toBeNull();
  });
});
