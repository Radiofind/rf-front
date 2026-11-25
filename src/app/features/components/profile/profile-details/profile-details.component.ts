import { Component, computed, inject, input, output, signal, viewChildren } from '@angular/core';
import { ChipsFieldComponent } from '../../../../shared/components/chips-field/chips-field.component';
import { Constants } from '../../../../core/constants/constants';
import { ArtistTypeRequestEnum } from '../../../../core/enums/artist-type.enum';
import { ARTIST_TYPE_LABELS, ARTIST_TYPE_TEXTS } from '../../../constants/artist-type.constant';
import { ProfileTabEnum } from '../../../enums/profile-tab.enum';
import { PROFILE_TAB_LABELS, PROFILE_TAB_STEPS } from '../../../constants/profile-tab.constant';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation-service/translation.service';
import { GENRE_OPTIONS } from '../../../constants/genre.constant';

import type {
  ElementRef,
  InputSignal,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import type { TranslationKey } from '../../../../core/types/translation.type';
import type { ArtistTypeRequest } from '../../../../core/types/artist-type-request.type';
import type { ISelectOption } from '../../../../shared/models/select-option.model';
import type { IArtistTypeTexts } from '../../../models/artist-type-texts.model';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  imports: [ChipsFieldComponent, TranslatePipe],
})
export class ProfileDetailsComponent {
  private readonly translationService: TranslationService = inject(TranslationService);

  private readonly tabButtons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
    viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  private isStatisticsOpened: boolean = false;

  public readonly artistType: InputSignal<ArtistTypeRequest> = input<ArtistTypeRequest>(
    ArtistTypeRequestEnum.ARTIST,
  );

  public readonly description: InputSignal<string> = input<string>(Constants.DASH);

  public readonly artistName: InputSignal<string> = input<string>(Constants.DASH);

  public readonly birthdayDate: InputSignal<string | null> = input<string | null>(Constants.DASH);

  public readonly additionalGenres: InputSignal<string[]> = input<string[]>([]);

  public readonly statisticsVisible: InputSignal<boolean> = input<boolean>(false);

  public readonly statisticsOpened: OutputEmitterRef<void> = output();

  protected readonly tabIds: typeof ProfileTabEnum = ProfileTabEnum;

  protected readonly tabLabels: Readonly<Record<ProfileTabEnum, TranslationKey>> =
    PROFILE_TAB_LABELS;

  protected readonly activeTab: WritableSignal<ProfileTabEnum> = signal<ProfileTabEnum>(
    ProfileTabEnum.ABOUT,
  );

  protected readonly tabs: Signal<ProfileTabEnum[]> = computed<ProfileTabEnum[]>(() =>
    this.statisticsVisible()
      ? [ProfileTabEnum.ABOUT, ProfileTabEnum.STATISTICS]
      : [ProfileTabEnum.ABOUT],
  );

  protected readonly genreOptions: Signal<readonly ISelectOption<string>[]> = computed<
    readonly ISelectOption<string>[]
  >(() => this.translationService.translateOptions(GENRE_OPTIONS));

  protected readonly emptyValue: WritableSignal<string> = signal<string>(Constants.DASH);

  protected readonly artistTypeTexts: Signal<IArtistTypeTexts> = computed<IArtistTypeTexts>(
    () => ARTIST_TYPE_TEXTS[ARTIST_TYPE_LABELS[this.artistType()]],
  );

  public onTabSelect(tab: ProfileTabEnum): void {
    this.activeTab.set(tab);

    if (tab === ProfileTabEnum.STATISTICS && !this.isStatisticsOpened) {
      this.isStatisticsOpened = true;
      this.statisticsOpened.emit();
    }
  }

  public onTabKeydown(event: KeyboardEvent): void {
    const step: number | undefined = PROFILE_TAB_STEPS[event.key];

    if (step === undefined) {
      return;
    }

    event.preventDefault();
    const tabs: ProfileTabEnum[] = this.tabs();
    const index: number = (tabs.indexOf(this.activeTab()) + step + tabs.length) % tabs.length;

    const next: ProfileTabEnum | undefined = tabs[index];

    if (next) {
      this.onTabSelect(next);
      this.tabButtons()[index]?.nativeElement.focus();
    }
  }
}
