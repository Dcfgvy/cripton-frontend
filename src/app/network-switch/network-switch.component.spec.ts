import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSwitchComponent } from './network-switch.component';

describe('NetworkSwitchComponent', () => {
  let component: NetworkSwitchComponent;
  let fixture: ComponentFixture<NetworkSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
