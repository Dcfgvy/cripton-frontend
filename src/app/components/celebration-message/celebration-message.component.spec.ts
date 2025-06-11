import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebrationMessageComponent } from './celebration-message.component';

describe('CelebrationMessageComponent', () => {
  let component: CelebrationMessageComponent;
  let fixture: ComponentFixture<CelebrationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CelebrationMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CelebrationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
