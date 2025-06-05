import { TestBed } from '@angular/core/testing';

import { SelectUserTokenService } from './select-user-token.service';

describe('SelectUserTokenService', () => {
  let service: SelectUserTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectUserTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
