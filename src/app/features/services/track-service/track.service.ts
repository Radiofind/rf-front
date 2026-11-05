import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { ITrack, IUploadTrackData } from '../../../core/models/track.model';

@Service()
export class TrackService {
  private readonly apiService: ApiService = inject(ApiService);

  public uploadTrack(data: IUploadTrackData): Observable<ITrack> {
    return this.apiService.uploadTrack(data);
  }
}
