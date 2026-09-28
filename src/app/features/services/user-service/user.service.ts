import { inject, Service } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';

import type { Observable } from 'rxjs';
import type { ICurrentUser } from '../../../core/models/user.model';

@Service()
export class UserService {
  private readonly apiService: ApiService = inject(ApiService);

  public getCurrentUserData(): Observable<ICurrentUser> {
    return this.apiService.getCurrentUserData();
  }
}
