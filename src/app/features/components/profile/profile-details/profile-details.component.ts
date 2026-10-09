import { Component, computed, input } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_TYPE_LABELS } from '../../../constants/artist-type.constant';

import type { InputSignal, Signal } from '@angular/core';
import type { ArtistType } from '../../../../core/types/artist-type.type';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  imports: [EmptyStateComponent],
})
export class ProfileDetailsComponent {
  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly description: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly birthdayDate: InputSignal<string> = input<string>(Constants.DASH);

  protected readonly artistTypeLabel: Signal<ArtistType> = computed<ArtistType>(
    () => ARTIST_TYPE_LABELS[this.artistType()],
  );
}
