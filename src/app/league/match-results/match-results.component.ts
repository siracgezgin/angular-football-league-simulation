// src/app/league/match-results/match-results.component.ts

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeekMatches, Match } from '../../models/match.model';

@Component({
  selector: 'app-match-results',
  templateUrl: './match-results.component.html',
  styleUrls: ['./match-results.component.scss']
})
export class MatchResultsComponent implements OnChanges {
  @Input() weeklyMatches: WeekMatches[] = [];
  @Input() selectedWeek: number = 1;
  @Input() loading: boolean = false;

  currentWeekMatches: Match[] = [];
  editDialog = false;
  selectedMatch: Match | null = null;
  editScores = { home: 0, away: 0 };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['weeklyMatches'] || changes['selectedWeek']) {
      this.loadCurrentWeekMatches();
    }
  }

  private loadCurrentWeekMatches() {
    const weekData = this.weeklyMatches.find(wm => wm.week === this.selectedWeek);
    this.currentWeekMatches = weekData ? weekData.matches : [];
  }

  getMatchResultClass(match: Match): string {
    if (!match.isPlayed) {
      return 'match-upcoming';
    }

    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;

    if (homeScore > awayScore) {
      return 'match-home-win';
    } else if (homeScore < awayScore) {
      return 'match-away-win';  
    } else {
      return 'match-draw';
    }
  }

  getMatchStatusText(match: Match): string {
    if (!match.isPlayed) {
      return 'Oynanmadı';
    }
    return 'Oynanmış';
  }

  formatScore(match: Match): string {
    if (!match.isPlayed || match.homeScore === null || match.awayScore === null) {
      return '-:-';
    }
    return `${match.homeScore}:${match.awayScore}`;
  }

  openEditDialog(match: Match) {
    if (match.isPlayed) {
      this.selectedMatch = match;
      this.editScores = {
        home: match.homeScore || 0,
        away: match.awayScore || 0
      };
      this.editDialog = true;
    }
  }

  closeEditDialog() {
    this.editDialog = false;
    this.selectedMatch = null;
  }

  saveMatchEdit() {
    if (this.selectedMatch) {
      // Bu fonksiyonu dashboard'da implement edeceğiz
      console.log('Edit match:', this.selectedMatch.id, this.editScores);
      this.closeEditDialog();
    }
  }

  getScoreClass(isHomeTeam: boolean, match: Match): string {
    if (!match.isPlayed) return '';
    
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    
    if (homeScore === awayScore) return 'draw-score';
    
    const isWinner = isHomeTeam ? homeScore > awayScore : awayScore > homeScore;
    return isWinner ? 'winner-score' : 'loser-score';
  }

  getTeamClass(isHomeTeam: boolean, match: Match): string {
    if (!match.isPlayed) return 'team-neutral';
    
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    
    if (homeScore === awayScore) return 'team-draw';
    
    const isWinner = isHomeTeam ? homeScore > awayScore : awayScore > homeScore;
    return isWinner ? 'team-winner' : 'team-loser';
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }
}