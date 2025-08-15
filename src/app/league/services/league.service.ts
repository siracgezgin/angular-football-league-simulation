// src/app/services/league.service.ts

import { Injectable } from '@angular/core';

// Interfaces
export interface Team {
  id: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  strength: number; // Takım gücü (0.3-1.0 arası)
}

export interface Match {
  id: number;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  isPlayed: boolean;
  date?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  private readonly TEAM_NAMES = [
    'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
    'Başakşehir', 'Alanyaspor', 'Konyaspor', 'Sivasspor',
    'Gaziantep FK', 'Kayserispor', 'Antalyaspor', 'Rizespor',
    'Hatayspor', 'Kasımpaşa', 'Fatih Karagümrük', 'Adana Demirspor',
    'Ankaragücü', 'İstanbulspor'
  ];

  constructor() {}

  /**
   * 18 takımlı lig için takımları oluşturur
   */
  generateTeams(): Team[] {
    return this.TEAM_NAMES.map((name, index) => ({
      id: index + 1,
      name: name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      strength: this.generateTeamStrength(name) // Takım gücü
    }));
  }

  /**
   * Takım gücü oluşturur (bazı takımlar daha güçlü)
   */
  private generateTeamStrength(teamName: string): number {
    // Büyük takımlar daha yüksek güç değerine sahip
    const strongTeams = ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor'];
    const mediumTeams = ['Başakşehir', 'Alanyaspor', 'Konyaspor', 'Sivasspor'];
    
    if (strongTeams.includes(teamName)) {
      return 0.8 + (Math.random() * 0.2); // 0.8-1.0 arası
    } else if (mediumTeams.includes(teamName)) {
      return 0.6 + (Math.random() * 0.2); // 0.6-0.8 arası
    } else {
      return 0.3 + (Math.random() * 0.3); // 0.3-0.6 arası
    }
  }

  /**
   * Çift devreli lig maç programını oluşturur
   */
  generateFixtures(teams: Team[]): Match[] {
    const matches: Match[] = [];
    let matchId = 1;
    const numTeams = teams.length;
    
    // İlk devre (Hafta 1-17)
    for (let week = 1; week <= numTeams - 1; week++) {
      const weekMatches = this.generateWeekFixtures(teams, week, matchId);
      matches.push(...weekMatches);
      matchId += weekMatches.length;
    }

    // İkinci devre (Hafta 18-34) - ev sahibi ve deplasman takımları yer değiştirir
    for (let week = 1; week <= numTeams - 1; week++) {
      const firstLegMatches = matches.filter(m => m.week === week);
      const secondLegMatches = firstLegMatches.map(match => ({
        id: matchId++,
        week: week + (numTeams - 1),
        homeTeam: match.awayTeam, // Ev sahibi ve deplasman yer değiştir
        awayTeam: match.homeTeam,
        isPlayed: false,
        date: new Date()
      }));
      matches.push(...secondLegMatches);
    }

    return matches;
  }

  /**
   * Belirli bir hafta için maç programı oluşturur
   */
  private generateWeekFixtures(teams: Team[], week: number, startMatchId: number): Match[] {
    const matches: Match[] = [];
    const numTeams = teams.length;
    const rotatedTeams = [...teams];

    // Round-robin algoritması
    if (week > 1) {
      // İlk takım sabit kalır, diğerleri döner
      const teamsToRotate = rotatedTeams.slice(1);
      const rotations = week - 1;
      
      for (let i = 0; i < rotations; i++) {
        teamsToRotate.unshift(teamsToRotate.pop()!);
      }
      
      rotatedTeams.splice(1, numTeams - 1, ...teamsToRotate);
    }

    // Eşleştirmeleri oluştur
    for (let i = 0; i < numTeams / 2; i++) {
      const homeTeam = rotatedTeams[i];
      const awayTeam = rotatedTeams[numTeams - 1 - i];
      
      matches.push({
        id: startMatchId + i,
        week: week,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        isPlayed: false,
        date: new Date()
      });
    }

    return matches;
  }

  /**
   * Bir maçı simüle eder
   */
  simulateMatch(match: Match): Match {
    if (match.isPlayed) {
      return match; // Zaten oynanmışsa değiştirme
    }

    const homeStrength = match.homeTeam.strength;
    const awayStrength = match.awayTeam.strength;
    
    // Ev sahibi avantajı (%15 bonus)
    const homeAdvantage = homeStrength * 1.15;
    
    // Gol sayılarını hesapla
    const homeScore = this.generateScore(homeAdvantage, awayStrength);
    const awayScore = this.generateScore(awayStrength, homeAdvantage);

    const simulatedMatch: Match = {
      ...match,
      homeScore,
      awayScore,
      isPlayed: true
    };

    return simulatedMatch;
  }

  /**
   * Takım gücüne göre gol sayısı üretir
   */
  private generateScore(attackStrength: number, defenseStrength: number): number {
    // Poisson dağılımına benzer bir yaklaşım
    const lambda = (attackStrength / defenseStrength) * 1.5; // Ortalama gol sayısı
    
    // Basit bir random gol üretimi
    const random = Math.random();
    
    if (lambda < 0.5) {
      return random < 0.7 ? 0 : (random < 0.9 ? 1 : 2);
    } else if (lambda < 1.0) {
      return random < 0.4 ? 0 : (random < 0.7 ? 1 : (random < 0.9 ? 2 : 3));
    } else if (lambda < 1.5) {
      return random < 0.3 ? 1 : (random < 0.6 ? 2 : (random < 0.8 ? 3 : 4));
    } else {
      return random < 0.2 ? 2 : (random < 0.5 ? 3 : (random < 0.8 ? 4 : 5));
    }
  }

  /**
   * Puan tablosunu hesaplar
   */
  calculateStandings(teams: Team[], matches: Match[]): Team[] {
    // Takım istatistiklerini sıfırla
    const updatedTeams = teams.map(team => ({
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

    // Oynanmış maçlardan istatistikleri hesapla
    const playedMatches = matches.filter(m => m.isPlayed);
    
    playedMatches.forEach(match => {
      const homeTeam = updatedTeams.find(t => t.id === match.homeTeam.id)!;
      const awayTeam = updatedTeams.find(t => t.id === match.awayTeam.id)!;
      
      homeTeam.played++;
      awayTeam.played++;
      
      homeTeam.goalsFor += match.homeScore!;
      homeTeam.goalsAgainst += match.awayScore!;
      awayTeam.goalsFor += match.awayScore!;
      awayTeam.goalsAgainst += match.homeScore!;
      
      if (match.homeScore! > match.awayScore!) {
        // Ev sahibi kazandı
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
      } else if (match.homeScore! < match.awayScore!) {
        // Deplasman takımı kazandı
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
      } else {
        // Beraberlik
        homeTeam.drawn++;
        homeTeam.points += 1;
        awayTeam.drawn++;
        awayTeam.points += 1;
      }
    });

    // Gol averajını hesapla
    updatedTeams.forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });

    // Sıralama: 1) Puan 2) Gol averajı 3) Atılan gol
    return updatedTeams.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });
  }

  /**
   * Sezonun bitip bitmediğini kontrol eder
   */
  isSeasonFinished(matches: Match[]): boolean {
    return matches.every(match => match.isPlayed);
  }

  /**
   * Belirli bir haftanın maçlarını getirir
   */
  getMatchesByWeek(matches: Match[], week: number): Match[] {
    return matches.filter(match => match.week === week);
  }

  /**
   * Oynanmamış maçları getirir
   */
  getUnplayedMatches(matches: Match[]): Match[] {
    return matches.filter(match => !match.isPlayed);
  }

  /**
   * Toplam hafta sayısını hesaplar
   */
  getTotalWeeks(teams: Team[]): number {
    return (teams.length - 1) * 2; // Çift devreli lig
  }
}