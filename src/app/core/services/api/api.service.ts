import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
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
import type {
  IBackupCodes,
  IGeneralSettings,
  INotificationSettings,
  IConfirmTwoFactorEnrollmentData,
  IPasswordConfirmationData,
  ISecurityOverview,
  IStartTwoFactorEnrollmentData,
  ITwoFactorEnrollment,
} from '../../models/settings.model';
import type {
  IEditTrackData,
  ILibraryQuery,
  IOwnTracksQuery,
  IPendingScheduleChange,
  IPlaybackSchedule,
  IRejectionReason,
  IScheduleChangeData,
  ITrack,
  ITrackDetails,
  ITrackEndpoints,
  ITrackReportData,
  ITrackStatistics,
  IUploadTrackData,
} from '../../models/track.model';
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

  private readonly notificationSettingsApi: string = `${this.currentUserApi}${this.userEndpoints.settings}${this.userEndpoints.notifications}`;

  private readonly securityApi: string = `${this.currentUserApi}${this.userEndpoints.security}`;

  private readonly twoFactorEnrollmentApi: string = `${this.securityApi}${this.userEndpoints.twoFactor}${this.userEndpoints.enrollment}`;

  private readonly trackEndpoints: ITrackEndpoints = EndpointConstants.TRACK_ENDPOINTS;

  private readonly tracksApi: string = `${environment.apiUrl}${this.trackEndpoints.tracks}`;

  private readonly activitiesApi: string = `${this.currentUserApi}${this.userEndpoints.activities}`;

  private readonly notificationsApi: string = `${this.currentUserApi}${this.userEndpoints.notifications}`;

  private readonly ownTracksApi: string = `${this.currentUserApi}${this.userEndpoints.tracks}`;

  private readonly libraryApi: string = `${this.currentUserApi}${this.userEndpoints.library}`;

  private readonly http: HttpClient = inject(HttpClient);

  public register(data: IRegisterData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.authApi}${this.authEndpoints.register}`, data);
  }

  public login(data: ILoginData): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.authApi}${this.authEndpoints.login}`, data);
  }

  public twoFactorAuth(data: ITwoFactorData): Observable<ITwoFactorResponse> {
    return this.http.post<ITwoFactorResponse>(
      `${this.authApi}${this.authEndpoints.twoFactorAuth}`,
      data,
    );
  }

  public verifyBackupCode(data: ITwoFactorData): Observable<ITwoFactorResponse> {
    return this.http.post<ITwoFactorResponse>(
      `${this.authApi}${this.authEndpoints.verifyBackupCode}`,
      data,
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

  public getNotificationSettings(): Observable<INotificationSettings> {
    return this.http.get<INotificationSettings>(this.notificationSettingsApi);
  }

  public updateNotificationSettings(
    settings: INotificationSettings,
  ): Observable<INotificationSettings> {
    return this.http.put<INotificationSettings>(this.notificationSettingsApi, settings, {
      context: skipGlobalLoader(),
    });
  }

  public getSecurityOverview(): Observable<ISecurityOverview> {
    return this.http.get<ISecurityOverview>(this.securityApi);
  }

  public startTwoFactorEnrollment(
    data: IStartTwoFactorEnrollmentData,
  ): Observable<ITwoFactorEnrollment> {
    return this.http.post<ITwoFactorEnrollment>(this.twoFactorEnrollmentApi, data);
  }

  public confirmTwoFactorEnrollment(
    data: IConfirmTwoFactorEnrollmentData,
  ): Observable<ISecurityOverview> {
    return this.http.post<ISecurityOverview>(
      `${this.twoFactorEnrollmentApi}${this.userEndpoints.confirm}`,
      data,
    );
  }

  public regenerateBackupCodes(data: IPasswordConfirmationData): Observable<IBackupCodes> {
    return this.http.post<IBackupCodes>(
      `${this.securityApi}${this.userEndpoints.backupCodes}`,
      data,
    );
  }

  public deleteAccount(data: IPasswordConfirmationData): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.delete<void>(this.currentUserApi, { body: data });
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

  public getOwnTracks(query: IOwnTracksQuery): Observable<IPage<ITrack>> {
    let params: HttpParams = this.pageParams(query.page, query.size)
      .set(Constants.SORT_QUERY_PARAM, query.sort)
      .set(Constants.DIRECTION_QUERY_PARAM, query.direction);

    if (query.status) {
      params = params.set(Constants.STATUS_QUERY_PARAM, query.status);
    }

    if (query.search) {
      params = params.set(Constants.SEARCH_QUERY_PARAM, query.search);
    }

    return this.http.get<IPage<ITrack>>(this.ownTracksApi, {
      params: params,
      context: skipGlobalLoader(),
    });
  }

  public getLibrary(query: ILibraryQuery): Observable<IPage<ITrack>> {
    let params: HttpParams = this.pageParams(query.page, query.size)
      .set(Constants.SORT_QUERY_PARAM, query.sort)
      .set(Constants.DIRECTION_QUERY_PARAM, query.direction);

    if (query.search) {
      params = params.set(Constants.SEARCH_QUERY_PARAM, query.search);
    }

    return this.http.get<IPage<ITrack>>(this.libraryApi, {
      params: params,
      context: skipGlobalLoader(),
    });
  }

  public getLibraryTrackDetails(trackId: number): Observable<ITrackDetails> {
    return this.http.get<ITrackDetails>(`${this.libraryApi}/${String(trackId)}`, {
      context: skipGlobalLoader(),
    });
  }

  public reportTrack(trackId: number, data: ITrackReportData): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.post<void>(
      `${this.tracksApi}/${String(trackId)}${this.trackEndpoints.reports}`,
      data,
    );
  }

  public recordTrackPlay(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.post<void>(
      `${this.tracksApi}/${String(trackId)}${this.trackEndpoints.plays}`,
      null,
      {
        context: skipGlobalLoader(),
      },
    );
  }

  public likeTrack(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.put<void>(
      `${this.tracksApi}/${String(trackId)}${this.trackEndpoints.like}`,
      null,
      {
        context: skipGlobalLoader(),
      },
    );
  }

  public unlikeTrack(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.delete<void>(
      `${this.tracksApi}/${String(trackId)}${this.trackEndpoints.like}`,
      {
        context: skipGlobalLoader(),
      },
    );
  }

  public getTrackDetails(trackId: number): Observable<ITrackDetails> {
    return this.http.get<ITrackDetails>(this.ownTrackApi(trackId), { context: skipGlobalLoader() });
  }

  public editTrack(trackId: number, data: IEditTrackData): Observable<ITrackDetails> {
    const formData: FormData = new FormData();
    formData.append(Constants.TITLE_FORM_DATA, data.title);
    data.genres.forEach((genre: string) => {
      formData.append(Constants.GENRES_FORM_DATA, genre);
    });
    formData.append(Constants.REMOVE_COVER_FORM_DATA, String(data.removeCover));

    if (data.description) {
      formData.append(Constants.DESCRIPTION_FORM_DATA, data.description);
    }

    if (data.cover) {
      formData.append(Constants.COVER_FORM_DATA, data.cover);
    }

    return this.http.put<ITrackDetails>(this.ownTrackApi(trackId), formData);
  }

  public cancelTrackSubmission(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.post<void>(
      `${this.ownTrackApi(trackId)}${this.trackEndpoints.cancelSubmission}`,
      null,
    );
  }

  public submitTrack(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.post<void>(`${this.ownTrackApi(trackId)}${this.trackEndpoints.submit}`, null);
  }

  public deleteTrack(trackId: number): Observable<void> {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    return this.http.delete<void>(this.ownTrackApi(trackId));
  }

  public getTrackStatistics(trackId: number): Observable<ITrackStatistics> {
    return this.http.get<ITrackStatistics>(
      `${this.ownTrackApi(trackId)}${this.trackEndpoints.statistics}`,
      { context: skipGlobalLoader() },
    );
  }

  public getPlaybackSchedule(trackId: number): Observable<IPlaybackSchedule> {
    return this.http.get<IPlaybackSchedule>(
      `${this.ownTrackApi(trackId)}${this.trackEndpoints.schedule}`,
      { context: skipGlobalLoader() },
    );
  }

  public requestScheduleChange(
    trackId: number,
    data: IScheduleChangeData,
  ): Observable<IPendingScheduleChange> {
    return this.http.post<IPendingScheduleChange>(
      `${this.ownTrackApi(trackId)}${this.trackEndpoints.scheduleChangeRequests}`,
      data,
    );
  }

  public getRejectionReason(trackId: number): Observable<IRejectionReason> {
    return this.http.get<IRejectionReason>(
      `${this.ownTrackApi(trackId)}${this.trackEndpoints.rejection}`,
      { context: skipGlobalLoader() },
    );
  }

  private ownTrackApi(trackId: number): string {
    return `${this.ownTracksApi}/${String(trackId)}`;
  }

  private pageParams(page: number, size: number): HttpParams {
    return new HttpParams()
      .set(Constants.PAGE_QUERY_PARAM, page)
      .set(Constants.SIZE_QUERY_PARAM, size);
  }
}
