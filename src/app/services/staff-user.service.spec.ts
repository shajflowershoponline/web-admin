import { TestBed } from '@angular/core/testing';

import { StaffUserService } from './staff-user.service';

describe('UserService', () => {
  let service: StaffUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
