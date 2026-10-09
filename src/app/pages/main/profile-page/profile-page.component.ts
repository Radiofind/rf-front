import { Component } from '@angular/core';
import { ProfileHeroComponent } from '../../../features/components/profile/profile-hero/profile-hero.component';
import { ProfileStatsComponent } from '../../../features/components/profile/profile-stats/profile-stats.component';
import { ProfileDetailsComponent } from '../../../features/components/profile/profile-details/profile-details.component';
import { LatestActivityComponent } from '../../../features/components/profile/latest-activity/latest-activity.component';

@Component({
  imports: [
    ProfileHeroComponent,
    ProfileStatsComponent,
    ProfileDetailsComponent,
    LatestActivityComponent,
  ],
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProfilePageComponent {}
