import { Component, computed, input, output } from '@angular/core';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_ROLE_LABELS } from '../../../constants/artist-type.constant';

import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';

@Component({
  selector: 'app-profile-hero',
  templateUrl: './profile-hero.component.html',
  styleUrl: './profile-hero.component.scss',
})
export class ProfileHeroComponent {
  public readonly userFullName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly bio: InputSignal<string> = input<string>(Constants.DASH);

  public readonly avatarUrl: InputSignal<string | null> = input<string | null>(null);

  public readonly avatarEdit: OutputEmitterRef<void> = output();

  protected readonly artistRoleLabel: Signal<string> = computed<string>(
    () => ARTIST_ROLE_LABELS[this.artistType()],
  );

  public onAvatarEdit(): void {
    this.avatarEdit.emit();
  }
}
