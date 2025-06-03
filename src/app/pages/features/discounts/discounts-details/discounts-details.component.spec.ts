import { DiscountsDetailsComponent } from './discounts-details.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('DiscountsDetailsComponent', () => {
  let component: DiscountsDetailsComponent;
  let fixture: ComponentFixture<DiscountsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscountsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
