import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appPopoverContent]',
})

export class PopoverContentDirective {
  public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
