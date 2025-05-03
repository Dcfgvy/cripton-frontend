import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestnetTokenDataRemovalWarningComponent } from './testnet-token-data-removal-warning.component';

describe('TestnetTokenDataRemovalWarningComponent', () => {
  let component: TestnetTokenDataRemovalWarningComponent;
  let fixture: ComponentFixture<TestnetTokenDataRemovalWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestnetTokenDataRemovalWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestnetTokenDataRemovalWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
