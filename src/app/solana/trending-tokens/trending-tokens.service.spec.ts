import { TestBed } from '@angular/core/testing';

import { TrendingTokensService } from './trending-tokens.service';

describe('TrendingTokensService', () => {
  let service: TrendingTokensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrendingTokensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
