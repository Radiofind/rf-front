import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EditProfilePageComponent } from './edit-profile-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('EditProfilePageComponent', () => {
  let fixture: ComponentFixture<EditProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfilePageComponent);
    await fixture.whenStable();
  });

  it('renders as a standalone page without extra providers', () => {
    expect(fixture.componentInstance).toBeInstanceOf(EditProfilePageComponent);
    expect((fixture.nativeElement as HTMLElement).childElementCount).toBeGreaterThan(0);
  });
});
