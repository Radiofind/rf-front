import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate/translate.pipe';
import { MY_UPLOADS_SKELETON_ROWS } from '../../../constants/my-uploads.constant';

@Component({
  selector: 'app-tracks-skeleton',
  templateUrl: './tracks-skeleton.component.html',
  styleUrl: './tracks-skeleton.component.scss',
  imports: [TranslatePipe],
})
export class TracksSkeletonComponent {
  protected readonly rows: readonly number[] = MY_UPLOADS_SKELETON_ROWS;
}
