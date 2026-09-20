import { TestBed } from '@angular/core/testing';
import { MainContainerComponent } from './main-container.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('MainContainer', () => {
  let component: MainContainerComponent;
  let fixture: ComponentFixture<MainContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
