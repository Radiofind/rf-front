import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FileDropzoneComponent } from './file-dropzone.component';

import type { Mock } from 'vitest';
import type { ComponentFixture } from '@angular/core/testing';
import type { ValidationError } from '@angular/forms/signals';

describe('FileDropzoneComponent', () => {
  const PREVIEW_URL: string = 'blob:cover-preview';

  let fixture: ComponentFixture<FileDropzoneComponent>;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let touch: Mock<() => void>;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const text = (selector: string): string =>
    element().querySelector(selector)?.textContent.trim() ?? '';

  const fileOf = (name: string, sizeBytes: number = 1024): File => {
    const file: File = new File(['content'], name);
    Object.defineProperty(file, 'size', { value: sizeBytes });
    return file;
  };

  const createFixture = async (inputs: Record<string, unknown> = {}): Promise<void> => {
    await TestBed.configureTestingModule({ imports: [FileDropzoneComponent] }).compileComponents();

    fixture = TestBed.createComponent(FileDropzoneComponent);
    fixture.componentRef.setInput('fieldId', 'track-audio');
    fixture.componentRef.setInput('dropzoneTitle', 'Drag and drop your audio file here');
    fixture.componentRef.setInput('dropzoneAction', 'or click to browse');
    fixture.componentRef.setInput('dropzoneHint', 'MP3, WAV, FLAC (max 100 MB)');
    Object.entries(inputs).forEach(([name, value]) => {
      fixture.componentRef.setInput(name, value);
    });
    fixture.componentInstance.touch.subscribe(touch);
    await fixture.whenStable();
  };

  const chooseFile = async (file: File): Promise<void> => {
    const input: HTMLInputElement = element().querySelector('.dropzone__input')!;
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
    element().querySelector('.dropzone__area')!.dispatchEvent(event);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    touch = vi.fn<() => void>();
    createObjectURL = vi.fn().mockReturnValue(PREVIEW_URL);
    revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL: createObjectURL, revokeObjectURL: revokeObjectURL });
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  it('invites the user to drop or browse while no file is chosen', async () => {
    await createFixture();

    expect(text('.dropzone__title')).toBe('Drag and drop your audio file here');
    expect(text('.dropzone__action')).toBe('or click to browse');
    expect(text('.dropzone__hint')).toBe('MP3, WAV, FLAC (max 100 MB)');
    expect(element().querySelector('.dropzone__remove')).toBeNull();
  });

  it('takes a file chosen in the file dialog and marks the field touched', async () => {
    await createFixture();
    const file: File = fileOf('song.mp3');

    await chooseFile(file);

    expect(fixture.componentInstance.value()).toBe(file);
    expect(touch).toHaveBeenCalledOnce();
  });

  it('takes a dropped file', async () => {
    await createFixture();
    const file: File = fileOf('song.flac');

    await dropFile(file);

    expect(fixture.componentInstance.value()).toBe(file);
  });

  it('ignores a dropped file while disabled', async () => {
    await createFixture({ disabled: true });

    await dropFile(fileOf('song.flac'));

    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('shows the name and size of the chosen file', async () => {
    await createFixture();

    await chooseFile(fileOf('song.mp3', 5 * 1024 * 1024));

    expect(text('.dropzone__title')).toBe('song.mp3');
    expect(text('.dropzone__hint')).toBe('5.0 MB · Click or drop another file to replace it');
  });

  it('removes the chosen file', async () => {
    await createFixture();
    await chooseFile(fileOf('song.mp3'));

    element().querySelector<HTMLButtonElement>('.dropzone__remove')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(touch).toHaveBeenCalledTimes(2);
  });

  it('previews a chosen image and releases the preview once the image is removed', async () => {
    await createFixture({ hasImagePreview: true });
    const file: File = fileOf('cover.png');

    await chooseFile(file);

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(element().querySelector('.dropzone__preview')!.getAttribute('src')).toBe(PREVIEW_URL);

    element().querySelector<HTMLButtonElement>('.dropzone__remove')!.click();
    await fixture.whenStable();

    expect(revokeObjectURL).toHaveBeenCalledWith(PREVIEW_URL);
    expect(element().querySelector('.dropzone__preview')).toBeNull();
  });

  it('does not preview a file when the preview is off', async () => {
    await createFixture();

    await chooseFile(fileOf('song.mp3'));

    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('shows the errors only once the field was touched', async () => {
    const errors: ValidationError[] = [{ kind: 'fileType', message: 'validation.audioType' }];
    await createFixture({ errors: errors });

    expect(text('.dropzone__errors')).toBe('');

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    expect(text('.dropzone__errors')).toBe('Only MP3, WAV and FLAC files are allowed');
    expect(element().querySelector('.dropzone--invalid')).not.toBeNull();
  });
});
