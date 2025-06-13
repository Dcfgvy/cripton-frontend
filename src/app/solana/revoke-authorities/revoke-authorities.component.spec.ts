import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevokeAuthoritiesComponent } from './revoke-authorities.component';

describe('RevokeAuthoritiesComponent', () => {
  let component: RevokeAuthoritiesComponent;
  let fixture: ComponentFixture<RevokeAuthoritiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevokeAuthoritiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevokeAuthoritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
