import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Constants } from '../../../core/constants/constants';

import type { InputSignal } from '@angular/core';
import type { DropdownMenuComponent } from '../../components/dropdown-menu/dropdown-menu.component';

@Directive({
  selector: '[appDropdownTriggerFor]',
  exportAs: 'appDropdownTrigger',
  hostDirectives: [{ directive: CdkMenuTrigger, outputs: ['cdkMenuOpened', 'cdkMenuClosed'] }],
})
export class DropdownTriggerDirective<T extends string> {
  public readonly dropdown: InputSignal<DropdownMenuComponent<T>> = input.required<
    DropdownMenuComponent<T>
  >({ alias: 'appDropdownTriggerFor' });

  public readonly menuTrigger: CdkMenuTrigger = inject(CdkMenuTrigger);

  private readonly hostElement: ElementRef<HTMLElement> =
    inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    this.menuTrigger.menuPosition = [...Constants.DROPDOWN_POSITIONS];

    effect(() => {
      const dropdown: DropdownMenuComponent<T> = this.dropdown();

      this.menuTrigger.menuTemplateRef = dropdown.template() ?? null;
      this.menuTrigger.menuData = dropdown.rootContext;
    });

    this.menuTrigger.opened
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.dropdown().panelMinWidth.set(this.hostElement.nativeElement.offsetWidth),
      );
  }
}
