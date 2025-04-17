import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingTokensComponent } from './trending-tokens.component';

describe('TrendingTokensComponent', () => {
  let component: TrendingTokensComponent;
  let fixture: ComponentFixture<TrendingTokensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingTokensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
