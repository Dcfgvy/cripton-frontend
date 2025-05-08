import { TestBed } from '@angular/core/testing';

import { TransactionsHandlerService } from './transactions-handler.service';

describe('TransactionsHandlerService', () => {
  let service: TransactionsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
