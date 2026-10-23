import { inject, Service } from '@angular/core';
import { catchError, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api/api.service';
import { AuthStateService } from '../auth-state-service/auth-state.service';

import type { Observable } from 'rxjs';
import type {
  IAvatarResponse,
  ICurrentUser,
  IUpdatedProfileData,
  IUpdateProfileData,
  IUserProfileData,
} from '../../../core/models/user.model';
import type { IGeneralSettings } from '../../../core/models/settings.model';

@Service()
export class UserService {
  private readonly apiService: ApiService = inject(ApiService);

  private readonly authStateService: AuthStateService = inject(AuthStateService);

  private currentUser$: Observable<ICurrentUser> | null = null;

  private currentUserToken: string | null | undefined = null;

  public getCurrentUserData(): Observable<ICurrentUser> {
    const token: string | null | undefined = this.authStateService.getToken();

    if (!this.currentUser$ || token !== this.currentUserToken) {
      this.currentUserToken = token;
      this.currentUser$ = this.apiService.getCurrentUserData().pipe(
        catchError((error: unknown) => {
          this.resetCurrentUser();
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }

    return this.currentUser$;
  }

  public getUserProfileData(): Observable<IUserProfileData> {
    return this.apiService.getUserProfileData();
  }

  public updateUserProfileData(data: IUpdateProfileData): Observable<IUpdatedProfileData> {
    return this.apiService.updateUserProfileData(data).pipe(tap(() => this.resetCurrentUser()));
  }

  public uploadNewAvatar(file: File): Observable<IAvatarResponse> {
    return this.apiService.uploadNewAvatar(file).pipe(tap(() => this.resetCurrentUser()));
  }

  public getCurrentAvatar(): Observable<Blob> {
    return this.apiService.getCurrentAvatar();
  }

  public deleteAvatar(): Observable<void> {
    return this.apiService.deleteAvatar().pipe(tap(() => this.resetCurrentUser()));
  }

  public getGeneralSettings(): Observable<IGeneralSettings> {
    return this.apiService.getGeneralSettings();
  }

  public updateGeneralSettings(settings: IGeneralSettings): Observable<IGeneralSettings> {
    return this.apiService.updateGeneralSettings(settings);
  }

  private resetCurrentUser(): void {
    this.currentUser$ = null;
  }
}
