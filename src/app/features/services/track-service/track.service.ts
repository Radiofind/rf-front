import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { IOwnTracksQuery, ITrack, IUploadTrackData } from '../../../core/models/track.model';
import type { IPage } from '../../../core/models/page.model';

@Service()
export class TrackService {
  private readonly apiService: ApiService = inject(ApiService);

  public uploadTrack(data: IUploadTrackData): Observable<ITrack> {
    return this.apiService.uploadTrack(data);
  }

  public getOwnTracks(query: IOwnTracksQuery): Observable<IPage<ITrack>> {
    return this.apiService.getOwnTracks(query);
  }
}
