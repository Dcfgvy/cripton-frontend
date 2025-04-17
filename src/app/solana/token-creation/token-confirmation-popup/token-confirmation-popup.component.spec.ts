import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenConfirmationPopupComponent } from './token-confirmation-popup.component';

describe('TokenConfirmationPopupComponent', () => {
  let component: TokenConfirmationPopupComponent;
  let fixture: ComponentFixture<TokenConfirmationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenConfirmationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
