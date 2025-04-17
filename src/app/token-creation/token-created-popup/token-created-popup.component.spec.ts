import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenCreatedPopupComponent } from './token-created-popup.component';

describe('TokenCreatedPopupComponent', () => {
  let component: TokenCreatedPopupComponent;
  let fixture: ComponentFixture<TokenCreatedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenCreatedPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenCreatedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
