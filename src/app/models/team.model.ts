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
  strength: number; // 1-5 arası takım gücü (ekstra özellik)
}

export interface TeamStats {
  team: Team;
  position: number;
  championshipChance?: number; // Şampiyonluk ihtimali (ekstra özellik)
  isChampionshipPossible?: boolean; // Şampiyonluk şansı var mı
}