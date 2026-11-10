import { Component, computed, input, output } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { UploadsEmptyStateEnum } from '../../../enums/uploads-empty-state.enum';
import {
  NO_STATUS_MATCH_DESCRIPTIONS,
  NO_STATUS_MATCH_TITLES,
} from '../../../constants/my-uploads.constant';

import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { TrackStatus } from '../../../../core/types/track-status.type';
import type { TranslationKey } from '../../../../core/types/translation.type';

@Component({
  selector: 'app-uploads-empty-state',
  templateUrl: './uploads-empty-state.component.html',
  styleUrl: './uploads-empty-state.component.scss',
  imports: [EmptyStateComponent, TranslatePipe],
})
export class UploadsEmptyStateComponent {
  public readonly kind: InputSignal<UploadsEmptyStateEnum> =
    input.required<UploadsEmptyStateEnum>();

  public readonly status: InputSignal<TrackStatus | null> = input<TrackStatus | null>(null);

  public readonly search: InputSignal<string> = input<string>('');

  public readonly uploadClicked: OutputEmitterRef<void> = output();

  public readonly resetClicked: OutputEmitterRef<void> = output();

  public readonly retryClicked: OutputEmitterRef<void> = output();

  protected readonly kinds: typeof UploadsEmptyStateEnum = UploadsEmptyStateEnum;

  protected readonly statusTitle: Signal<TranslationKey | null> = computed<TranslationKey | null>(
    () => {
      const status: TrackStatus | null = this.status();
      return status ? NO_STATUS_MATCH_TITLES[status] : null;
    },
  );

  protected readonly statusDescription: Signal<TranslationKey | null> =
    computed<TranslationKey | null>(() => {
      const status: TrackStatus | null = this.status();
      return status ? NO_STATUS_MATCH_DESCRIPTIONS[status] : null;
    });
}
