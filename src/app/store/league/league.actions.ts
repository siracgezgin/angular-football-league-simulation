// src/app/store/league/league.actions.ts

import { createAction, props } from '@ngrx/store';
import { Team } from '../../models/team.model';
import { Match, MatchEdit } from '../../models/match.model';

// League initialization
export const initializeLeague = createAction('[League] Initialize League');
export const initializeLeagueSuccess = createAction(
  '[League] Initialize League Success',
  props<{ teams: Team[]; matches: Match[] }>()
);
export const initializeLeagueFailure = createAction(
  '[League] Initialize League Failure',
  props<{ error: string }>()
);

// Next week actions
export const playNextWeek = createAction('[League] Play Next Week');
export const playNextWeekSuccess = createAction(
  '[League] Play Next Week Success',
  props<{ matches: Match[]; currentWeek: number }>()
);

// Play all season
export const playAllSeason = createAction('[League] Play All Season');
export const playAllSeasonSuccess = createAction(
  '[League] Play All Season Success',
  props<{ allMatches: Match[]; finalWeek: number }>()
);

// Edit match result
export const editMatchResult = createAction(
  '[League] Edit Match Result',
  props<{ matchEdit: MatchEdit }>()
);
export const editMatchResultSuccess = createAction(
  '[League] Edit Match Result Success',
  props<{ updatedMatch: Match }>()
);

// Calculate standings
export const calculateStandings = createAction('[League] Calculate Standings');
export const calculateStandingsSuccess = createAction(
  '[League] Calculate Standings Success'
);

// Reset league
export const resetLeague = createAction('[League] Reset League');

// Loading states
export const setLoading = createAction(
  '[League] Set Loading',
  props<{ loading: boolean }>()
);

// Error handling
export const setError = createAction(
  '[League] Set Error',
  props<{ error: string | null }>()
);

// Clear error
export const clearError = createAction('[League] Clear Error');