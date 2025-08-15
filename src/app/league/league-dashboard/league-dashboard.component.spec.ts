import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueDashboardComponent } from './league-dashboard.component';

describe('LeagueDashboardComponent', () => {
  let component: LeagueDashboardComponent;
  let fixture: ComponentFixture<LeagueDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeagueDashboardComponent]
    });
    fixture = TestBed.createComponent(LeagueDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
