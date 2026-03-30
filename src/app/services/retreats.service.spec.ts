import { TestBed } from '@angular/core/testing';

import { RetreatsService } from './retreats.service';

describe('RetreatsService', () => {
  let service: RetreatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetreatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
