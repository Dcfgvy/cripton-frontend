import { TestBed } from '@angular/core/testing';

import { NetworkSwitchService } from './network-switch.service';

describe('NetworkSwitchService', () => {
  let service: NetworkSwitchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkSwitchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
