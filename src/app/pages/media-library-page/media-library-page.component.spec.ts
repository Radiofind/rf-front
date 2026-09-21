import { TestBed } from '@angular/core/testing';
import { MediaLibraryPageComponent } from './media-library-page.component';

import type { ComponentFixture } from '@angular/core/testing';

describe('MediaLibraryPageComponent', () => {
  let component: MediaLibraryPageComponent;
  let fixture: ComponentFixture<MediaLibraryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaLibraryPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaLibraryPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
