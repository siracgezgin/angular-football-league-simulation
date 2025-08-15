// src/app/league/league-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeagueDashboardComponent } from './league-dashboard/league-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: LeagueDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeagueRoutingModule { }