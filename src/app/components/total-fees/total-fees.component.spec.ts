import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalFeesComponent } from './total-fees.component';

describe('TotalFeesComponent', () => {
  let component: TotalFeesComponent;
  let fixture: ComponentFixture<TotalFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalFeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
