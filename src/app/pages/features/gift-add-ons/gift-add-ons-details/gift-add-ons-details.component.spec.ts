import { GiftAddOnsDetailsComponent } from './gift-add-ons-details.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('GiftAddOnsDetailsComponent', () => {
  let component: GiftAddOnsDetailsComponent;
  let fixture: ComponentFixture<GiftAddOnsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftAddOnsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftAddOnsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
