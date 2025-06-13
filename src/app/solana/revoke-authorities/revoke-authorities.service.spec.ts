import { TestBed } from '@angular/core/testing';

import { RevokeAuthoritiesService } from './revoke-authorities.service';

describe('RevokeAuthoritiesService', () => {
  let service: RevokeAuthoritiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevokeAuthoritiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
