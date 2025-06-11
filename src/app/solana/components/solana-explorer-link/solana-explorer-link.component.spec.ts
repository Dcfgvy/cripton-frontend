import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolanaExplorerLinkComponent } from './solana-explorer-link.component';

describe('SolanaExplorerLinkComponent', () => {
  let component: SolanaExplorerLinkComponent;
  let fixture: ComponentFixture<SolanaExplorerLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolanaExplorerLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolanaExplorerLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
