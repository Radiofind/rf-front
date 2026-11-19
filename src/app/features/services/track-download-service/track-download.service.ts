import { DOCUMENT, inject, PLATFORM_ID, Service } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import { TrackService } from '../track-service/track.service';

import type { ITrack } from '../../../core/models/track.model';

@Service()
export class TrackDownloadService {
  private readonly trackService: TrackService = inject(TrackService);

  private readonly document: Document = inject(DOCUMENT);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  public download(track: ITrack): void {
    if (!this.isBrowser || !track.audioUrl) {
      return;
    }

    const link: HTMLAnchorElement = this.document.createElement('a');
    link.href = `${track.audioUrl}${Constants.DOWNLOAD_QUERY_SUFFIX}`;
    link.rel = 'noopener';
    link.click();

    // A lost count must never get in the way of the file itself
    this.trackService.recordDownload(track.id).subscribe({ error: () => undefined });
  }
}
