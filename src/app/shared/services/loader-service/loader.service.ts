import { computed, Service, signal } from '@angular/core';
import { Constants } from '../../../core/constants/constants';

import type { Signal, WritableSignal } from '@angular/core';

@Service()

export class LoaderService {
  private readonly activeRequests: WritableSignal<number> = signal<number>(Constants.ZERO);

  public readonly isLoading: Signal<boolean> = computed(() => this.activeRequests() > Constants.ZERO);

  public show(): void {
    this.activeRequests.update(count => count + Constants.ONE);
  }

  public hide(): void {
    this.activeRequests.update(count => Math.max(Constants.ZERO, count - Constants.ONE));
  }
}
