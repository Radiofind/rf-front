import { Component, input, output } from '@angular/core';
import { Constants } from '../../../../core/constants/constants';
import { SelectFieldComponent } from '../../../../shared/components/select-field/select-field.component';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { UPLOADS_PAGE_SIZE_OPTIONS } from '../../../constants/my-uploads.constant';

import type { InputSignal, OutputEmitterRef } from '@angular/core';
import type { ISelectOption } from '../../../../shared/models/select-option.model';

@Component({
  selector: 'app-tracks-pagination',
  templateUrl: './tracks-pagination.component.html',
  styleUrl: './tracks-pagination.component.scss',
  imports: [SelectFieldComponent, TranslatePipe],
})
export class TracksPaginationComponent {
  public readonly label: InputSignal<string> = input.required<string>();

  public readonly page: InputSignal<number> = input.required<number>();

  public readonly totalPages: InputSignal<number> = input.required<number>();

  public readonly visiblePages: InputSignal<readonly number[]> =
    input.required<readonly number[]>();

  public readonly rangeStart: InputSignal<number> = input.required<number>();

  public readonly rangeEnd: InputSignal<number> = input.required<number>();

  public readonly totalElements: InputSignal<number> = input.required<number>();

  public readonly pageSize: InputSignal<number> = input.required<number>();

  public readonly pageSelected: OutputEmitterRef<number> = output<number>();

  public readonly pageSizeSelected: OutputEmitterRef<number> = output<number>();

  protected readonly pageSizeOptions: readonly ISelectOption<string>[] = UPLOADS_PAGE_SIZE_OPTIONS;

  public onPageSelect(page: number): void {
    if (page !== this.page() && page >= Constants.ZERO && page < this.totalPages()) {
      this.pageSelected.emit(page);
    }
  }

  public onPageSizeSelect(size: string): void {
    this.pageSizeSelected.emit(Number(size));
  }
}
