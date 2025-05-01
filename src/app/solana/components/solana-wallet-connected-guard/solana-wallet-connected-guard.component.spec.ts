import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolanaWalletConnectedGuardComponent } from './solana-wallet-connected-guard.component';

describe('SolanaWalletConnectedGuardComponent', () => {
  let component: SolanaWalletConnectedGuardComponent;
  let fixture: ComponentFixture<SolanaWalletConnectedGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolanaWalletConnectedGuardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolanaWalletConnectedGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
