import { CollectionDetailsComponent } from './collection-details.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('CollectionDetailsComponent', () => {
  let component: CollectionDetailsComponent;
  let fixture: ComponentFixture<CollectionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
