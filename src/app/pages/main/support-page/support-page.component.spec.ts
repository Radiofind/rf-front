import { TestBed } from '@angular/core/testing';
import { SupportPageComponent } from './support-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('SupportPageComponent', () => {
  let component: SupportPageComponent;
  let fixture: ComponentFixture<SupportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
