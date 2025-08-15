// src/app/league/league.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

// Routing
import { LeagueRoutingModule } from './league-routing.module';

// Components
import { LeagueDashboardComponent } from './league-dashboard/league-dashboard.component';
import { StandingsTableComponent } from './standings-table/standings-table.component';
import { MatchResultsComponent } from './match-results/match-results.component';

// Shared Module
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LeagueDashboardComponent,
    StandingsTableComponent,
    MatchResultsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LeagueRoutingModule,
    SharedModule,
    
    // PrimeNG Modules
    TableModule,
    ButtonModule,
    CardModule,
    PanelModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ProgressBarModule,
    TooltipModule,
    BadgeModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    DividerModule
  ]
})
export class LeagueModule { }