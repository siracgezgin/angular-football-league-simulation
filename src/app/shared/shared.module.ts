// src/app/shared/shared.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules (shared components için)
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Components
import { LeagueButtonComponent } from './league-button/league-button.component';

@NgModule({
  declarations: [
    LeagueButtonComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule
  ],
  exports: [
    LeagueButtonComponent,
    // PrimeNG modules'leri export et ki diğer modüller kullanabilsin
    ButtonModule,
    RippleModule
  ]
})
export class SharedModule { }