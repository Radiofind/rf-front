import { Component, computed, input, signal } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ChipsFieldComponent } from '../../../../shared/components/chips-field/chips-field.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_TYPE_LABELS } from '../../../constants/artist-type.constant';
import { GENRE_OPTIONS } from '../../../constants/edit-profile.constant';

import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import type { ArtistType } from '../../../../core/types/artist-type.type';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  imports: [EmptyStateComponent, ChipsFieldComponent],
})
export class ProfileDetailsComponent {
  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly description: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly birthdayDate: InputSignal<string> = input<string>(Constants.DASH);

  public readonly additionalGenres: InputSignal<string[]> = input<string[]>([]);

  protected readonly genreOptions: WritableSignal<readonly ISelectOption<string>[]> =
    signal<readonly ISelectOption<string>[]>(GENRE_OPTIONS);

  protected readonly emptyValue: WritableSignal<string> = signal<string>(Constants.DASH);

  protected readonly artistTypeLabel: Signal<ArtistType> = computed<ArtistType>(
    () => ARTIST_TYPE_LABELS[this.artistType()],
  );
}
