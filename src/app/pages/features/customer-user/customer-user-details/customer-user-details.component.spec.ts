import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerUserDetailsComponent } from './customer-user-details.component';

describe('CustomerUserDetailsComponent', () => {
  let component: CustomerUserDetailsComponent;
  let fixture: ComponentFixture<CustomerUserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerUserDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
