// src/app/league/league-dashboard/league-dashboard.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Models
import { TeamStats } from '../../models/team.model';
import { WeekMatches } from '../../models/match.model';

// Store
import {
  selectStandings,
  selectWeeklyMatches,
  selectCurrentWeek,
  selectIsSeasonFinished,
  selectChampion,
  selectLoading,
  selectError,
  selectCanPlayNextWeek,
  selectLeagueProgress
} from '../../store/league/league.selectors';

import {
  playNextWeek,
  playAllSeason,
  resetLeague,
  clearError
} from '../../store/league/league.actions';

@Component({
  selector: 'app-league-dashboard',
  templateUrl: './league-dashboard.component.html',
  styleUrls: ['./league-dashboard.component.scss']
})
export class LeagueDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  standings$ = this.store.select(selectStandings);
  weeklyMatches$ = this.store.select(selectWeeklyMatches);
  currentWeek$ = this.store.select(selectCurrentWeek);
  isSeasonFinished$ = this.store.select(selectIsSeasonFinished);
  champion$ = this.store.select(selectChampion);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  canPlayNextWeek$ = this.store.select(selectCanPlayNextWeek);
  leagueProgress$ = this.store.select(selectLeagueProgress);

  // Component properties
  currentStandings: TeamStats[] = [];
  currentWeekMatches: WeekMatches[] = [];
  selectedWeek = 1;
  showEditDialog = false;

  constructor(private store: Store) {}

  ngOnInit() {
    // Subscribe to standings for local operations
    this.standings$.pipe(takeUntil(this.destroy$)).subscribe(standings => {
      this.currentStandings = standings;
    });

    // Subscribe to weekly matches
    this.weeklyMatches$.pipe(takeUntil(this.destroy$)).subscribe(weeklyMatches => {
      this.currentWeekMatches = weeklyMatches;
    });

    // Auto-clear errors after display
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        console.error('League Error:', error);
        // Error will be auto-cleared by effect after 5 seconds
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sonraki haftayı oynat
   */
  playNextWeek() {
    this.store.dispatch(playNextWeek());
  }

  /**
   * Tüm sezonu oynat
   */
  playAllSeason() {
    this.store.dispatch(playAllSeason());
  }

  /**
   * Ligayı sıfırla
   */
  resetLeague() {
    this.store.dispatch(resetLeague());
  }

  /**
   * Error'ları temizle
   */
  clearError() {
    this.store.dispatch(clearError());
  }

  /**
   * Belirli haftanın maçlarını göster
   */
  selectWeek(week: number) {
    this.selectedWeek = week;
  }

  /**
   * Seçili hafta kontrolü
   */
  isWeekSelected(week: number): boolean {
    return this.selectedWeek === week;
  }

  /**
   * Takım pozisyon rengi
   */
  getPositionClass(position: number): string {
    switch (position) {
      case 1:
        return 'champion-position';
      case 2:
        return 'second-position';
      case 3:
        return 'third-position';
      default:
        return 'other-position';
    }
  }

  /**
   * Maç sonucu rengi
   */
  getMatchResultClass(homeScore: number | null, awayScore: number | null): string {
    if (homeScore === null || awayScore === null) {
      return 'match-not-played';
    }
    
    if (homeScore > awayScore) {
      return 'home-win';
    } else if (homeScore < awayScore) {
      return 'away-win';
    } else {
      return 'match-draw';
    }
  }

  /**
   * Progress bar rengi
   */
  getProgressSeverity(percentage: number): string {
    if (percentage < 30) return 'danger';
    if (percentage < 60) return 'warning';
    if (percentage < 90) return 'info';
    return 'success';
  }

  /**
   * Takım kartı click handler
   */
  onTeamClick(teamStats: TeamStats) {
    console.log('Clicked team:', teamStats.team.name);
    // Gelecekte takım detay modalı açılabilir
  }

  /**
   * Hafta sekmesi click handler
   */
  onWeekTabClick(week: number) {
    this.selectWeek(week);
  }

  /**
   * Aksiyon buton durumları
   */
  getActionButtonClass(action: string): string {
    switch (action) {
      case 'next':
        return 'p-button-success';
      case 'all':
        return 'p-button-warning';
      case 'reset':
        return 'p-button-danger';
      default:
        return 'p-button-primary';
    }
  }
}