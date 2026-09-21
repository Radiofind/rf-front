import { TestBed } from '@angular/core/testing';
import { MyUploadsPageComponent } from './my-uploads-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('MyUploadsPageComponent', () => {
  let component: MyUploadsPageComponent;
  let fixture: ComponentFixture<MyUploadsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUploadsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyUploadsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
