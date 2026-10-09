import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUserProfileData,
} from '../../../core/models/user.model';

@Service()
export class UserService {
  private readonly apiService: ApiService = inject(ApiService);

  public getCurrentUserData(): Observable<ICurrentUser> {
    return this.apiService.getCurrentUserData();
  }

  public getUserProfileData(): Observable<IUserProfileData> {
    return this.apiService.getUserProfileData();
  }

  public uploadNewAvatar(file: File): Observable<IAvatarResponse> {
    return this.apiService.uploadNewAvatar(file);
  }

  public getCurrentAvatar(): Observable<Blob> {
    return this.apiService.getCurrentAvatar();
  }

  public deleteAvatar(): Observable<void> {
    return this.apiService.deleteAvatar();
  }
}
