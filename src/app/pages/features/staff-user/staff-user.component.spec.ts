import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffUserComponent } from './staff-user.component';

describe('StaffUserComponent', () => {
  let component: StaffUserComponent;
  let fixture: ComponentFixture<StaffUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
