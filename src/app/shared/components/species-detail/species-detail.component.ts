import { Component, Input, OnInit, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DataServiceService } from '../../../services/data-service.service';
import { PokemonSpeciesDetail, PokemonSummary } from '../../../shared/pokemon-api.interfaces';
import { EvolutionChainComponent } from '../evolution-chain/evolution-chain.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-species-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatChipsModule, EvolutionChainComponent],
  templateUrl: './species-detail.component.html',
  styleUrls: ['./species-detail.component.scss']
})
export class SpeciesDetailComponent implements OnInit, OnChanges {
  private dataService = inject(DataServiceService);

  @Input() pokemonId!: number;
  @Input() speciesData: PokemonSpeciesDetail | null = null;

  species = signal<PokemonSpeciesDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  growthRateName = signal<string>('');

  ngOnInit(): void {
    this.loadSpeciesDetail();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['speciesData'] && this.speciesData) {
      this.species.set(this.speciesData);
      this.loading.set(false);
      if (this.speciesData.growth_rate) {
        this.loadGrowthRateName(this.speciesData.growth_rate);
      }
    }
  }

  loadSpeciesDetail(): void {
    if (this.speciesData) {
      this.species.set(this.speciesData);
      this.loading.set(false);
      if (this.speciesData.growth_rate) {
        this.loadGrowthRateName(this.speciesData.growth_rate);
      }
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.dataService.getPokemonSpeciesDetail(this.pokemonId).pipe(
      catchError(() => {
        this.error.set('Failed to load species data');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe((data) => {
      if (data && data.id) {
        this.species.set(data);
        this.loadGrowthRateName(data.growth_rate);
        this.loading.set(false);
      } else {
        this.error.set('Species data not found');
        this.loading.set(false);
      }
    });
  }

  private loadGrowthRateName(growthRate: PokemonSummary): void {
    const id = parseInt(growthRate.url.split('/').filter(Boolean).pop() ?? '0', 10);
    this.dataService.getGrowthRateDetail(id).pipe(
      catchError(() => of(null))
    ).subscribe((detail) => {
      if (detail) {
        this.growthRateName.set(detail.name);
      }
    });
  }

  getGenus(): string {
    const s = this.species();
    if (!s) return '';
    const englishGenus = s.genera.find(g => g.language.name === 'en');
    return englishGenus?.genus || '';
  }

  getFlavorTexts(): string[] {
    const s = this.species();
    if (!s) return [];
    const englishTexts = s.flavor_text_entries
      .filter(f => f.language.name === 'en')
      .map(f => f.flavor_text.replace(/[\n\f\r]/g, ' '));
    const unique = [...new Set(englishTexts)];
    return unique.slice(-3);
  }

  getGenderRatio(): { male: number; female: number; genderless: boolean } {
    const s = this.species();
    if (!s) return { male: 50, female: 50, genderless: false };
    if (s.gender_rate === -1) return { male: 0, female: 0, genderless: true };
    if (s.gender_rate === 0) return { male: 100, female: 0, genderless: false };
    if (s.gender_rate === 8) return { male: 0, female: 100, genderless: false };
    const femalePercent = (s.gender_rate / 8) * 100;
    return { male: Math.round(100 - femalePercent), female: Math.round(femalePercent), genderless: false };
  }

  getEggGroupNames(): string[] {
    const s = this.species();
    if (!s) return [];
    return s.egg_groups.map(eg => this.capitalize(eg.name));
  }

  getPokedexEntries() {
    const s = this.species();
    if (!s) return [];
    return s.pokedex_numbers.slice(0, 12);
  }

  getVarieties() {
    const s = this.species();
    if (!s) return [];
    return s.varieties;
  }

  getEvolutionChainUrl(): string | null {
    const s = this.species();
    return s?.evolution_chain?.url || null;
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }

  getPokemonIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  trackByEntry(index: number, entry: { entry_number: number; pokedex: PokemonSummary }): string {
    return `${entry.pokedex.name}-${entry.entry_number}`;
  }

  trackByVariety(index: number, variety: { is_default: boolean; pokemon: PokemonSummary }): string {
    return variety.pokemon.name;
  }

  getColorHex(colorName: string | undefined): string {
    const colors: Record<string, string> = {
      black: '#343434', blue: '#5090d6', brown: '#b07840', gray: '#888888',
      green: '#78c850', pink: '#f898d8', purple: '#a040a0', red: '#f08030',
      white: '#f8f8f8', yellow: '#f8d030'
    };
    return colors[colorName || ''] || '#888888';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
    }
  }
}
