import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Links } from '../../../../core/constants/links';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time/relative-time.pipe';

import type { InputSignal } from '@angular/core';
import type { IActivity } from '../../../../core/models/activity.model';

@Component({
  selector: 'app-latest-activity',
  templateUrl: './latest-activity.component.html',
  styleUrl: './latest-activity.component.scss',
  imports: [EmptyStateComponent, TranslatePipe, RelativeTimePipe],
})
export class LatestActivityComponent {
  private readonly router: Router = inject(Router);

  public readonly activities: InputSignal<readonly IActivity[] | null> = input<
    readonly IActivity[] | null
  >(null);

  public onUploadFirstTrack(): void {
    void this.router.navigate([Links.UPLOAD_TRACK_URL]);
  }
}
