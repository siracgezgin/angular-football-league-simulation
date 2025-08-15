import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchResultsComponent } from './match-results.component';

describe('MatchResultsComponent', () => {
  let component: MatchResultsComponent;
  let fixture: ComponentFixture<MatchResultsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchResultsComponent]
    });
    fixture = TestBed.createComponent(MatchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
