import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { IPage } from '../../../core/models/page.model';
import type { IPublicProfile } from '../../../core/models/public-profile.model';
import type { ITrack } from '../../../core/models/track.model';

@Service()
export class PublicProfileService {
  private readonly apiService: ApiService = inject(ApiService);

  public getProfile(publicId: string): Observable<IPublicProfile> {
    return this.apiService.getPublicProfile(publicId);
  }

  public getAvatar(publicId: string): Observable<Blob> {
    return this.apiService.getPublicAvatar(publicId);
  }

  public getTracks(publicId: string, page: number, size: number): Observable<IPage<ITrack>> {
    return this.apiService.getPublicTracks(publicId, page, size);
  }

  public follow(publicId: string): Observable<void> {
    return this.apiService.followUser(publicId);
  }

  public unfollow(publicId: string): Observable<void> {
    return this.apiService.unfollowUser(publicId);
  }
}
