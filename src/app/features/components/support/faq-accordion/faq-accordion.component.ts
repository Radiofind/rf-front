import { Component, input, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal, WritableSignal } from '@angular/core';
import type { IFaqItem } from '../../../models/support.model';

@Component({
  selector: 'app-faq-accordion',
  templateUrl: './faq-accordion.component.html',
  styleUrl: './faq-accordion.component.scss',
  imports: [TranslatePipe],
})
export class FaqAccordionComponent {
  public readonly items: InputSignal<readonly IFaqItem[]> = input.required<readonly IFaqItem[]>();

  private readonly openIds: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(
    new Set<string>(),
  );

  public isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  public onToggle(id: string): void {
    this.openIds.update((openIds: ReadonlySet<string>) => {
      const next: Set<string> = new Set<string>(openIds);

      if (!next.delete(id)) {
        next.add(id);
      }

      return next;
    });
  }
}
