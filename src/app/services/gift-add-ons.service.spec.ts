import { TestBed } from '@angular/core/testing';

import { GiftAddOnsService } from './gift-add-ons.service';

describe('GiftAddOnsService', () => {
  let service: GiftAddOnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiftAddOnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
