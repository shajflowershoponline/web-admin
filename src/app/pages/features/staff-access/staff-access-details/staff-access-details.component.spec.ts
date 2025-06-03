import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDetailsComponent } from './access-details.component';

describe('AccessDetailsComponent', () => {
  let component: AccessDetailsComponent;
  let fixture: ComponentFixture<AccessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
