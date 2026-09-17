import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UploadsPageComponent } from './uploads-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('UploadsPageComponent', () => {
  it('renders its placeholder content', async () => {
    await TestBed.configureTestingModule({ imports: [UploadsPageComponent] }).compileComponents();

    const fixture: ComponentFixture<UploadsPageComponent> = TestBed.createComponent(UploadsPageComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeInstanceOf(UploadsPageComponent);
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull();
  });
});
