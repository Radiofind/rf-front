import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../../core/models/user.model';
import type {
  IBackupCodes,
  IGeneralSettings,
  INotificationSettings,
  ISecurityOverview,
  ITwoFactorEnrollment,
} from '../../../core/models/settings.model';
import type { TwoFactorMethod } from '../../../core/types/two-factor-method.type';
import type { IActivity } from '../../../core/models/activity.model';
import type { INotification, IUnreadNotifications } from '../../../core/models/notification.model';
import type { IPage } from '../../../core/models/page.model';

@Service()
export class UserService {
  private readonly apiService: ApiService = inject(ApiService);

  public getCurrentUserData(): Observable<ICurrentUser> {
    return this.apiService.getCurrentUserData();
  }

  public getUserProfileData(): Observable<IUserProfileData> {
    return this.apiService.getUserProfileData();
  }

  public updateUserProfileData(data: IUpdateProfileData): Observable<IUpdatedProfileData> {
    return this.apiService.updateUserProfileData(data);
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

  public getGeneralSettings(): Observable<IGeneralSettings> {
    return this.apiService.getGeneralSettings();
  }

  public updateGeneralSettings(settings: IGeneralSettings): Observable<IGeneralSettings> {
    return this.apiService.updateGeneralSettings(settings);
  }

  public getActivities(page: number, size: number): Observable<IPage<IActivity>> {
    return this.apiService.getActivities(page, size);
  }

  public getNotifications(page: number, size: number): Observable<IPage<INotification>> {
    return this.apiService.getNotifications(page, size);
  }

  public getUnreadNotifications(): Observable<IUnreadNotifications> {
    return this.apiService.getUnreadNotifications();
  }

  public markAllNotificationsAsRead(): Observable<void> {
    return this.apiService.markAllNotificationsAsRead();
  }

  public getNotificationSettings(): Observable<INotificationSettings> {
    return this.apiService.getNotificationSettings();
  }

  public updateNotificationSettings(
    settings: INotificationSettings,
  ): Observable<INotificationSettings> {
    return this.apiService.updateNotificationSettings(settings);
  }

  public getSecurityOverview(): Observable<ISecurityOverview> {
    return this.apiService.getSecurityOverview();
  }

  public startTwoFactorEnrollment(
    method: TwoFactorMethod,
    password: string,
  ): Observable<ITwoFactorEnrollment> {
    return this.apiService.startTwoFactorEnrollment({ method: method, password: password });
  }

  public confirmTwoFactorEnrollment(code: string): Observable<ISecurityOverview> {
    return this.apiService.confirmTwoFactorEnrollment({ code: code });
  }

  public regenerateBackupCodes(password: string): Observable<IBackupCodes> {
    return this.apiService.regenerateBackupCodes({ password: password });
  }

  public deleteAccount(password: string): Observable<void> {
    return this.apiService.deleteAccount({ password: password });
  }
}
