import { Component, inject } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Router } from '@angular/router';
import { Links } from '../../../../core/constants/links';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';

@Component({
  selector: 'app-latest-activity',
  templateUrl: './latest-activity.component.html',
  styleUrl: './latest-activity.component.scss',
  imports: [EmptyStateComponent, TranslatePipe],
})
export class LatestActivityComponent {
  private readonly router: Router = inject(Router);

  private readonly translationService: TranslationService = inject(TranslationService);

  public formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return this.translationService.formatRelativeTime(value, unit);
  }

  public onUploadFirstTrack(): void {
    void this.router.navigate([Links.UPLOAD_TRACK_URL]);
  }
}
