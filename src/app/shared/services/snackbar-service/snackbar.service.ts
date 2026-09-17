import { DestroyRef, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../../core/constants/constants';
import { SnackbarTypeEnum } from '../../../core/enums/snackbar-type.enum';

import type { Signal, WritableSignal } from '@angular/core';
import type { SnackbarType } from '../../../core/types/snackbar-type.type';
import type { ISnackbarMessage, ISnackbarOptions } from '../../models/snackbar.model';

@Service()

export class SnackbarService {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly messagesState: WritableSignal<readonly ISnackbarMessage[]> =
    signal<readonly ISnackbarMessage[]>([]);

  private readonly timers: Map<number, ReturnType<typeof setTimeout>> =
    new Map<number, ReturnType<typeof setTimeout>>();

  private readonly defaultType: SnackbarType = SnackbarTypeEnum.SUCCESS;

  private lastId: number = Constants.ZERO;

  public readonly messages: Signal<readonly ISnackbarMessage[]> = this.messagesState.asReadonly();

  public constructor() {
    this.destroyRef.onDestroy(() => {
      this.clear();
    });
  }

  public show(content: string, options: ISnackbarOptions = {}): number {
    this.lastId += Constants.ONE;

    const id: number = this.lastId;

    const message: ISnackbarMessage = {
      id: id,
      content: content,
      type: options.type ?? this.defaultType,
      iconClass: options.iconClass ?? null,
    };

    this.dropOverflow();

    this.messagesState.update(messages => [...messages, message]);
    this.scheduleDismiss(id, options.duration ?? Constants.SNACKBAR_DURATION_MS);

    return id;
  }

  public success(content: string, options: ISnackbarOptions = {}): number {
    return this.show(content, { ...options, type: SnackbarTypeEnum.SUCCESS });
  }

  public error(content: string, options: ISnackbarOptions = {}): number {
    return this.show(content, { ...options, type: SnackbarTypeEnum.ERROR });
  }

  public warning(content: string, options: ISnackbarOptions = {}): number {
    return this.show(content, { ...options, type: SnackbarTypeEnum.WARNING });
  }

  public info(content: string, options: ISnackbarOptions = {}): number {
    return this.show(content, { ...options, type: SnackbarTypeEnum.INFO });
  }

  public dismiss(id: number): void {
    this.clearTimer(id);

    this.messagesState.update(messages => messages.filter(message => message.id !== id));
  }

  public clear(): void {
    this.timers.forEach(timerId => {
      clearTimeout(timerId);
    });

    this.timers.clear();
    this.messagesState.set([]);
  }

  private scheduleDismiss(id: number, duration: number): void {
    if (!this.isBrowser || duration <= Constants.ZERO) {
      return;
    };

    const timerId: ReturnType<typeof setTimeout> = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.timers.set(id, timerId);
  }

  private dropOverflow(): void {
    const messages: readonly ISnackbarMessage[] = this.messagesState();
    const overflow: number = messages.length + Constants.ONE - Constants.SNACKBAR_MAX_STACK;

    if (overflow <= Constants.ZERO) {
      return;
    };

    messages.slice(Constants.ZERO, overflow).forEach(message => {
      this.dismiss(message.id);
    });
  }

  private clearTimer(id: number): void {
    const timerId: ReturnType<typeof setTimeout> | undefined = this.timers.get(id);

    if (timerId === undefined) {
      return;
    };

    clearTimeout(timerId);
    this.timers.delete(id);
  }
}
