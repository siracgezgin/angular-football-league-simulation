// src/app/league/standings-table/standings-table.component.ts

import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TeamStats } from '../../models/team.model';

@Component({
  selector: 'app-standings-table',
  templateUrl: './standings-table.component.html',
  styleUrls: ['./standings-table.component.scss']
})
export class StandingsTableComponent implements OnChanges {
  @Input() standings: TeamStats[] = [];
  @Input() isSeasonFinished: boolean = false;
  @Output() teamClick = new EventEmitter<TeamStats>();

  displayedStandings: TeamStats[] = [];

  ngOnChanges() {
    this.displayedStandings = [...this.standings];
  }

  onTeamClick(teamStats: TeamStats) {
    this.teamClick.emit(teamStats);
  }

  getPositionClass(position: number): string {
    switch (position) {
      case 1:
        return 'champion-row';
      case 2:
        return 'second-row';
      case 3:
        return 'third-row';
      default:
        return 'other-row';
    }
  }

  getPositionIcon(position: number): string {
    switch (position) {
      case 1:
        return 'pi pi-trophy';
      case 2:
        return 'pi pi-medal';
      case 3:
        return 'pi pi-star';
      default:
        return '';
    }
  }

  formatGoalDifference(diff: number): string {
    return diff >= 0 ? `+${diff}` : diff.toString();
  }
}