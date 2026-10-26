import { Component, computed, input, output } from '@angular/core';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_TEXTS } from '../../../constants/artist-type.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { SOCIAL_LINKS } from '../../../constants/edit-profile.constant';

import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { ISocialLinksData } from '../../../../core/models/user.model';
import type { TranslationKey } from '../../../../core/types/translation.type';
import type { ISocialLinkConfig, ISocialLinkItem } from '../../../models/edit-profile-form.model';

@Component({
  selector: 'app-profile-hero',
  templateUrl: './profile-hero.component.html',
  styleUrl: './profile-hero.component.scss',
  imports: [TranslatePipe],
})
export class ProfileHeroComponent {
  public readonly userFullName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly bio: InputSignal<string> = input<string>(Constants.DASH);

  public readonly avatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly mainGenres: InputSignal<string | null> = input<string | null>(null);

  public readonly socialLinks: InputSignal<ISocialLinksData | null> =
    input<ISocialLinksData | null>(null);

  public readonly avatarEdit: OutputEmitterRef<void> = output();

  public readonly profileEdit: OutputEmitterRef<void> = output();

  protected readonly artistRoleLabel: Signal<TranslationKey> = computed<TranslationKey>(
    () => ARTIST_TYPE_TEXTS[ARTIST_TYPE_LABELS[this.artistType()]].role,
  );

  protected readonly visibleSocialLinks: Signal<readonly ISocialLinkItem[]> = computed<
    readonly ISocialLinkItem[]
  >(() => {
    const socialLinks: ISocialLinksData | null = this.socialLinks();

    if (!socialLinks) {
      return [];
    }

    return SOCIAL_LINKS.flatMap((link: ISocialLinkConfig) => {
      const url: string | undefined = socialLinks[link.key]?.trim();
      return url ? [{ key: link.key, label: link.label, iconClass: link.iconClass, url: url }] : [];
    });
  });

  public onAvatarEdit(): void {
    this.avatarEdit.emit();
  }

  public onProfileEdit(): void {
    this.profileEdit.emit();
  }
}
