import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { AvatarStateService } from './avatar-state.service';
import { UserService } from '../user-service/user.service';

describe('AvatarStateService', () => {
  const avatar: Blob = new Blob(['avatar'], { type: 'image/png' });

  let service: AvatarStateService;
  let getCurrentAvatar: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  const createService = (platform: string = 'browser'): void => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: UserService, useValue: { getCurrentAvatar: getCurrentAvatar } },
      ],
    });
    service = TestBed.inject(AvatarStateService);
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    getCurrentAvatar = vi.fn().mockReturnValue(of(avatar));
    createObjectURL = vi.fn().mockReturnValue('blob:avatar');
    revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL: createObjectURL, revokeObjectURL: revokeObjectURL });
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  it('starts without an avatar', () => {
    createService();

    expect(service.avatarUrl()).toBeNull();
  });

  it('loads the avatar and exposes it as an object url', async () => {
    createService();

    await service.loadAvatar();

    expect(getCurrentAvatar).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledWith(avatar);
    expect(service.avatarUrl()).toBe('blob:avatar');
  });

  it('treats a missing avatar as no avatar', async () => {
    getCurrentAvatar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })),
    );
    createService();

    await service.loadAvatar();

    expect(service.avatarUrl()).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('does not request the avatar during server rendering', async () => {
    createService('server');

    await service.loadAvatar();

    expect(getCurrentAvatar).not.toHaveBeenCalled();
    expect(service.avatarUrl()).toBeNull();
  });

  it('replaces the avatar and releases the previous object url', async () => {
    createService();
    await service.loadAvatar();
    createObjectURL.mockReturnValue('blob:uploaded');

    service.setAvatar(new Blob(['new']));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(service.avatarUrl()).toBe('blob:uploaded');
  });

  it('clears the avatar after removal', async () => {
    createService();
    await service.loadAvatar();

    service.setAvatar(null);

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(service.avatarUrl()).toBeNull();
  });

  it('keeps a newer avatar when a stale load finishes later', async () => {
    const avatar$: Subject<Blob> = new Subject<Blob>();
    getCurrentAvatar.mockReturnValue(avatar$);
    createService();
    const uploaded: Blob = new Blob(['uploaded']);
    createObjectURL.mockImplementation((blob: Blob) =>
      blob === uploaded ? 'blob:uploaded' : 'blob:stale',
    );

    const loading: Promise<void> = service.loadAvatar();
    service.setAvatar(uploaded);
    avatar$.next(avatar);
    avatar$.complete();
    await loading;

    expect(service.avatarUrl()).toBe('blob:uploaded');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0]?.[0]).toBe(uploaded);
  });

  it('releases the avatar on clear', async () => {
    createService();
    await service.loadAvatar();

    service.clear();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar');
    expect(service.avatarUrl()).toBeNull();
  });
});
