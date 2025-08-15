import { TestBed } from '@angular/core/testing';

import { LeagueSimulationService } from './league-simulation.service';

describe('LeagueSimulationService', () => {
  let service: LeagueSimulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeagueSimulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
