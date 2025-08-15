// src/app/store/league/league.selectors.ts

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LeagueState } from '../../models/league-state.model';
import { CHAMPIONSHIP_CALCULATION_START_WEEK } from '../../models/league.constants';

export const selectLeagueState = createFeatureSelector<LeagueState>('league');

// Basic selectors
export const selectTeams = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.teams
);

export const selectMatches = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.matches
);

export const selectCurrentWeek = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.currentWeek
);

export const selectStandings = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.standings
);

export const selectWeeklyMatches = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.weeklyMatches
);

export const selectIsSeasonFinished = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.isSeasonFinished
);

export const selectChampion = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.champion
);

export const selectLoading = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.loading
);

export const selectError = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.error
);

export const selectTotalWeeks = createSelector(
  selectLeagueState,
  (state: LeagueState) => state.totalWeeks
);

// Complex selectors
export const selectCurrentWeekMatches = createSelector(
  selectWeeklyMatches,
  selectCurrentWeek,
  (weeklyMatches, currentWeek) => 
    weeklyMatches.find(wm => wm.week === currentWeek)?.matches || []
);

export const selectPlayedMatches = createSelector(
  selectMatches,
  (matches) => matches.filter(match => match.isPlayed)
);

export const selectUpcomingMatches = createSelector(
  selectMatches,
  (matches) => matches.filter(match => !match.isPlayed)
);

export const selectCanPlayNextWeek = createSelector(
  selectCurrentWeek,
  selectTotalWeeks,
  selectIsSeasonFinished,
  (currentWeek, totalWeeks, isFinished) => 
    currentWeek <= totalWeeks && !isFinished
);

export const selectCanShowChampionshipChances = createSelector(
  selectCurrentWeek,
  (currentWeek) => currentWeek >= CHAMPIONSHIP_CALCULATION_START_WEEK
);

export const selectTeamsWithoutChampionshipChance = createSelector(
  selectStandings,
  selectCanShowChampionshipChances,
  (standings, canShow) => {
    if (!canShow) return [];
    return standings.filter(teamStat => !teamStat.isChampionshipPossible)
      .map(teamStat => teamStat.team.id);
  }
);

// Statistics selectors
export const selectTotalGoals = createSelector(
  selectPlayedMatches,
  (matches) => matches.reduce((total, match) => 
    total + (match.homeScore || 0) + (match.awayScore || 0), 0)
);

export const selectAverageGoalsPerMatch = createSelector(
  selectPlayedMatches,
  selectTotalGoals,
  (matches, totalGoals) => matches.length > 0 ? totalGoals / matches.length : 0
);

export const selectLeagueProgress = createSelector(
  selectCurrentWeek,
  selectTotalWeeks,
  (currentWeek, totalWeeks) => ({
    current: currentWeek - 1,
    total: totalWeeks,
    percentage: ((currentWeek - 1) / totalWeeks) * 100
  })
);