import { TestBed } from '@angular/core/testing';

import { VanityService } from './vanity.service';

describe('VanityService', () => {
  let service: VanityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VanityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
