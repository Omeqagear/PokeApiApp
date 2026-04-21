import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { DataServiceService } from '../services/data-service.service';
import { NatureDetail, PokemonSummary, GrowthRateDetail, CharacteristicDetail } from '../shared/pokemon-api.interfaces';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { catchError, of, forkJoin } from 'rxjs';

const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed'
};

const FLAVOR_NAMES: Record<string, string> = {
  'spicy': 'Spicy',
  'dry': 'Dry',
  'sweet': 'Sweet',
  'bitter': 'Bitter',
  'sour': 'Sour'
};

const GROWTH_RATE_NAMES: Record<string, string> = {
  'erratic': 'Erratic',
  'fast': 'Fast',
  'medium-fast': 'Medium Fast',
  'medium-slow': 'Medium Slow',
  'slow': 'Slow',
  'fluctuating': 'Fluctuating'
};

const GROWTH_RATE_FORMULAS: Record<string, string> = {
  'erratic': 'If L < 50: (L³ × (100 − L)) / 50\nIf 50 ≤ L ≤ 68: (L³ × (150 − L)) / 100\nIf 68 < L ≤ 98: (L³ × ⌊(1911 − 10×L) / 3⌋) / 500\nIf L > 98: (L³ × (160 − L)) / 100',
  'fast': '(4 × L³) / 5',
  'medium-fast': 'L³',
  'medium-slow': '(6 × L³) / 5 − 15 × L² + 100 × L − 140',
  'slow': '(5 × L³) / 4',
  'fluctuating': 'If L < 15: (L³ × (⌊(L + 1) / 3⌋ + 24)) / 50\nIf 15 ≤ L ≤ 35: (L³ × (L + 14)) / 50\nIf L > 35: (L³ × (⌊L / 2⌋ + 32)) / 50'
};

interface NatureDisplay {
  name: string;
  displayName: string;
  increasedStat: string;
  decreasedStat: string;
  likedFlavor: string;
  dislikedFlavor: string;
  isNeutral: boolean;
}

interface GrowthRateDisplay {
  name: string;
  displayName: string;
  formula: string;
  levels: { level: number; experience: number }[];
}

interface CharacteristicDisplay {
  id: number;
  stat: string;
  descriptions: string[];
}

@Component({
  selector: 'app-natures-stats',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    PokeballSpinnerComponent,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './natures-stats.component.html',
  styleUrl: './natures-stats.component.scss'
})
export class NaturesStatsComponent implements OnInit {
  private dataService = inject(DataServiceService);

  natures = signal<NatureDisplay[]>([]);
  growthRates = signal<GrowthRateDisplay[]>([]);
  characteristics = signal<CharacteristicDisplay[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal(0);

  selectedGrowthRate = signal<GrowthRateDisplay | null>(null);

  ngOnInit(): void {
    this.loadNatures();
    this.loadGrowthRates();
    this.loadCharacteristics();
  }

  loadNatures(): void {
    this.dataService.getAllNatures().pipe(
      catchError(() => {
        this.error.set('Failed to load natures');
        return of([]);
      })
    ).subscribe((summaries: PokemonSummary[]) => {
      if (summaries.length === 0) {
        this.loading.set(false);
        return;
      }

      const requests = summaries.map((s: PokemonSummary) => {
        const id = parseInt(s.url.split('/').filter(Boolean).pop() ?? '0', 10);
        return this.dataService.getNatureDetail(id).pipe(
          catchError(() => of(null))
        );
      });

      forkJoin(requests).subscribe((details: (NatureDetail | null)[]) => {
        const validDetails = details.filter((d): d is NatureDetail => d !== null);
        const displayNatures: NatureDisplay[] = validDetails.map((d: NatureDetail) => {
          const increasedStat = d.increased_stat ? d.increased_stat.name : '';
          const decreasedStat = d.decreased_stat ? d.decreased_stat.name : '';
          const likedFlavor = d.likes_flavor ? d.likes_flavor.name : '';
          const dislikedFlavor = d.hates_flavor ? d.hates_flavor.name : '';

          return {
            name: d.name,
            displayName: this.capitalizeName(d.name),
            increasedStat: STAT_NAMES[increasedStat] || '',
            decreasedStat: STAT_NAMES[decreasedStat] || '',
            likedFlavor: FLAVOR_NAMES[likedFlavor] || '',
            dislikedFlavor: FLAVOR_NAMES[dislikedFlavor] || '',
            isNeutral: !increasedStat && !decreasedStat
          };
        });

        this.natures.set(displayNatures);
        this.loading.set(false);
      });
    });
  }

  loadGrowthRates(): void {
    const ids = [1, 2, 3, 4, 5, 6];
    const requests = ids.map((id: number) =>
      this.dataService.getGrowthRateDetail(id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe((details: (GrowthRateDetail | null)[]) => {
      const validDetails = details.filter((d): d is GrowthRateDetail => d !== null);
      const displayRates: GrowthRateDisplay[] = validDetails.map((d: GrowthRateDetail) => ({
        name: d.name,
        displayName: GROWTH_RATE_NAMES[d.name] || this.capitalizeName(d.name),
        formula: GROWTH_RATE_FORMULAS[d.name] || d.formula,
        levels: d.levels
      }));

      this.growthRates.set(displayRates);
    });
  }

  loadCharacteristics(): void {
    const ids = Array.from({ length: 30 }, (_, i) => i + 1);
    const requests = ids.map((id: number) =>
      this.dataService.getCharacteristicDetail(id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe((details: (CharacteristicDetail | null)[]) => {
      const validDetails = details.filter((d): d is CharacteristicDetail => d !== null);
      const displayChars: CharacteristicDisplay[] = validDetails.map((d: CharacteristicDetail) => ({
        id: d.id,
        stat: STAT_NAMES[d.highest_stat.name] || d.highest_stat.name,
        descriptions: d.descriptions
          .filter((desc) => desc.language.name === 'en')
          .map((desc) => desc.description)
      }));

      this.characteristics.set(displayChars);
    });
  }

  capitalizeName(name: string): string {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  getStatColor(stat: string): string {
    const colors: Record<string, string> = {
      'HP': '#ff5959',
      'Attack': '#f5ac78',
      'Defense': '#fae078',
      'Sp. Atk': '#9db7f5',
      'Sp. Def': '#a7db8d',
      'Speed': '#fa92b2'
    };
    return colors[stat] || '#888';
  }

  selectGrowthRate(rate: GrowthRateDisplay): void {
    if (this.selectedGrowthRate() === rate) {
      this.selectedGrowthRate.set(null);
    } else {
      this.selectedGrowthRate.set(rate);
    }
  }

  getXPForLevel(rate: GrowthRateDisplay, level: number): number {
    const found = rate.levels.find(l => l.level === level);
    return found ? found.experience : 0;
  }

  getMaxXP(rate: GrowthRateDisplay): number {
    if (rate.levels.length === 0) return 0;
    return Math.max(...rate.levels.map(l => l.experience));
  }

  getCharacteristicGrouped(): Map<string, CharacteristicDisplay[]> {
    const grouped = new Map<string, CharacteristicDisplay[]>();
    this.characteristics().forEach((c: CharacteristicDisplay) => {
      if (!grouped.has(c.stat)) {
        grouped.set(c.stat, []);
      }
      const items = grouped.get(c.stat);
      if (items) items.push(c);
    });
    return grouped;
  }
}
