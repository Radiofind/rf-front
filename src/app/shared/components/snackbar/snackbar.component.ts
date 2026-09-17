import { Component, computed, input } from '@angular/core';
import { Constants } from '../../../core/constants/constants';
import { SnackbarTypeEnum } from '../../../core/enums/snackbar-type.enum';

import type { InputSignal, Signal } from '@angular/core';
import type { SnackbarType } from '../../../core/types/snackbar-type.type';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
})

export class SnackbarComponent {
  public readonly snackbarContent: InputSignal<string | null> = input<string | null>(null);

  public readonly snackbarType: InputSignal<SnackbarType> = input<SnackbarType>(SnackbarTypeEnum.SUCCESS);

  public readonly snackbarIconClass: InputSignal<string | null> = input<string | null>(null);

  private readonly typeIcons: Readonly<Record<SnackbarType, string>> = {
    [SnackbarTypeEnum.SUCCESS]: Constants.SNACKBAR_SUCCESS_ICON_CLASS,
    [SnackbarTypeEnum.ERROR]: Constants.SNACKBAR_ERROR_ICON_CLASS,
    [SnackbarTypeEnum.WARNING]: Constants.SNACKBAR_WARNING_ICON_CLASS,
    [SnackbarTypeEnum.INFO]: Constants.SNACKBAR_INFO_ICON_CLASS,
  };

  public readonly iconClass: Signal<string> = computed(
    () => this.snackbarIconClass() ?? this.typeIcons[this.snackbarType()],
  );
}
