import { Component, inject } from '@angular/core';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { SnackbarService } from '../../services/snackbar-service/snackbar.service';

import type { Signal } from '@angular/core';
import type { ISnackbarMessage } from '../../models/snackbar.model';

@Component({
  selector: 'app-snackbar-container',
  imports: [SnackbarComponent],
  templateUrl: './snackbar-container.component.html',
  styleUrl: './snackbar-container.component.scss',
})

export class SnackbarContainerComponent {
  private readonly snackbarService: SnackbarService = inject(SnackbarService);

  public readonly messages: Signal<readonly ISnackbarMessage[]> = this.snackbarService.messages;
}
