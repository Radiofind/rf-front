import { Component, input, output, signal, viewChild } from '@angular/core';
import {
  CdkMenu,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuTrigger,
  CdkTargetMenuAim,
} from '@angular/cdk/menu';
import { Constants } from '../../../core/constants/constants';
import {
  findSelectOption,
  hasSelectOptionChildren,
} from '../../helpers/select-option/select-option.helpers';

import type {
  InputSignal,
  OutputEmitterRef,
  Signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import type { IDropdownMenuContext } from '../../models/dropdown-menu-context.model';
import type { ISelectOption } from '../../models/select-option.model';

@Component({
  selector: 'app-dropdown-menu',
  exportAs: 'appDropdownMenu',
  imports: [CdkMenu, CdkMenuItem, CdkMenuItemRadio, CdkMenuTrigger, CdkTargetMenuAim],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent<T extends string> {
  public readonly options: InputSignal<readonly ISelectOption<T>[]> = input<
    readonly ISelectOption<T>[]
  >([]);

  public readonly selectedValue: InputSignal<T | null> = input<T | null>(null);

  public readonly optionSelect: OutputEmitterRef<T> = output<T>();

  public readonly template: Signal<TemplateRef<IDropdownMenuContext<T>> | undefined> = viewChild<
    TemplateRef<IDropdownMenuContext<T>>
  >(Constants.MENU_TEMPLATE_NAME);

  public readonly panelMinWidth: WritableSignal<number | null> = signal<number | null>(null);

  public readonly rootContext: IDropdownMenuContext<T> = { $implicit: null, isNested: false };

  public readonly nestedPositions: ConnectedPosition[] = [...Constants.DROPDOWN_NESTED_POSITIONS];

  public nestedContext(option: ISelectOption<T>): IDropdownMenuContext<T> {
    return { $implicit: option.children ?? [], isNested: true };
  }

  public hasChildren(option: ISelectOption<T>): boolean {
    return hasSelectOptionChildren(option);
  }

  public isSelected(option: ISelectOption<T>): boolean {
    return option.value === this.selectedValue();
  }

  public containsSelected(option: ISelectOption<T>): boolean {
    return findSelectOption(option.children ?? [], this.selectedValue()) !== undefined;
  }

  public onGroupClick(trigger: CdkMenuTrigger): void {
    if (!trigger.isOpen()) {
      trigger.open();
    }
  }

  public onSelect(option: ISelectOption<T>): void {
    this.optionSelect.emit(option.value);
  }
}
