import { Component, input, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate/translate.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time/relative-time.pipe';
import { NOTIFICATION_MESSAGES } from '../../constants/notification-messages.constant';

import type { InputSignal, WritableSignal } from '@angular/core';
import type { INotification } from '../../../core/models/notification.model';
import type { NotificationType } from '../../../core/types/notification-type.type';
import type { TranslationKey } from '../../../core/types/translation.type';

@Component({
  selector: 'app-notification-list',
  imports: [TranslatePipe, RelativeTimePipe],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent {
  public readonly notifications: InputSignal<readonly INotification[]> = input<
    readonly INotification[]
  >([]);

  public readonly messages: Readonly<Record<NotificationType, TranslationKey>> =
    NOTIFICATION_MESSAGES;

  protected readonly brokenCovers: WritableSignal<ReadonlySet<string>> = signal<
    ReadonlySet<string>
  >(new Set<string>());

  public onCoverError(coverUrl: string): void {
    this.brokenCovers.update((covers: ReadonlySet<string>) => new Set([...covers, coverUrl]));
  }
}
