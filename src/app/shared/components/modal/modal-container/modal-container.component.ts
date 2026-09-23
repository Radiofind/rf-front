import { Component, computed, inject, signal } from '@angular/core';
import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Constants } from '../../../../core/constants/constants';
import { IconComponent } from '../../icon/icon.component';
import { ModalSizeEnum } from '../../../../core/enums/modal-size.enum';

import type { Signal, WritableSignal } from '@angular/core';
import type { ModalSize } from '../../../../core/types/modal-size.type';
import type { IModalDialogConfig } from '../../../models/modal.model';

@Component({
  selector: 'app-modal-container',
  imports: [CdkPortalOutlet, IconComponent],
  templateUrl: './modal-container.component.html',
  styleUrl: './modal-container.component.scss',
  host: {
    class: Constants.MODAL_CONTAINER_CLASS,
    tabindex: Constants.MODAL_TAB_INDEX,
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
  },
})
export class ModalContainerComponent extends CdkDialogContainer<IModalDialogConfig> {
  private readonly dialogRef: DialogRef = inject(DialogRef);

  private readonly hasHeaderByDefault: WritableSignal<boolean> = signal<boolean>(true);

  private readonly hasCloseButtonByDefault: WritableSignal<boolean> = signal<boolean>(true);

  public readonly titleId: Signal<string> = computed(() => {
    return `${this._config.id ?? Constants.EMPTY_STRING}${Constants.MODAL_TITLE_ID_SUFFIX}`;
  });

  private readonly defaultSize: ModalSize = ModalSizeEnum.MEDIUM;

  constructor() {
    super();

    if (this.hasHeader && this.title) {
      this._addAriaLabelledBy(this.titleId());
    }
  }

  public get title(): string | null {
    return this._config.title ?? null;
  }

  public get subtitle(): string | null {
    return this._config.subtitle ?? null;
  }

  public get iconClass(): string | null {
    return this._config.iconClass ?? null;
  }

  public get size(): ModalSize {
    return this._config.size ?? this.defaultSize;
  }

  public get hasHeader(): boolean {
    return this._config.hasHeader ?? this.hasHeaderByDefault();
  }

  public get hasCloseButton(): boolean {
    return this._config.hasCloseButton ?? this.hasCloseButtonByDefault();
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
