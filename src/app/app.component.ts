// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { initializeLeague } from './store/league/league.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Futbol Ligi Simülasyonu';

  constructor(private store: Store) {}

  ngOnInit() {
    // Uygulama açılırken ligayı başlat
    this.store.dispatch(initializeLeague());
  }
}