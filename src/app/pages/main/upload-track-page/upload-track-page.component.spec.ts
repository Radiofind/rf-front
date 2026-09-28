import { TestBed } from '@angular/core/testing';
import { UploadTrackPageComponent } from './upload-track-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('UploadTrackPageComponent', () => {
  let component: UploadTrackPageComponent;
  let fixture: ComponentFixture<UploadTrackPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadTrackPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadTrackPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
