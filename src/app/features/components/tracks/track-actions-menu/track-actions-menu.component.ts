import { Component, computed, input, output } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { TRACK_ACTION_OPTIONS } from '../../../constants/my-uploads.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import type { TrackActionEnum } from '../../../../core/enums/track-action.enum';
import type { ITrackActionOption } from '../../../models/track-action-option.model';

const MENU_OFFSET: number = 6;

@Component({
  selector: 'app-track-actions-menu',
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, TranslatePipe],
  templateUrl: './track-actions-menu.component.html',
  styleUrl: './track-actions-menu.component.scss',
})
export class TrackActionsMenuComponent {
  public readonly actions: InputSignal<readonly TrackActionEnum[]> =
    input.required<readonly TrackActionEnum[]>();

  public readonly trackTitle: InputSignal<string> = input.required<string>();

  public readonly actionSelected: OutputEmitterRef<TrackActionEnum> = output<TrackActionEnum>();

  protected readonly options: Signal<readonly ITrackActionOption[]> = computed<
    readonly ITrackActionOption[]
  >(() => this.actions().map((action: TrackActionEnum) => TRACK_ACTION_OPTIONS[action]));

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: MENU_OFFSET },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -MENU_OFFSET },
  ];
}
