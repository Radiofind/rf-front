import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  imports: [EmptyStateComponent],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProfileDetailsComponent {}
