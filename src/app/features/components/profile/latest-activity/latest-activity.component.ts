import { Component, inject } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Router } from '@angular/router';
import { Links } from '../../../../core/constants/links';

@Component({
  selector: 'app-latest-activity',
  templateUrl: './latest-activity.component.html',
  styleUrl: './latest-activity.component.scss',
  imports: [EmptyStateComponent],
})
export class LatestActivityComponent {
  private readonly router: Router = inject(Router);

  public onUploadFirstTrack(): void {
    void this.router.navigate([Links.UPLOAD_TRACK_URL]);
  }
}
