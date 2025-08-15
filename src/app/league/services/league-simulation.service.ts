// src/app/league/services/league-simulation.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Team } from '../../models/team.model';
import { Match, MatchResult } from '../../models/match.model';
import { LEAGUE_CONSTANTS } from '../../models/league.constants';

@Injectable({
  providedIn: 'root'
})
export class LeagueSimulationService {

  constructor() { }

  /**
   * Liga başlangıçında takımları oluşturur
   */
  initializeTeams(): Observable<Team[]> {
    const teams: Team[] = LEAGUE_CONSTANTS.TEAM_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      strength: this.getRandomTeamStrength()
    }));

    return of(teams).pipe(delay(500)); // Simülasyon gecikmesi
  }

  /**
   * Fikstürü oluşturur (tüm takımların birbirleriyle oynayacağı maçlar)
   */
  generateFixture(teams: Team[]): Observable<Match[]> {
    const matches: Match[] = [];
    let matchId = 1;
    let week = 1;

    // Her takımın diğer takımlarla birer maç oynayacağı fikstür
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // İlk maç (takım i evde)
        matches.push({
          id: matchId++,
          week,
          homeTeam: {
            id: teams[i].id,
            name: teams[i].name
          },
          awayTeam: {
            id: teams[j].id,
            name: teams[j].name
          },
          homeScore: null,
          awayScore: null,
          isPlayed: false
        });
        
        week++;
        if (week > LEAGUE_CONSTANTS.TOTAL_WEEKS / 2) {
          week = 1;
        }
      }
    }

    // İkinci devre maçları (ters fikstür)
    const firstHalfMatches = [...matches];
    firstHalfMatches.forEach(match => {
      matches.push({
        id: matchId++,
        week: match.week + 3, // İkinci yarı
        homeTeam: match.awayTeam, // Ev sahibi-deplasman yer değiştir
        awayTeam: match.homeTeam,
        homeScore: null,
        awayScore: null,
        isPlayed: false
      });
    });

    return of(matches).pipe(delay(300));
  }

  /**
   * Bir haftalık maçları oynatır
   */
  playWeekMatches(matches: Match[], week: number): Observable<Match[]> {
    const weekMatches = matches.filter(match => match.week === week && !match.isPlayed);
    
    const updatedMatches = matches.map(match => {
      if (match.week === week && !match.isPlayed) {
        const result = this.simulateMatch(
          match.homeTeam.id, 
          match.awayTeam.id,
          this.getTeamStrengthById(matches, match.homeTeam.id),
          this.getTeamStrengthById(matches, match.awayTeam.id)
        );
        
        return {
          ...match,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          isPlayed: true,
          result: result.result
        };
      }
      return match;
    });

    return of(updatedMatches).pipe(delay(800));
  }

  /**
   * Tüm sezonun geri kalanını oynatır
   */
  playAllRemainingSeason(matches: Match[], currentWeek: number): Observable<Match[]> {
    let updatedMatches = [...matches];

    for (let week = currentWeek; week <= LEAGUE_CONSTANTS.TOTAL_WEEKS; week++) {
      updatedMatches = updatedMatches.map(match => {
        if (match.week === week && !match.isPlayed) {
          const result = this.simulateMatch(
            match.homeTeam.id,
            match.awayTeam.id,
            this.getTeamStrengthById(updatedMatches, match.homeTeam.id),
            this.getTeamStrengthById(updatedMatches, match.awayTeam.id)
          );

          return {
            ...match,
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            isPlayed: true,
            result: result.result
          };
        }
        return match;
      });
    }

    return of(updatedMatches).pipe(delay(1200));
  }

  /**
   * Maç sonucunu düzenler
   */
  editMatchResult(matches: Match[], matchId: number, homeScore: number, awayScore: number): Observable<Match> {
    const matchToEdit = matches.find(match => match.id === matchId);
    
    if (!matchToEdit) {
      throw new Error('Maç bulunamadı');
    }

    const result = this.determineResult(homeScore, awayScore);
    
    const updatedMatch: Match = {
      ...matchToEdit,
      homeScore,
      awayScore,
      isPlayed: true,
      result
    };

    return of(updatedMatch).pipe(delay(200));
  }

  /**
   * Tek maç simülasyonu
   */
  private simulateMatch(homeTeamId: number, awayTeamId: number, homeStrength: number, awayStrength: number): {
    homeScore: number;
    awayScore: number;
    result: MatchResult;
  } {
    // Ev sahibi avantajı
    const homeAdvantage = 0.3;
    const adjustedHomeStrength = homeStrength + homeAdvantage;
    
    // Gol sayılarını belirle (takım gücüne göre)
    const homeScore = this.generateGoalCount(adjustedHomeStrength);
    const awayScore = this.generateGoalCount(awayStrength);
    
    const result = this.determineResult(homeScore, awayScore);

    return {
      homeScore,
      awayScore,
      result
    };
  }

  /**
   * Takım gücüne göre gol sayısı üretir
   */
  private generateGoalCount(strength: number): number {
    // Strength 1-5 arası, gol ihtimalini etkiler
    const baseChance = strength / 5; // 0.2 - 1.0 arası
    const random = Math.random();
    
    if (random < 0.1) return 0; // %10 şansla 0 gol
    if (random < 0.3 + (baseChance * 0.2)) return 1; // Güce göre değişen şansla 1 gol
    if (random < 0.7 + (baseChance * 0.15)) return 2; // 2 gol
    if (random < 0.9 + (baseChance * 0.1)) return 3;  // 3 gol
    if (random < 0.98) return 4; // Nadir 4 gol
    return 5; // Çok nadir 5 gol
  }

  /**
   * Maç sonucunu belirler
   */
  private determineResult(homeScore: number, awayScore: number): MatchResult {
    if (homeScore > awayScore) return MatchResult.HOME_WIN;
    if (homeScore < awayScore) return MatchResult.AWAY_WIN;
    return MatchResult.DRAW;
  }

  /**
   * Rastgele takım gücü üretir
   */
  private getRandomTeamStrength(): number {
    return Math.floor(Math.random() * 
      (LEAGUE_CONSTANTS.TEAM_STRENGTH.MAX - LEAGUE_CONSTANTS.TEAM_STRENGTH.MIN + 1)) + 
      LEAGUE_CONSTANTS.TEAM_STRENGTH.MIN;
  }

  /**
   * Takım ID'sine göre takım gücünü bulur
   */
  private getTeamStrengthById(matches: Match[], teamId: number): number {
    // Bu örnekte sabit güçler kullanıyoruz, gerçek uygulamada store'dan alınabilir
    const strengthMap: { [key: number]: number } = {
      1: 4, // Galatasaray
      2: 4, // Fenerbahçe
      3: 3, // Beşiktaş
      4: 3  // Trabzonspor
    };
    
    return strengthMap[teamId] || LEAGUE_CONSTANTS.TEAM_STRENGTH.DEFAULT;
  }

  /**
   * Şampiyonluk ihtimallerini hesaplar (Monte Carlo simülasyonu)
   */
  calculateChampionshipChances(teams: Team[], remainingMatches: Match[]): Observable<{ [teamId: number]: number }> {
    const simulations = 1000;
    const wins: { [teamId: number]: number } = {};
    
    // Başlangıç değerleri
    teams.forEach(team => {
      wins[team.id] = 0;
    });

    // Monte Carlo simülasyonu
    for (let i = 0; i < simulations; i++) {
      const simulatedResults = this.simulateRemainingMatches(teams, remainingMatches);
      const finalStandings = this.calculateFinalStandings(teams, simulatedResults);
      const champion = finalStandings[0];
      wins[champion.id]++;
    }

    // Yüzdelik hesaplama
    const chances: { [teamId: number]: number } = {};
    teams.forEach(team => {
      chances[team.id] = (wins[team.id] / simulations) * 100;
    });

    return of(chances).pipe(delay(500));
  }

  /**
   * Kalan maçları simüle eder
   */
  private simulateRemainingMatches(teams: Team[], remainingMatches: Match[]): Match[] {
    return remainingMatches.map(match => {
      const homeTeam = teams.find(t => t.id === match.homeTeam.id);
      const awayTeam = teams.find(t => t.id === match.awayTeam.id);
      
      const result = this.simulateMatch(
        match.homeTeam.id,
        match.awayTeam.id,
        homeTeam?.strength || 3,
        awayTeam?.strength || 3
      );

      return {
        ...match,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        isPlayed: true,
        result: result.result
      };
    });
  }

  /**
   * Final sıralamayı hesaplar
   */
  private calculateFinalStandings(teams: Team[], simulatedMatches: Match[]): Team[] {
    // Bu fonksiyon reducer'daki calculateStandings fonksiyonuna benzer
    // Basitleştirilmiş hali
    const teamsWithPoints = teams.map(team => {
      let points = team.points;
      let goalDiff = team.goalDifference;

      simulatedMatches.forEach(match => {
        if (match.homeTeam.id === team.id) {
          if (match.result === MatchResult.HOME_WIN) {
            points += LEAGUE_CONSTANTS.POINTS.WIN;
          } else if (match.result === MatchResult.DRAW) {
            points += LEAGUE_CONSTANTS.POINTS.DRAW;
          }
        } else if (match.awayTeam.id === team.id) {
          if (match.result === MatchResult.AWAY_WIN) {
            points += LEAGUE_CONSTANTS.POINTS.WIN;
          } else if (match.result === MatchResult.DRAW) {
            points += LEAGUE_CONSTANTS.POINTS.DRAW;
          }
        }
      });

      return { ...team, points, goalDifference: goalDiff };
    });

    return teamsWithPoints.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      return a.name.localeCompare(b.name);
    });
  }
}