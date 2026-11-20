import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SupportService } from './support.service';
import { ApiService } from '../../../core/services/api/api.service';

describe('SupportService', () => {
  it('sends the message without surrounding whitespace', () => {
    const sendSupportMessage: ReturnType<typeof vi.fn> = vi.fn().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { sendSupportMessage: sendSupportMessage } }],
    });

    TestBed.inject(SupportService)
      .sendMessage({ subject: '  Upload stuck ', message: '\n My track stays in review \n' })
      .subscribe();

    expect(sendSupportMessage).toHaveBeenCalledExactlyOnceWith({
      subject: 'Upload stuck',
      message: 'My track stays in review',
    });
  });
});
