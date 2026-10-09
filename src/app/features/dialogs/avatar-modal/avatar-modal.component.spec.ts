import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of, Subject, throwError } from 'rxjs';
import { AvatarModalComponent } from './avatar-modal.component';
import { UserService } from '../../services/user-service/user.service';
import { SnackbarService } from '../../../shared/services/snackbar-service/snackbar.service';
import { AVATAR_MAX_SIZE_BYTES, AVATAR_MESSAGES } from '../../constants/avatar.constant';

import type { ComponentFixture } from '@angular/core/testing';
import type { IAvatarModalData } from '../../models/avatar-modal.model';

describe('AvatarModalComponent', () => {
  const PREVIEW_URL: string = 'blob:preview';

  const CURRENT_AVATAR_URL: string = 'blob:current';

  let fixture: ComponentFixture<AvatarModalComponent>;
  let close: ReturnType<typeof vi.fn>;
  let uploadNewAvatar: ReturnType<typeof vi.fn>;
  let deleteAvatar: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let error: ReturnType<typeof vi.fn>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  const createFixture = async (data: IAvatarModalData): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [AvatarModalComponent],
      providers: [
        { provide: DialogRef, useValue: { close: close } },
        { provide: DIALOG_DATA, useValue: data },
        {
          provide: UserService,
          useValue: { uploadNewAvatar: uploadNewAvatar, deleteAvatar: deleteAvatar },
        },
        { provide: SnackbarService, useValue: { success: success, error: error } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarModalComponent);
    await fixture.whenStable();
  };

  const query = (selector: string): HTMLElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);

  const buttonByText = (text: string): HTMLButtonElement =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
      (button: HTMLButtonElement) => button.textContent.trim() === text,
    )!;

  const createImage = (
    type: string = 'image/png',
    size: number = 1024,
    name: string = 'avatar.png',
  ): File => {
    const file: File = new File(['image'], name, { type: type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const chooseFile = async (file: File): Promise<void> => {
    const input: HTMLInputElement = query('.avatar-modal__input') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: { item: (): File => file, length: 1 },
    });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };

  const dropFile = async (file: File): Promise<void> => {
    const event: Event = new Event('drop', { cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: { item: (): File => file, length: 1 } },
    });
    (query('.avatar-modal__dropzone') as HTMLLabelElement).dispatchEvent(event);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    close = vi.fn();
    uploadNewAvatar = vi.fn().mockReturnValue(of({ avatarUrl: '/api/users/me/avatar' }));
    deleteAvatar = vi.fn().mockReturnValue(of(undefined));
    success = vi.fn();
    error = vi.fn();
    createObjectURL = vi.fn().mockReturnValue(PREVIEW_URL);
    revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL: createObjectURL, revokeObjectURL: revokeObjectURL });
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  describe('without a current avatar', () => {
    beforeEach(async () => {
      await createFixture({ avatarUrl: null });
    });

    it('shows the placeholder and hides the remove action', () => {
      expect(query('.avatar-modal__placeholder')).not.toBeNull();
      expect(query('.avatar-modal__image')).toBeNull();
      expect(query('.avatar-modal__remove')).toBeNull();
    });

    it('accepts only the formats the backend allows', () => {
      expect((query('.avatar-modal__input') as HTMLInputElement).accept).toBe(
        'image/jpeg,image/png,image/webp',
      );
    });

    it('keeps Save disabled until an image is chosen', () => {
      expect(buttonByText('Save').disabled).toBe(true);
    });

    it('previews a valid image and enables Save', async () => {
      const file: File = createImage();

      await chooseFile(file);

      expect(createObjectURL).toHaveBeenCalledWith(file);
      expect((query('.avatar-modal__image') as HTMLImageElement).getAttribute('src')).toBe(
        PREVIEW_URL,
      );
      expect(query('.avatar-modal__dropzone-title')!.textContent.trim()).toBe('avatar.png');
      expect(buttonByText('Save').disabled).toBe(false);
    });

    it('accepts an image dropped onto the dropzone', async () => {
      await dropFile(createImage());

      expect((query('.avatar-modal__image') as HTMLImageElement).getAttribute('src')).toBe(
        PREVIEW_URL,
      );
    });

    it('highlights the dropzone while a file is dragged over it', async () => {
      const dropzone: HTMLLabelElement = query('.avatar-modal__dropzone') as HTMLLabelElement;

      dropzone.dispatchEvent(new Event('dragover', { cancelable: true }));
      await fixture.whenStable();

      expect(dropzone.classList.contains('avatar-modal__dropzone--active')).toBe(true);

      dropzone.dispatchEvent(new Event('dragleave'));
      await fixture.whenStable();

      expect(dropzone.classList.contains('avatar-modal__dropzone--active')).toBe(false);
    });

    it('rejects an unsupported format', async () => {
      await chooseFile(createImage('image/gif', 1024, 'avatar.gif'));

      expect(query('.avatar-modal__error')!.textContent.trim()).toBe(AVATAR_MESSAGES.invalidType);
      expect(createObjectURL).not.toHaveBeenCalled();
      expect(buttonByText('Save').disabled).toBe(true);
    });

    it('rejects an image larger than the limit', async () => {
      await chooseFile(createImage('image/png', AVATAR_MAX_SIZE_BYTES + 1));

      expect(query('.avatar-modal__error')!.textContent.trim()).toBe(AVATAR_MESSAGES.tooLarge);
      expect(buttonByText('Save').disabled).toBe(true);
    });

    it('accepts an image exactly at the size limit', async () => {
      await chooseFile(createImage('image/jpeg', AVATAR_MAX_SIZE_BYTES, 'avatar.jpg'));

      expect(query('.avatar-modal__error')).toBeNull();
      expect(buttonByText('Save').disabled).toBe(false);
    });

    it('clears a previous error once a valid image is chosen', async () => {
      await chooseFile(createImage('image/gif'));
      await chooseFile(createImage());

      expect(query('.avatar-modal__error')).toBeNull();
    });

    it('revokes the previous preview when the image is replaced', async () => {
      createObjectURL.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');

      await chooseFile(createImage());
      await chooseFile(createImage());

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
      expect((query('.avatar-modal__image') as HTMLImageElement).getAttribute('src')).toBe(
        'blob:second',
      );
    });

    it('discards the selected image', async () => {
      await chooseFile(createImage());

      buttonByText('Discard selected image').click();
      await fixture.whenStable();

      expect(revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL);
      expect(query('.avatar-modal__placeholder')).not.toBeNull();
      expect(buttonByText('Save').disabled).toBe(true);
    });

    it('uploads the image and closes with it', async () => {
      const file: File = createImage();
      await chooseFile(file);

      buttonByText('Save').click();
      await fixture.whenStable();

      expect(uploadNewAvatar).toHaveBeenCalledWith(file);
      expect(success).toHaveBeenCalledWith(AVATAR_MESSAGES.uploaded);
      expect(close).toHaveBeenCalledWith({ avatar: file });
    });

    it('locks the controls while the upload is in flight', async () => {
      const upload$: Subject<unknown> = new Subject<unknown>();
      uploadNewAvatar.mockReturnValue(upload$);
      await chooseFile(createImage());

      buttonByText('Save').click();
      await fixture.whenStable();

      expect(buttonByText('Save').disabled).toBe(true);
      expect(buttonByText('Cancel').disabled).toBe(true);
      expect((query('.avatar-modal__input') as HTMLInputElement).disabled).toBe(true);

      upload$.next({});
      upload$.complete();
    });

    it('stays open and reports the error when the upload fails', async () => {
      uploadNewAvatar.mockReturnValue(throwError(() => new Error('Bad request')));
      await chooseFile(createImage());

      buttonByText('Save').click();
      await fixture.whenStable();

      expect(error).toHaveBeenCalledWith(AVATAR_MESSAGES.uploadFailed);
      expect(close).not.toHaveBeenCalled();
      expect(buttonByText('Save').disabled).toBe(false);
    });

    it('closes without a result on Cancel', () => {
      buttonByText('Cancel').click();

      expect(close).toHaveBeenCalledWith();
    });

    it('revokes the preview when the modal is destroyed', async () => {
      await chooseFile(createImage());

      fixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL);
    });
  });

  describe('with a current avatar', () => {
    beforeEach(async () => {
      await createFixture({ avatarUrl: CURRENT_AVATAR_URL });
    });

    it('shows the current avatar', () => {
      expect((query('.avatar-modal__image') as HTMLImageElement).getAttribute('src')).toBe(
        CURRENT_AVATAR_URL,
      );
    });

    it('hides the remove action while a new image is selected', async () => {
      expect(query('.avatar-modal__remove')).not.toBeNull();

      await chooseFile(createImage());

      expect(query('.avatar-modal__remove')).toBeNull();
    });

    it('removes the avatar and closes with an empty avatar', async () => {
      buttonByText('Remove photo').click();
      await fixture.whenStable();

      expect(deleteAvatar).toHaveBeenCalledTimes(1);
      expect(success).toHaveBeenCalledWith(AVATAR_MESSAGES.removed);
      expect(close).toHaveBeenCalledWith({ avatar: null });
    });

    it('treats an empty delete response as success', async () => {
      deleteAvatar.mockReturnValue(of());

      buttonByText('Remove photo').click();
      await fixture.whenStable();

      expect(close).toHaveBeenCalledWith({ avatar: null });
    });

    it('stays open and reports the error when removing fails', async () => {
      deleteAvatar.mockReturnValue(throwError(() => new Error('Server error')));

      buttonByText('Remove photo').click();
      await fixture.whenStable();

      expect(error).toHaveBeenCalledWith(AVATAR_MESSAGES.removeFailed);
      expect(close).not.toHaveBeenCalled();
      expect(buttonByText('Remove photo').disabled).toBe(false);
    });
  });
});
