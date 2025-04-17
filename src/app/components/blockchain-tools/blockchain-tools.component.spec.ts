import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainToolsComponent } from './blockchain-tools.component';

describe('BlockchainToolsComponent', () => {
  let component: BlockchainToolsComponent;
  let fixture: ComponentFixture<BlockchainToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockchainToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockchainToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
