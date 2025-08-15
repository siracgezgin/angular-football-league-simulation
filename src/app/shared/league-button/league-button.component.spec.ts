import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueButtonComponent } from './league-button.component';

describe('LeagueButtonComponent', () => {
  let component: LeagueButtonComponent;
  let fixture: ComponentFixture<LeagueButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeagueButtonComponent]
    });
    fixture = TestBed.createComponent(LeagueButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
