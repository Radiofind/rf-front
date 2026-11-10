import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type {
  IEditTrackData,
  IOwnTracksQuery,
  IPendingScheduleChange,
  IPlaybackSchedule,
  IRejectionReason,
  IScheduleChangeData,
  ITrack,
  ITrackDetails,
  ITrackStatistics,
  IUploadTrackData,
} from '../../../core/models/track.model';
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

  public getDetails(trackId: number): Observable<ITrackDetails> {
    return this.apiService.getTrackDetails(trackId);
  }

  public edit(trackId: number, data: IEditTrackData): Observable<ITrackDetails> {
    return this.apiService.editTrack(trackId, data);
  }

  public cancelSubmission(trackId: number): Observable<void> {
    return this.apiService.cancelTrackSubmission(trackId);
  }

  public submitForReview(trackId: number): Observable<void> {
    return this.apiService.submitTrack(trackId);
  }

  public delete(trackId: number): Observable<void> {
    return this.apiService.deleteTrack(trackId);
  }

  public getStatistics(trackId: number): Observable<ITrackStatistics> {
    return this.apiService.getTrackStatistics(trackId);
  }

  public getSchedule(trackId: number): Observable<IPlaybackSchedule> {
    return this.apiService.getPlaybackSchedule(trackId);
  }

  public requestScheduleChange(
    trackId: number,
    data: IScheduleChangeData,
  ): Observable<IPendingScheduleChange> {
    return this.apiService.requestScheduleChange(trackId, data);
  }

  public getRejectionReason(trackId: number): Observable<IRejectionReason> {
    return this.apiService.getRejectionReason(trackId);
  }
}
