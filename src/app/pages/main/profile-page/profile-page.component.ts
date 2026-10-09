import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProfileHeroComponent } from '../../../features/components/profile/profile-hero/profile-hero.component';
import { ProfileStatsComponent } from '../../../features/components/profile/profile-stats/profile-stats.component';
import { ProfileDetailsComponent } from '../../../features/components/profile/profile-details/profile-details.component';
import { LatestActivityComponent } from '../../../features/components/profile/latest-activity/latest-activity.component';
import { UserService } from '../../../features/services/user-service/user.service';
import { Constants } from '../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../core/enums/artist-type.enum';
import { DateFormatEnum } from '../../../core/enums/date-format.enum';
import { formatStringDate } from '../../../shared/helpers/date/date.helpers';

import type { OnInit, Signal, WritableSignal } from '@angular/core';
import type { IUserProfileData } from '../../../core/models/user.model';
import type { ArtistTypeRequest } from '../../../core/types/artist-type-request.type';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  imports: [
    ProfileHeroComponent,
    ProfileStatsComponent,
    ProfileDetailsComponent,
    LatestActivityComponent,
  ],
})
export class ProfilePageComponent implements OnInit {
  private readonly userService: UserService = inject(UserService);

  private readonly profile: WritableSignal<IUserProfileData | null> =
    signal<IUserProfileData | null>(null);

  protected readonly fullName: Signal<string> = computed<string>(() => {
    const profile: IUserProfileData | null = this.profile();
    return profile ? profile.name + Constants.EMPTY_SPACE_STRING + profile.surname : Constants.DASH;
  });

  protected readonly artistType: Signal<ArtistTypeRequest> = computed<ArtistTypeRequest>(
    () => this.profile()?.artistType ?? ArtistTypeRequestEnum.ARTIST,
  );

  protected readonly description: Signal<string> = computed<string>(
    () => this.profile()?.description ?? Constants.DASH,
  );

  protected readonly artistName: Signal<string> = computed<string>(
    () => this.profile()?.artistName ?? Constants.DASH,
  );

  protected readonly birthdayDate: Signal<string> = computed<string>(() =>
    this.formatProfileDate(this.profile()?.dateOfBirth, DateFormatEnum.FULL_DATE),
  );

  protected readonly registeredAt: Signal<string> = computed<string>(() =>
    this.formatProfileDate(this.profile()?.registeredAt, DateFormatEnum.MONTH_YEAR),
  );

  public ngOnInit(): void {
    void this.getUserProfileData();
  }

  private async getUserProfileData(): Promise<void> {
    const profile: IUserProfileData = await firstValueFrom(this.userService.getUserProfileData());
    this.profile.set(profile);
  }

  private formatProfileDate(date: string | undefined, format: DateFormatEnum): string {
    return date ? formatStringDate(date, format) : Constants.DASH;
  }
}
