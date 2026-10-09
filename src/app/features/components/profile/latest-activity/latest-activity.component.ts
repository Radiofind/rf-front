import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-latest-activity',
  templateUrl: './latest-activity.component.html',
  styleUrl: './latest-activity.component.scss',
  imports: [RouterLink, EmptyStateComponent],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class LatestActivityComponent {}
