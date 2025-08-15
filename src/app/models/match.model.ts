export interface Match {
  id: number;
  week: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
  result?: MatchResult;
}

export enum MatchResult {
  HOME_WIN = 'HOME_WIN',
  AWAY_WIN = 'AWAY_WIN',
  DRAW = 'DRAW'
}

export interface WeekMatches {
  week: number;
  matches: Match[];
}

export interface MatchEdit {
  matchId: number;
  homeScore: number;
  awayScore: number;
}