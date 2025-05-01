import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletConnectionPopupComponent } from './wallet-connection-popup.component';

describe('WalletConnectionPopupComponent', () => {
  let component: WalletConnectionPopupComponent;
  let fixture: ComponentFixture<WalletConnectionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletConnectionPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletConnectionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
