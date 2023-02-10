import { TestBed } from '@angular/core/testing';

import { NetworkActionsService } from './network-actions.service';

describe('NetworkActionsService', () => {
  let service: NetworkActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
