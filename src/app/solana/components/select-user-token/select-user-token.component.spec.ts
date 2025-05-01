import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUserTokenComponent } from './select-user-token.component';

describe('SelectUserTokenComponent', () => {
  let component: SelectUserTokenComponent;
  let fixture: ComponentFixture<SelectUserTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectUserTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectUserTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
