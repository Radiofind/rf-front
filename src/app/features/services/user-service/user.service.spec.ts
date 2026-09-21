import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { defer, of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from '../../../core/services/api.service';

import type { Observable } from 'rxjs';
import type { ICurrentUser } from '../../../core/models/user.model';

describe('UserService', () => {
  const currentUser: ICurrentUser = {
    name: 'Ada',
    surname: 'Lovelace',
    email: 'ada@example.com',
  };

  let service: UserService;
  let apiMock: Record<string, ReturnType<typeof vi.fn>>;

  const createService = (
    getCurrentUserData: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(currentUser)),
  ): void => {
    TestBed.resetTestingModule();

    apiMock = { getCurrentUserData: getCurrentUserData };

    TestBed.configureTestingModule({
      providers: [UserService, { provide: ApiService, useValue: apiMock }],
    });

    service = TestBed.inject(UserService);
  };

  beforeEach(() => {
    createService();
  });

  it('delegates the current user request to the api service', () => {
    service.getCurrentUserData().subscribe();

    expect(apiMock['getCurrentUserData']).toHaveBeenCalledTimes(1);
    expect(apiMock['getCurrentUserData']).toHaveBeenCalledWith();
  });

  it('emits the current user returned by the api service', () => {
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe(value => {
      received = value;
    });

    expect(received).toEqual(currentUser);
  });

  it('passes the response through untouched', () => {
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe(value => {
      received = value;
    });

    expect(received).toBe(currentUser);
  });

  it('completes after a single emission', () => {
    const emissions: ICurrentUser[] = [];
    let completed: boolean = false;

    service.getCurrentUserData().subscribe({
      next: value => emissions.push(value),
      complete: () => {
        completed = true;
      },
    });

    expect(emissions).toHaveLength(1);
    expect(completed).toBe(true);
  });

  it('does not touch the backend before the caller subscribes', () => {
    let subscriptions: number = 0;

    createService(
      vi.fn().mockReturnValue(
        defer((): Observable<ICurrentUser> => {
          subscriptions += 1;
          return of(currentUser);
        }),
      ),
    );

    const currentUser$: Observable<ICurrentUser> = service.getCurrentUserData();

    expect(subscriptions).toBe(0);

    currentUser$.subscribe();

    expect(subscriptions).toBe(1);
  });

  it('requests the user again for every new call', () => {
    service.getCurrentUserData().subscribe();
    service.getCurrentUserData().subscribe();

    expect(apiMock['getCurrentUserData']).toHaveBeenCalledTimes(2);
  });

  it('surfaces api errors to the caller', () => {
    createService(vi.fn().mockReturnValue(throwError(() => ({ status: 401 }))));

    let errorStatus: number | undefined;
    let received: ICurrentUser | undefined;

    service.getCurrentUserData().subscribe({
      next: value => {
        received = value;
      },
      error: (error: { status: number }) => {
        errorStatus = error.status;
      },
    });

    expect(errorStatus).toBe(401);
    expect(received).toBeUndefined();
  });
});
