import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { of } from 'rxjs';
import { MainContainerComponent } from './main-container.component';
import { UserService } from '../../../features/services/user-service/user.service';

import type { ComponentFixture } from '@angular/core/testing';
import type { ICurrentUser } from '../../../core/models/user.model';

describe('MainContainer', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
  };

  let component: MainContainerComponent;
  let fixture: ComponentFixture<MainContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContainerComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: UserService,
          useValue: { getCurrentUserData: vi.fn().mockReturnValue(of(currentUser)) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
