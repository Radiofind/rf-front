import { Component, computed, inject, input, signal } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ChipsFieldComponent } from '../../../../shared/components/chips-field/chips-field.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_TEXTS } from '../../../constants/artist-type.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';
import { GENRE_OPTIONS } from '../../../constants/edit-profile.constant';

import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';
import type { IArtistTypeTexts } from '../../../models/artist-type-texts.model';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  imports: [EmptyStateComponent, ChipsFieldComponent, TranslatePipe],
})
export class ProfileDetailsComponent {
  private readonly translationService: TranslationService = inject(TranslationService);

  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly description: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly birthdayDate: InputSignal<string> = input<string>(Constants.DASH);

  public readonly additionalGenres: InputSignal<string[]> = input<string[]>([]);

  protected readonly genreOptions: Signal<readonly ISelectOption<string>[]> = computed<
    readonly ISelectOption<string>[]
  >(() => this.translationService.translateOptions(GENRE_OPTIONS));

  protected readonly emptyValue: WritableSignal<string> = signal<string>(Constants.DASH);

  protected readonly artistTypeTexts: Signal<IArtistTypeTexts> = computed<IArtistTypeTexts>(
    () => ARTIST_TYPE_TEXTS[ARTIST_TYPE_LABELS[this.artistType()]],
  );
}
