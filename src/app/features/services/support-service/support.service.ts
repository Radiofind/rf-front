import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { ISupportMessage } from '../../../core/models/support.model';

@Service()
export class SupportService {
  private readonly apiService: ApiService = inject(ApiService);

  public sendMessage(message: ISupportMessage): Observable<void> {
    return this.apiService.sendSupportMessage({
      subject: message.subject.trim(),
      message: message.message.trim(),
    });
  }
}
