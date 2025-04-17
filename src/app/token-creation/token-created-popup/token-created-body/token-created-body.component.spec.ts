import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenCreatedBodyComponent } from './token-created-body.component';

describe('TokenCreatedBodyComponent', () => {
  let component: TokenCreatedBodyComponent;
  let fixture: ComponentFixture<TokenCreatedBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenCreatedBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenCreatedBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
