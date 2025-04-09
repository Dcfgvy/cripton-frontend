import { TestBed } from '@angular/core/testing';

import { TokenCreationService } from './token-creation.service';

describe('TokenCreationService', () => {
  let service: TokenCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
