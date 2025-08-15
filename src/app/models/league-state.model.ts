import { Team, TeamStats } from './team.model';
import { Match, WeekMatches } from './match.model';

export interface LeagueState {
  teams: Team[];
  matches: Match[];
  currentWeek: number;
  totalWeeks: number;
  standings: TeamStats[];
  weeklyMatches: WeekMatches[];
  isSeasonFinished: boolean;
  champion: Team | null;
  loading: boolean;
  error: string | null;
}

export const initialLeagueState: LeagueState = {
  teams: [],
  matches: [],
  currentWeek: 1,
  totalWeeks: 6, // 4 takımda herkesin herkesle 1'er maç için 6 hafta gerekiyor
  standings: [],
  weeklyMatches: [],
  isSeasonFinished: false,
  champion: null,
  loading: false,
  error: null
};