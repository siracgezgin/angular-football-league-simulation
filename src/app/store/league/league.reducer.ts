// src/app/store/league/league.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { LeagueState, initialLeagueState } from '../../models/league-state.model';
import { Team, TeamStats } from '../../models/team.model';
import { Match, WeekMatches } from '../../models/match.model';
import { LEAGUE_CONSTANTS } from '../../models/league.constants';
import * as LeagueActions from './league.actions';

export const leagueReducer = createReducer(
  initialLeagueState,
  
  // Initialize League
  on(LeagueActions.initializeLeague, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(LeagueActions.initializeLeagueSuccess, (state, { teams, matches }) => ({
    ...state,
    teams,
    matches,
    standings: calculateStandings(teams, matches),
    weeklyMatches: groupMatchesByWeek(matches),
    loading: false,
    error: null,
    currentWeek: 1,
    isSeasonFinished: false,
    champion: null
  })),
  
  on(LeagueActions.initializeLeagueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Play Next Week
  on(LeagueActions.playNextWeek, (state) => ({
    ...state,
    loading: true
  })),
  
  on(LeagueActions.playNextWeekSuccess, (state, { matches, currentWeek }) => {
    const updatedTeams = updateTeamsFromMatches(state.teams, matches);
    const updatedStandings = calculateStandings(updatedTeams, matches);
    const champion = currentWeek >= LEAGUE_CONSTANTS.TOTAL_WEEKS ? 
      updatedStandings[0]?.team : null;
    
    return {
      ...state,
      matches,
      teams: updatedTeams,
      standings: updatedStandings,
      weeklyMatches: groupMatchesByWeek(matches),
      currentWeek,
      isSeasonFinished: currentWeek >= LEAGUE_CONSTANTS.TOTAL_WEEKS,
      champion,
      loading: false
    };
  }),
  
  // Play All Season
  on(LeagueActions.playAllSeason, (state) => ({
    ...state,
    loading: true
  })),
  
  on(LeagueActions.playAllSeasonSuccess, (state, { allMatches, finalWeek }) => {
    const updatedTeams = updateTeamsFromMatches(state.teams, allMatches);
    const updatedStandings = calculateStandings(updatedTeams, allMatches);
    
    return {
      ...state,
      matches: allMatches,
      teams: updatedTeams,
      standings: updatedStandings,
      weeklyMatches: groupMatchesByWeek(allMatches),
      currentWeek: finalWeek,
      isSeasonFinished: true,
      champion: updatedStandings[0]?.team,
      loading: false
    };
  }),
  
  // Edit Match Result
  on(LeagueActions.editMatchResultSuccess, (state, { updatedMatch }) => {
    const updatedMatches = state.matches.map(match => 
      match.id === updatedMatch.id ? updatedMatch : match
    );
    const updatedTeams = updateTeamsFromMatches(state.teams, updatedMatches);
    const updatedStandings = calculateStandings(updatedTeams, updatedMatches);
    
    return {
      ...state,
      matches: updatedMatches,
      teams: updatedTeams,
      standings: updatedStandings,
      weeklyMatches: groupMatchesByWeek(updatedMatches)
    };
  }),
  
  // Reset League
  on(LeagueActions.resetLeague, () => initialLeagueState),
  
  // Loading
  on(LeagueActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  
  // Error handling
  on(LeagueActions.setError, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  on(LeagueActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);

// Helper Functions
function calculateStandings(teams: Team[], matches: Match[]): TeamStats[] {
  // Reset team stats
  const resetTeams = teams.map(team => ({
    ...team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));

  // Calculate stats from played matches
  const playedMatches = matches.filter(match => match.isPlayed);
  
  playedMatches.forEach(match => {
    const homeTeam = resetTeams.find(team => team.id === match.homeTeam.id);
    const awayTeam = resetTeams.find(team => team.id === match.awayTeam.id);
    
    if (homeTeam && awayTeam && match.homeScore !== null && match.awayScore !== null) {
      // Update goals
      homeTeam.goalsFor += match.homeScore;
      homeTeam.goalsAgainst += match.awayScore;
      awayTeam.goalsFor += match.awayScore;
      awayTeam.goalsAgainst += match.homeScore;
      
      // Update played games
      homeTeam.played++;
      awayTeam.played++;
      
      // Determine result and update points
      if (match.homeScore > match.awayScore) {
        // Home win
        homeTeam.won++;
        homeTeam.points += LEAGUE_CONSTANTS.POINTS.WIN;
        awayTeam.lost++;
      } else if (match.homeScore < match.awayScore) {
        // Away win
        awayTeam.won++;
        awayTeam.points += LEAGUE_CONSTANTS.POINTS.WIN;
        homeTeam.lost++;
      } else {
        // Draw
        homeTeam.drawn++;
        homeTeam.points += LEAGUE_CONSTANTS.POINTS.DRAW;
        awayTeam.drawn++;
        awayTeam.points += LEAGUE_CONSTANTS.POINTS.DRAW;
      }
      
      // Calculate goal difference
      homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
      awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
    }
  });

  // Sort teams by standings rules
  const sortedTeams = resetTeams.sort((a, b) => {
    // 1. Points
    if (a.points !== b.points) return b.points - a.points;
    
    // 2. Goal difference
    if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
    
    // 3. Goals scored
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    
    // 4. Alphabetical order
    return a.name.localeCompare(b.name);
  });

  // Create TeamStats with positions
  return sortedTeams.map((team, index) => ({
    team,
    position: index + 1,
    isChampionshipPossible: isChampionshipPossible(team, sortedTeams, matches)
  }));
}

function updateTeamsFromMatches(teams: Team[], matches: Match[]): Team[] {
  return teams.map(team => {
    const teamMatches = matches.filter(match => 
      (match.homeTeam.id === team.id || match.awayTeam.id === team.id) && match.isPlayed
    );
    
    let stats = {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };
    
    teamMatches.forEach(match => {
      stats.played++;
      
      if (match.homeTeam.id === team.id) {
        stats.goalsFor += match.homeScore || 0;
        stats.goalsAgainst += match.awayScore || 0;
        
        if ((match.homeScore || 0) > (match.awayScore || 0)) {
          stats.won++;
          stats.points += LEAGUE_CONSTANTS.POINTS.WIN;
        } else if ((match.homeScore || 0) < (match.awayScore || 0)) {
          stats.lost++;
        } else {
          stats.drawn++;
          stats.points += LEAGUE_CONSTANTS.POINTS.DRAW;
        }
      } else {
        stats.goalsFor += match.awayScore || 0;
        stats.goalsAgainst += match.homeScore || 0;
        
        if ((match.awayScore || 0) > (match.homeScore || 0)) {
          stats.won++;
          stats.points += LEAGUE_CONSTANTS.POINTS.WIN;
        } else if ((match.awayScore || 0) < (match.homeScore || 0)) {
          stats.lost++;
        } else {
          stats.drawn++;
          stats.points += LEAGUE_CONSTANTS.POINTS.DRAW;
        }
      }
    });
    
    return {
      ...team,
      ...stats,
      goalDifference: stats.goalsFor - stats.goalsAgainst
    };
  });
}

function groupMatchesByWeek(matches: Match[]): WeekMatches[] {
  const weekGroups = matches.reduce((groups, match) => {
    const week = match.week;
    if (!groups[week]) {
      groups[week] = [];
    }
    groups[week].push(match);
    return groups;
  }, {} as { [week: number]: Match[] });

  return Object.keys(weekGroups).map(week => ({
    week: parseInt(week),
    matches: weekGroups[parseInt(week)]
  })).sort((a, b) => a.week - b.week);
}

function isChampionshipPossible(team: Team, allTeams: Team[], matches: Match[]): boolean {
  const remainingMatches = matches.filter(match => !match.isPlayed);
  const maxPossiblePoints = team.points + (remainingMatches.filter(match => 
    match.homeTeam.id === team.id || match.awayTeam.id === team.id
  ).length * LEAGUE_CONSTANTS.POINTS.WIN);
  
  const currentLeaderPoints = allTeams[0].points;
  
  return maxPossiblePoints >= currentLeaderPoints;
}