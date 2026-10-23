import { inject, Service, signal } from '@angular/core';
import { catchError, shareReplay, tap, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api/api.service';
import { AuthStateService } from '../auth-state-service/auth-state.service';

import type { Signal, WritableSignal } from '@angular/core';
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

  private currentUserToken: WritableSignal<string | null | undefined> = signal<
    string | null | undefined
  >(null);

  private readonly currentUserState: WritableSignal<ICurrentUser | null> =
    signal<ICurrentUser | null>(null);

  public readonly currentUser: Signal<ICurrentUser | null> = this.currentUserState.asReadonly();

  public getCurrentUserData(): Observable<ICurrentUser> {
    const token: string | null | undefined = this.authStateService.getToken();

    if (!this.currentUser$ || token !== this.currentUserToken()) {
      this.currentUserToken.set(token);
      this.currentUser$ = this.apiService.getCurrentUserData().pipe(
        tap((user: ICurrentUser) => {
          this.currentUserState.set(user);
        }),
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
    return this.apiService.updateUserProfileData(data).pipe(
      tap(({ profile }: IUpdatedProfileData) => {
        this.resetCurrentUser();
        this.currentUserState.set({
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
        });
      }),
    );
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
