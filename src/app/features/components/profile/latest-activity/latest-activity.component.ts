import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Links } from '../../../../core/constants/links';
import { ACTIVITY_LABELS } from '../../../constants/activity.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time/relative-time.pipe';

import type { InputSignal, WritableSignal } from '@angular/core';
import type { IActivity } from '../../../../core/models/activity.model';
import type { ActivityType } from '../../../../core/types/activity-type.type';
import type { TranslationKey } from '../../../../core/types/translation.type';

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

  protected readonly activityLabels: Readonly<Record<ActivityType, TranslationKey>> =
    ACTIVITY_LABELS;

  protected readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<
    ReadonlySet<string>
  >(new Set<string>());

  public onCoverError(coverUrl: string): void {
    this.brokenCovers.update((covers: ReadonlySet<string>) => new Set([...covers, coverUrl]));
  }

  public onUploadFirstTrack(): void {
    void this.router.navigate([Links.UPLOAD_TRACK_URL]);
  }
}
