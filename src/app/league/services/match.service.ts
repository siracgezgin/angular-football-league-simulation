// src/app/league/services/match.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Match, MatchResult, WeekMatches } from '../../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor() { }

  /**
   * Belirli bir haftanın maçlarını getirir
   */
  getMatchesByWeek(matches: Match[], week: number): Observable<Match[]> {
    const weekMatches = matches.filter(match => match.week === week);
    return of(weekMatches);
  }

  /**
   * Tüm maçları haftalara göre gruplar
   */
  getMatchesGroupedByWeek(matches: Match[]): Observable<WeekMatches[]> {
    const weekGroups: { [week: number]: Match[] } = {};

    matches.forEach(match => {
      if (!weekGroups[match.week]) {
        weekGroups[match.week] = [];
      }
      weekGroups[match.week].push(match);
    });

    const weeklyMatches: WeekMatches[] = Object.keys(weekGroups).map(week => ({
      week: parseInt(week),
      matches: weekGroups[parseInt(week)].sort((a, b) => a.id - b.id)
    })).sort((a, b) => a.week - b.week);

    return of(weeklyMatches);
  }

  /**
   * Oynanmış maçları getirir
   */
  getPlayedMatches(matches: Match[]): Observable<Match[]> {
    const playedMatches = matches.filter(match => match.isPlayed);
    return of(playedMatches);
  }

  /**
   * Oynanmamış maçları getirir
   */
  getUpcomingMatches(matches: Match[]): Observable<Match[]> {
    const upcomingMatches = matches.filter(match => !match.isPlayed);
    return of(upcomingMatches);
  }

  /**
   * Belirli bir takımın maçlarını getirir
   */
  getTeamMatches(matches: Match[], teamId: number): Observable<Match[]> {
    const teamMatches = matches.filter(match => 
      match.homeTeam.id === teamId || match.awayTeam.id === teamId
    );
    return of(teamMatches);
  }

  /**
   * Belirli bir takımın oynadığı maçları getirir
   */
  getTeamPlayedMatches(matches: Match[], teamId: number): Observable<Match[]> {
    const teamPlayedMatches = matches.filter(match => 
      (match.homeTeam.id === teamId || match.awayTeam.id === teamId) && match.isPlayed
    );
    return of(teamPlayedMatches);
  }

  /**
   * Belirli bir takımın gelecek maçlarını getirir
   */
  getTeamUpcomingMatches(matches: Match[], teamId: number): Observable<Match[]> {
    const teamUpcomingMatches = matches.filter(match => 
      (match.homeTeam.id === teamId || match.awayTeam.id === teamId) && !match.isPlayed
    );
    return of(teamUpcomingMatches);
  }

  /**
   * Maç sonucunu formatlar
   */
  formatMatchResult(match: Match): string {
    if (!match.isPlayed || match.homeScore === null || match.awayScore === null) {
      return '-:-';
    }
    return `${match.homeScore}:${match.awayScore}`;
  }

  /**
   * Maç sonucuna göre stil class'ı döndürür
   */
  getMatchResultClass(match: Match, teamId?: number): string {
    if (!match.isPlayed) {
      return 'match-upcoming';
    }

    if (!teamId) {
      return 'match-played';
    }

    // Belirli bir takım perspektifinden sonuç
    let isHome = match.homeTeam.id === teamId;
    let teamScore = isHome ? match.homeScore : match.awayScore;
    let opponentScore = isHome ? match.awayScore : match.homeScore;

    if (teamScore! > opponentScore!) {
      return 'match-win';
    } else if (teamScore! < opponentScore!) {
      return 'match-loss';
    } else {
      return 'match-draw';
    }
  }

  /**
   * Maç sonucunu metin olarak döndürür
   */
  getMatchResultText(match: Match, teamId?: number): string {
    if (!match.isPlayed) {
      return 'Oynanmadı';
    }

    if (!teamId) {
      if (match.result === MatchResult.HOME_WIN) {
        return `${match.homeTeam.name} Kazandı`;
      } else if (match.result === MatchResult.AWAY_WIN) {
        return `${match.awayTeam.name} Kazandı`;
      } else {
        return 'Beraberlik';
      }
    }

    // Belirli bir takım perspektifinden
    let isHome = match.homeTeam.id === teamId;
    let teamScore = isHome ? match.homeScore : match.awayScore;
    let opponentScore = isHome ? match.awayScore : match.homeScore;

    if (teamScore! > opponentScore!) {
      return 'Galibiyet';
    } else if (teamScore! < opponentScore!) {
      return 'Mağlubiyet';
    } else {
      return 'Beraberlik';
    }
  }

  /**
   * Maç tarihini formatlar (simülasyon için hafta bilgisi)
   */
  formatMatchDate(match: Match): string {
    return `${match.week}. Hafta`;
  }

  /**
   * Maçın oynanıp oynanmadığını kontrol eder
   */
  isMatchPlayed(match: Match): boolean {
    return match.isPlayed;
  }

  /**
   * Maç detaylarını getirir
   */
  getMatchDetails(matches: Match[], matchId: number): Observable<Match | null> {
    const match = matches.find(m => m.id === matchId);
    return of(match || null);
  }

  /**
   * Hafta bazında maç istatistiklerini hesaplar
   */
  getWeekStatistics(matches: Match[], week: number): Observable<{
    totalMatches: number;
    playedMatches: number;
    totalGoals: number;
    averageGoals: number;
    homeWins: number;
    awayWins: number;
    draws: number;
  }> {
    const weekMatches = matches.filter(m => m.week === week);
    const playedMatches = weekMatches.filter(m => m.isPlayed);
    
    const totalGoals = playedMatches.reduce((total, match) => 
      total + (match.homeScore || 0) + (match.awayScore || 0), 0);
    
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    
    playedMatches.forEach(match => {
      if (match.result === MatchResult.HOME_WIN) homeWins++;
      else if (match.result === MatchResult.AWAY_WIN) awayWins++;
      else if (match.result === MatchResult.DRAW) draws++;
    });

    const statistics = {
      totalMatches: weekMatches.length,
      playedMatches: playedMatches.length,
      totalGoals,
      averageGoals: playedMatches.length > 0 ? totalGoals / playedMatches.length : 0,
      homeWins,
      awayWins,
      draws
    };

    return of(statistics);
  }

  /**
   * Genel lig istatistiklerini hesaplar
   */
  getLeagueStatistics(matches: Match[]): Observable<{
    totalMatches: number;
    playedMatches: number;
    remainingMatches: number;
    totalGoals: number;
    averageGoalsPerMatch: number;
    homeWinPercentage: number;
    awayWinPercentage: number;
    drawPercentage: number;
    highestScoringMatch: Match | null;
    mostGoalsInWeek: { week: number; goals: number };
  }> {
    const playedMatches = matches.filter(m => m.isPlayed);
    const totalGoals = playedMatches.reduce((total, match) => 
      total + (match.homeScore || 0) + (match.awayScore || 0), 0);

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let highestScoringMatch: Match | null = null;
    let maxGoals = -1;

    playedMatches.forEach(match => {
      const matchGoals = (match.homeScore || 0) + (match.awayScore || 0);
      if (matchGoals > maxGoals) {
        maxGoals = matchGoals;
        highestScoringMatch = match;
      }

      if (match.result === MatchResult.HOME_WIN) homeWins++;
      else if (match.result === MatchResult.AWAY_WIN) awayWins++;
      else if (match.result === MatchResult.DRAW) draws++;
    });

    // Hafta bazında en çok gol
    const weekGoals: { [week: number]: number } = {};
    playedMatches.forEach(match => {
      if (!weekGoals[match.week]) weekGoals[match.week] = 0;
      weekGoals[match.week] += (match.homeScore || 0) + (match.awayScore || 0);
    });

    const mostGoalsWeek = Object.entries(weekGoals).reduce((max, [week, goals]) => 
      goals > max.goals ? { week: parseInt(week), goals } : max,
      { week: 1, goals: 0 }
    );

    const statistics = {
      totalMatches: matches.length,
      playedMatches: playedMatches.length,
      remainingMatches: matches.length - playedMatches.length,
      totalGoals,
      averageGoalsPerMatch: playedMatches.length > 0 ? totalGoals / playedMatches.length : 0,
      homeWinPercentage: playedMatches.length > 0 ? (homeWins / playedMatches.length) * 100 : 0,
      awayWinPercentage: playedMatches.length > 0 ? (awayWins / playedMatches.length) * 100 : 0,
      drawPercentage: playedMatches.length > 0 ? (draws / playedMatches.length) * 100 : 0,
      highestScoringMatch,
      mostGoalsInWeek: mostGoalsWeek
    };

    return of(statistics);
  }
}