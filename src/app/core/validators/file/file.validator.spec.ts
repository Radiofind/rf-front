import { describe, expect, it } from 'vitest';
import { fileError } from './file.validator';
import { Constants } from '../../constants/constants';

import type { IFileRules } from '../../models/file-rules.model';

describe('fileError', () => {
  const rules: IFileRules = {
    extensions: ['.mp3', '.flac'],
    maxSizeMb: 1,
    invalidTypeMessage: 'validation.audioType',
    tooLargeMessage: 'validation.audioTooLarge',
  };

  const fileOf = (name: string, sizeBytes: number): File => {
    const file: File = new File(['x'], name);
    Object.defineProperty(file, 'size', { value: sizeBytes });
    return file;
  };

  it('accepts a missing file because presence is a separate rule', () => {
    expect(fileError(null, rules)).toBeUndefined();
  });

  it('accepts an allowed extension regardless of its case', () => {
    expect(fileError(fileOf('Song.FLAC', 10), rules)).toBeUndefined();
  });

  it('accepts a file exactly at the size limit', () => {
    expect(fileError(fileOf('song.mp3', Constants.BYTES_IN_MEGABYTE), rules)).toBeUndefined();
  });

  it('rejects an extension outside the allowed list', () => {
    expect(fileError(fileOf('song.mp3.exe', 10), rules)).toEqual({
      kind: Constants.FILE_TYPE_PROPERTY,
      message: 'validation.audioType',
    });
  });

  it('rejects a file above the size limit and names the limit', () => {
    expect(fileError(fileOf('song.mp3', Constants.BYTES_IN_MEGABYTE + 1), rules)).toEqual({
      kind: Constants.FILE_SIZE_PROPERTY,
      message: 'validation.audioTooLarge',
      params: { size: 1 },
    });
  });
});
