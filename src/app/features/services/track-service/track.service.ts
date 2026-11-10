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

  public recordPlay(trackId: number): Observable<void> {
    return this.apiService.recordTrackPlay(trackId);
  }

  public setLiked(trackId: number, liked: boolean): Observable<void> {
    return liked ? this.apiService.likeTrack(trackId) : this.apiService.unlikeTrack(trackId);
  }
}
