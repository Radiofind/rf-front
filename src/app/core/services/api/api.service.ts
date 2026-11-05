import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { tap } from 'rxjs';
import { AuthStateService } from '../../../features/services/auth-state-service/auth-state.service';
import { EndpointConstants } from '../../constants/endpoints.constants';
import { skipGlobalLoader } from '../../tokens/loader/loader.token';
import { Constants } from '../../constants/constants';

import type { Observable } from 'rxjs';
import type {
  IAuthEndpoints,
  IAuthResponse,
  IForgotPasswordData,
  ILoginData,
  IResendTwoFactorData,
  IResetPasswordData,
  IResetTokenValidResponse,
  IResetTokenValidData,
  ITwoFactorData,
  ITwoFactorResponse,
} from '../../models/auth.model';
import type { IRegisterData } from '../../../features/models/auth-content.model';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserEndpoints,
  IUserProfileData,
} from '../../models/user.model';
import type { IGeneralSettings } from '../../models/settings.model';
import type { ITrack, ITrackEndpoints, IUploadTrackData } from '../../models/track.model';
import type { IActivity } from '../../models/activity.model';
import type { INotification, IUnreadNotifications } from '../../models/notification.model';
import type { IPage } from '../../models/page.model';

@Service()
export class ApiService {
  private readonly authEndpoints: IAuthEndpoints = EndpointConstants.AUTH_ENDPOINTS;

  private readonly userEndpoints: IUserEndpoints = EndpointConstants.USER_ENDPOINTS;

  private readonly authApi: string = `${environment.apiUrl}${this.authEndpoints.auth}`;

  private readonly userApi: string = `${environment.apiUrl}${this.userEndpoints.users}`;

  private readonly currentUserApi: string = `${this.userApi}${this.userEndpoints.me}`;

  private readonly generalSettingsApi: string = `${this.currentUserApi}${this.userEndpoints.settings}${this.userEndpoints.general}`;

  private readonly trackEndpoints: ITrackEndpoints = EndpointConstants.TRACK_ENDPOINTS;

  private readonly tracksApi: string = `${environment.apiUrl}${this.trackEndpoints.tracks}`;

  private readonly activitiesApi: string = `${this.currentUserApi}${this.userEndpoints.activities}`;

  private readonly notificationsApi: string = `${this.currentUserApi}${this.userEndpoints.notifications}`;

  private readonly http: HttpClient = inject(HttpClient);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.authApi}${this.authEndpoints.register}`, data)
      .pipe(
        tap((response: IAuthResponse) => {
          this.authStateService.setToken(String(response.token));
        }),
      );
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.authApi}${this.authEndpoints.login}`, data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<IAuthResponse> {
    return this.http
      .post<ITwoFactorResponse>(`${this.authApi}${this.authEndpoints.twoFactorAuth}`, data)
      .pipe(
        tap((response: ITwoFactorResponse) => {
          this.authStateService.setToken(response.token);
        }),
      );
  }

  public resendTwoFactorAuth(data: IResendTwoFactorData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(
      `${this.authApi}${this.authEndpoints.resendTwoFactorAuth}`,
      data,
      { context: skipGlobalLoader() },
    );
  }

  public forgetPassword(data: IForgotPasswordData): Observable<unknown> {
    return this.http.post(`${this.authApi}${this.authEndpoints.forgotPassword}`, data);
  }

  public resetTokenValidation(data: IResetTokenValidData): Observable<IResetTokenValidResponse> {
    return this.http.post<IResetTokenValidResponse>(
      `${this.authApi}${this.authEndpoints.validateResetToken}`,
      data,
    );
  }

  public resetPassword(data: IResetPasswordData): Observable<unknown> {
    return this.http.post(`${this.authApi}${this.authEndpoints.resetPassword}`, data);
  }

  public getCurrentUserData(): Observable<ICurrentUser> {
    return this.http.get<ICurrentUser>(this.currentUserApi);
  }

  public getUserProfileData(): Observable<IUserProfileData> {
    return this.http.get<IUserProfileData>(`${this.currentUserApi}${this.userEndpoints.profile}`);
  }

  public updateUserProfileData(data: IUpdateProfileData): Observable<IUpdatedProfileData> {
    return this.http.put<IUpdatedProfileData>(
      `${this.currentUserApi}${this.userEndpoints.profile}`,
      data,
    );
  }

  public uploadNewAvatar(file: File): Observable<IAvatarResponse> {
    const formData: FormData = new FormData();
    formData.append(Constants.FILE_FORM_DATA, file);
    return this.http.post<IAvatarResponse>(
      `${this.currentUserApi}${this.userEndpoints.avatar}`,
      formData,
    );
  }

  public getCurrentAvatar(): Observable<Blob> {
    return this.http.get(`${this.currentUserApi}${this.userEndpoints.avatar}`, {
      responseType: 'blob',
    });
  }

  public deleteAvatar(): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.delete<void>(`${this.currentUserApi}${this.userEndpoints.avatar}`);
  }

  public getGeneralSettings(): Observable<IGeneralSettings> {
    return this.http.get<IGeneralSettings>(this.generalSettingsApi);
  }

  public updateGeneralSettings(settings: IGeneralSettings): Observable<IGeneralSettings> {
    return this.http.put<IGeneralSettings>(this.generalSettingsApi, settings, {
      context: skipGlobalLoader(),
    });
  }

  public uploadTrack(data: IUploadTrackData): Observable<ITrack> {
    const formData: FormData = new FormData();
    formData.append(Constants.TITLE_FORM_DATA, data.title);
    data.genres.forEach((genre: string) => {
      formData.append(Constants.GENRES_FORM_DATA, genre);
    });
    formData.append(Constants.AUDIO_FORM_DATA, data.audio);

    if (data.description) {
      formData.append(Constants.DESCRIPTION_FORM_DATA, data.description);
    }

    if (data.cover) {
      formData.append(Constants.COVER_FORM_DATA, data.cover);
    }

    return this.http.post<ITrack>(this.tracksApi, formData);
  }

  public getActivities(page: number, size: number): Observable<IPage<IActivity>> {
    return this.http.get<IPage<IActivity>>(this.activitiesApi, {
      params: this.pageParams(page, size),
    });
  }

  public getNotifications(page: number, size: number): Observable<IPage<INotification>> {
    return this.http.get<IPage<INotification>>(this.notificationsApi, {
      params: this.pageParams(page, size),
      context: skipGlobalLoader(),
    });
  }

  public getUnreadNotifications(): Observable<IUnreadNotifications> {
    return this.http.get<IUnreadNotifications>(
      `${this.notificationsApi}${this.userEndpoints.unreadCount}`,
      { context: skipGlobalLoader() },
    );
  }

  public markAllNotificationsAsRead(): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.post<void>(`${this.notificationsApi}${this.userEndpoints.readAll}`, null, {
      context: skipGlobalLoader(),
    });
  }

  private pageParams(page: number, size: number): HttpParams {
    return new HttpParams()
      .set(Constants.PAGE_QUERY_PARAM, page)
      .set(Constants.SIZE_QUERY_PARAM, size);
  }
}
