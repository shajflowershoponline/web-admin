import { TestBed } from '@angular/core/testing';

import { StaffAccessService } from './staff-access.service';

describe('StaffAccessService', () => {
  let service: StaffAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
