import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ERROR_PAGE_CONTENT } from '../../features/constants/error-content.constant';
import { Constants } from '../../core/constants/constants';
import { Links } from '../../core/constants/links';
import { ErrorTypeEnum } from '../../core/enums/error-type.enum';

import type { Signal } from '@angular/core';
import type { Data } from '@angular/router';
import type { IErrorContent } from '../../features/models/error-content.model';
import type { ErrorType } from '../../core/types/error-type.type';

@Component({
  selector: 'app-error-page',
  imports: [HeaderComponent, ButtonComponent, IconComponent],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})

export class ErrorPageComponent {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private readonly router: Router = inject(Router);

  private readonly location: Location = inject(Location);

  public readonly homeButtonText: string = Constants.ERROR_HOME_BUTTON_TEXT;

  public readonly backButtonText: string = Constants.ERROR_BACK_BUTTON_TEXT;

  public readonly secondaryButtonClass: string = Constants.ERROR_SECONDARY_BUTTON_CLASS;

  public readonly homeIconClass: string = Constants.HOME_ICON_CLASS;

  public readonly backIconClass: string = Constants.BACK_ICON_CLASS;

  public readonly errorType: Signal<ErrorType> = toSignal(
    this.activatedRoute.data.pipe(
      map(
        (data: Data): ErrorType =>
          (data[Constants.ERROR_TYPE_PROP] as ErrorType | undefined) ?? ErrorTypeEnum.NOT_FOUND,
      ),
    ),
    {
      initialValue: ErrorTypeEnum.NOT_FOUND,
    },
  );

  public readonly content: Signal<IErrorContent> = computed(
    (): IErrorContent => ERROR_PAGE_CONTENT[this.errorType()],
  );

  public goHome(): void {
    void this.router.navigate([Links.DEFAULT_PATH]);
  }
}
