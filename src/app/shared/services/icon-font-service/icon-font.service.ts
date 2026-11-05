import { DOCUMENT, inject, PLATFORM_ID, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import { LoaderService } from '../loader-service/loader.service';

@Service()
export class IconFontService {
  private readonly document: Document = inject(DOCUMENT);

  private readonly loaderService: LoaderService = inject(LoaderService);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  public init(): void {
    if (!this.isBrowser) {
      return;
    }

    this.loaderService.show();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeout: Promise<void> = new Promise<void>((resolve) => {
      timeoutId = setTimeout(resolve, Constants.ICON_FONT_LOAD_TIMEOUT_MS);
    });

    void Promise.race([this.loadIconFonts(), timeout]).then(() => {
      clearTimeout(timeoutId);
      this.loaderService.hide();
    });
  }

  private loadIconFonts(): Promise<unknown> {
    return Promise.allSettled(
      Constants.ICON_FONT_FAMILIES.map((family: string) =>
        this.document.fonts.load(`${Constants.ICON_FONT_SIZE} "${family}"`),
      ),
    );
  }
}
