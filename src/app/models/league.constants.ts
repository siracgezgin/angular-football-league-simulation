// src/app/models/league.constants.ts

export const LEAGUE_CONSTANTS = {
  POINTS: {
    WIN: 3,
    DRAW: 1,
    LOSS: 0
  },
  TEAM_COUNT: 4,
  TOTAL_WEEKS: 6,
  TEAM_NAMES: [
    'Galatasaray',
    'Fenerbahçe', 
    'Beşiktaş',
    'Trabzonspor'
  ],
  TEAM_STRENGTH: {
    MIN: 1,
    MAX: 5,
    DEFAULT: 3
  }
};

export const CHAMPIONSHIP_CALCULATION_START_WEEK = 4;