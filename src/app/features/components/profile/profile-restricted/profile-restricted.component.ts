import { Component, computed, input } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';

import type { InputSignal, Signal } from '@angular/core';
import type { TranslationKey } from '../../../../core/types/translation.type';

interface IRestrictedTexts {
  iconClass: string;
  title: TranslationKey;
  description: TranslationKey;
}

const FOLLOWERS_ONLY_TEXTS: IRestrictedTexts = {
  iconClass: 'bx bx-lock',
  title: 'publicProfile.restrictedTitle',
  description: 'publicProfile.restrictedDescription',
};

const PRIVATE_TEXTS: IRestrictedTexts = {
  iconClass: 'bx bx-hide',
  title: 'publicProfile.hiddenTitle',
  description: 'publicProfile.hiddenDescription',
};

@Component({
  selector: 'app-profile-restricted',
  templateUrl: './profile-restricted.component.html',
  styleUrl: './profile-restricted.component.scss',
  imports: [EmptyStateComponent, TranslatePipe],
})
export class ProfileRestrictedComponent {
  public readonly followersOnly: InputSignal<boolean> = input.required<boolean>();

  public readonly name: InputSignal<string> = input.required<string>();

  protected readonly texts: Signal<IRestrictedTexts> = computed<IRestrictedTexts>(() =>
    this.followersOnly() ? FOLLOWERS_ONLY_TEXTS : PRIVATE_TEXTS,
  );
}
