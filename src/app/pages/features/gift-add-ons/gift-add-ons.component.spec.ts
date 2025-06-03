import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftAddOnsComponent } from './gift-add-ons.component';

describe('GiftAddOnsComponent', () => {
  let component: GiftAddOnsComponent;
  let fixture: ComponentFixture<GiftAddOnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GiftAddOnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftAddOnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
