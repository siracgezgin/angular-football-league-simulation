// src/app/store/league/league.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, timer } from 'rxjs';
import { 
  map, 
  mergeMap, 
  withLatestFrom, 
  delay,
  tap,
  ignoreElements,
  switchMap,
  catchError
} from 'rxjs/operators';

// Services - Use existing league-simulation.service
import { LeagueSimulationService } from '../../league/services/league-simulation.service';

// Actions
import * as LeagueActions from './league.actions';

// Selectors
import { 
  selectCurrentWeek, 
  selectMatches, 
  selectTeams,
  selectIsSeasonFinished 
} from './league.selectors';

@Injectable()
export class LeagueEffects {

  constructor(
    private actions$: Actions,
    private leagueService: LeagueSimulationService,
    private store: Store
  ) {}

  /**
   * Liga başlatma efekti
   */
  initializeLeague$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.initializeLeague),
      mergeMap(() => {
        // Use the existing service methods which return Observables
        return this.leagueService.initializeTeams().pipe(
          mergeMap(teams => {
            // Generate fixtures using the teams
            return this.leagueService.generateFixture(teams).pipe(
              map(matches => 
                LeagueActions.initializeLeagueSuccess({
                  teams,
                  matches
                })
              ),
              catchError(error => {
                console.error('Generate fixture error:', error);
                return of(
                  LeagueActions.setError({ 
                    error: 'Maç programı oluşturulurken hata oluştu' 
                  })
                );
              })
            );
          }),
          catchError(error => {
            console.error('Initialize teams error:', error);
            return of(
              LeagueActions.setError({ 
                error: 'Liga başlatılırken hata oluştu' 
              })
            );
          })
        );
      })
    )
  );

  /**
   * Sonraki hafta oynama efekti
   */
  playNextWeek$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.playNextWeek),
      withLatestFrom(
        this.store.select(selectCurrentWeek),
        this.store.select(selectMatches),
        this.store.select(selectIsSeasonFinished)
      ),
      mergeMap(([action, currentWeek, matches, isSeasonFinished]) => {
        try {
          // Eğer sezon bitmişse, hata döndür
          if (isSeasonFinished) {
            return of(
              LeagueActions.setError({ 
                error: 'Sezon tamamlandı, yeni hafta oynatılamaz' 
              })
            );
          }

          // Bu haftanın maçlarını bul
          const thisWeekMatches = matches.filter(m => m.week === currentWeek);
          
          if (thisWeekMatches.length === 0) {
            return of(
              LeagueActions.setError({ 
                error: `${currentWeek}. hafta maçları bulunamadı` 
              })
            );
          }

          // Use the existing service method for playing week matches
          return this.leagueService.playWeekMatches(matches, currentWeek).pipe(
            map(updatedMatches => 
              LeagueActions.playNextWeekSuccess({
                matches: updatedMatches.filter(m => m.week === currentWeek && m.isPlayed),
                currentWeek: currentWeek
              })
            ),
            catchError(error => {
              console.error('Play next week error:', error);
              return of(
                LeagueActions.setError({ 
                  error: 'Hafta oynatılırken hata oluştu' 
                })
              );
            })
          );

        } catch (error) {
          console.error('Play next week error:', error);
          return of(
            LeagueActions.setError({ 
              error: 'Hafta oynatılırken hata oluştu' 
            })
          );
        }
      })
    )
  );

  /**
   * Tüm sezonu oynama efekti
   */
  playAllSeason$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.playAllSeason),
      withLatestFrom(
        this.store.select(selectCurrentWeek),
        this.store.select(selectMatches),
        this.store.select(selectIsSeasonFinished)
      ),
      mergeMap(([action, currentWeek, matches, isSeasonFinished]) => {
        try {
          if (isSeasonFinished) {
            return of(
              LeagueActions.setError({ 
                error: 'Sezon zaten tamamlandı' 
              })
            );
          }

          // Oynanmamış tüm maçları bul
          const unplayedMatches = matches.filter(m => !m.isPlayed);
          
          if (unplayedMatches.length === 0) {
            return of(
              LeagueActions.setError({ 
                error: 'Oynanmamış maç bulunamadı' 
              })
            );
          }

          // Use the existing service method for playing all remaining season
          return this.leagueService.playAllRemainingSeason(matches, currentWeek).pipe(
            map(updatedMatches => {
              // Find all played matches from the update
              const newlyPlayedMatches = updatedMatches.filter(m => 
                m.isPlayed && !matches.find(original => 
                  original.id === m.id && original.isPlayed
                )
              );
              
              // Calculate final week
              const finalWeek = Math.max(...newlyPlayedMatches.map(m => m.week));

              return LeagueActions.playAllSeasonSuccess({
                allMatches: newlyPlayedMatches,
                finalWeek: finalWeek
              });
            }),
            catchError(error => {
              console.error('Play all season error:', error);
              return of(
                LeagueActions.setError({ 
                  error: 'Sezon oynatılırken hata oluştu' 
                })
              );
            })
          );

        } catch (error) {
          console.error('Play all season error:', error);
          return of(
            LeagueActions.setError({ 
              error: 'Sezon oynatılırken hata oluştu' 
            })
          );
        }
      })
    )
  );

  /**
   * Liga sıfırlama efekti
   */
  resetLeague$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.resetLeague),
      mergeMap(() => {
        try {
          // 500ms gecikme ile yeni liga başlat
          return timer(500).pipe(
            switchMap(() => of(LeagueActions.initializeLeague()))
          );
        } catch (error) {
          console.error('Reset league error:', error);
          return of(
            LeagueActions.setError({ 
              error: 'Liga sıfırlanırken hata oluştu' 
            })
          );
        }
      })
    )
  );

  /**
   * Loading durumunu ayarlama efekti
   */
  setLoading$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        LeagueActions.playNextWeek,
        LeagueActions.playAllSeason,
        LeagueActions.resetLeague
      ),
      map(() => LeagueActions.setLoading({ loading: true }))
    )
  );

  /**
   * Error auto-clear efekti (5 saniye sonra hataları temizle)
   */
  autoClearError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.setError),
      switchMap(() =>
        timer(5000).pipe(
          map(() => LeagueActions.clearError())
        )
      )
    )
  );

  /**
   * Success action'larında loading'i false yap
   */
  clearLoadingOnSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        LeagueActions.initializeLeagueSuccess,
        LeagueActions.playNextWeekSuccess,
        LeagueActions.playAllSeasonSuccess
      ),
      map(() => LeagueActions.setLoading({ loading: false }))
    )
  );

  /**
   * Error durumlarında loading'i false yap  
   */
  clearLoadingOnError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeagueActions.setError),
      map(() => LeagueActions.setLoading({ loading: false }))
    )
  );

  /**
   * Standings hesaplama efekti - her başarılı hafta sonrasında çalışır
   */
  calculateStandings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        LeagueActions.playNextWeekSuccess,
        LeagueActions.playAllSeasonSuccess
      ),
      map(() => LeagueActions.calculateStandings())
    )
  );
}