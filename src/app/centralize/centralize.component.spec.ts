import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralizeComponent } from './centralize.component';

describe('CentralizeComponent', () => {
  let component: CentralizeComponent;
  let fixture: ComponentFixture<CentralizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentralizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
