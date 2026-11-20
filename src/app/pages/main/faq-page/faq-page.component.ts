import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Links } from '../../../core/constants/links';
import { Constants } from '../../../core/constants/constants';
import { FaqCategoryEnum } from '../../../core/enums/faq-category.enum';
import { FaqAccordionComponent } from '../../../features/components/support/faq-accordion/faq-accordion.component';
import { TracksSearchComponent } from '../../../features/components/tracks/tracks-search/tracks-search.component';
import { SupportContactService } from '../../../features/services/support-contact-service/support-contact.service';
import { FAQ_CATEGORY_TABS, FAQ_ITEMS } from '../../../features/constants/support.constant';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../shared/pipes/translate/translate.pipe';
import { TranslationService } from '../../../shared/services/translation-service/translation.service';

import type { Signal, WritableSignal } from '@angular/core';
import type { ParamMap } from '@angular/router';
import type { IFaqCategoryTab, IFaqItem } from '../../../features/models/support.model';

interface IFaqGroup {
  tab: IFaqCategoryTab;
  items: readonly IFaqItem[];
}

const FAQ_CATEGORIES: ReadonlySet<string> = new Set<string>(Object.values(FaqCategoryEnum));

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss',
  imports: [
    RouterLink,
    FaqAccordionComponent,
    TracksSearchComponent,
    ButtonComponent,
    EmptyStateComponent,
    TranslatePipe,
  ],
})
export class FaqPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly router: Router = inject(Router);

  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly supportContactService: SupportContactService = inject(SupportContactService);

  protected readonly tabs: readonly IFaqCategoryTab[] = FAQ_CATEGORY_TABS;

  protected readonly supportLink: string = `/${Links.SUPPORT_URL}`;

  protected readonly category: Signal<FaqCategoryEnum | null> = toSignal(
    this.route.queryParamMap.pipe(
      map((params: ParamMap) => {
        const category: string | null = params.get(Constants.CATEGORY_QUERY_PARAM);

        return category && FAQ_CATEGORIES.has(category) ? (category as FaqCategoryEnum) : null;
      }),
    ),
    { initialValue: null },
  );

  protected readonly search: WritableSignal<string> = signal<string>(Constants.EMPTY_STRING);

  protected readonly groups: Signal<IFaqGroup[]> = computed<IFaqGroup[]>(() => {
    const query: string = this.search().trim().toLocaleLowerCase();
    const category: FaqCategoryEnum | null = this.category();

    return this.tabs
      .filter((tab: IFaqCategoryTab) => tab.category && (!category || tab.category === category))
      .map((tab: IFaqCategoryTab) => ({
        tab: tab,
        items: FAQ_ITEMS.filter(
          (item: IFaqItem) => item.category === tab.category && this.matches(item, query),
        ),
      }))
      .filter((group: IFaqGroup) => group.items.length);
  });

  public onCategorySelect(category: FaqCategoryEnum | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [Constants.CATEGORY_QUERY_PARAM]: category },
      replaceUrl: true,
    });
  }

  public onSearch(value: string): void {
    this.search.set(value);
  }

  public onSendMessage(): void {
    this.supportContactService.openMessageForm();
  }

  private matches(item: IFaqItem, query: string): boolean {
    return (
      !query ||
      this.translationService.translate(item.question).toLocaleLowerCase().includes(query) ||
      this.translationService.translate(item.answer).toLocaleLowerCase().includes(query)
    );
  }
}
