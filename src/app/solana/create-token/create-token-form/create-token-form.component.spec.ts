import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTokenFormComponent } from './create-token-form.component';

describe('CreateTokenFormComponent', () => {
  let component: CreateTokenFormComponent;
  let fixture: ComponentFixture<CreateTokenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTokenFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTokenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
