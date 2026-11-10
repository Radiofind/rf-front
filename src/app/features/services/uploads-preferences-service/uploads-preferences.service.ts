import { inject, PLATFORM_ID, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import { UPLOADS_PAGE_SIZE_OPTIONS } from '../../constants/my-uploads.constant';

import type { ISelectOption } from '../../../shared/models/select-option.model';

@Service()
export class UploadsPreferencesService {
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  public readPageSize(): number | null {
    if (!this.isBrowser) {
      return null;
    }

    const stored: string | null = localStorage.getItem(Constants.UPLOADS_PAGE_SIZE_KEY);
    const isOffered: boolean = UPLOADS_PAGE_SIZE_OPTIONS.some(
      (option: ISelectOption<string>) => option.value === stored,
    );

    return isOffered ? Number(stored) : null;
  }

  public writePageSize(size: number): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.UPLOADS_PAGE_SIZE_KEY, String(size));
    }
  }
}
