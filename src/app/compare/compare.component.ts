import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { DataServiceService } from '../services/data-service.service';
import { PokemonDetail, PokemonSummary } from '../shared/pokemon-api.interfaces';
import { StatBarComponent } from '../shared/components/stat-bar/stat-bar.component';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { capitalize, getStatShortName } from '../shared/utils/pokemon.utils';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    StatBarComponent,
    TypeBadgeComponent
  ],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private router = inject(Router);

  searchQuery1 = signal('');
  searchQuery2 = signal('');
  pokemonOptions = signal<PokemonSummary[]>([]);
  selectedPokemon1 = signal<PokemonDetail | null>(null);
  selectedPokemon2 = signal<PokemonDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  ngOnInit(): void {
    this.loadAllPokemonNames();
  }

  private loadAllPokemonNames(): void {
    this.dataService.getPokemonNames(1025, 0).pipe(
      catchError(() => of({ count: 0, next: null, previous: null, results: [] } as any))
    ).subscribe(data => {
      if (data?.results) {
        this.pokemonOptions.set(data.results);
      }
    });
  }

  searchPokemon(query: string): PokemonSummary[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return this.pokemonOptions().filter(p =>
      p.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  }

  selectPokemon1(pokemon: PokemonSummary): void {
    const id = this.extractId(pokemon.url);
    if (id) {
      this.loadPokemonById(id, 1);
      this.searchQuery1.set('');
    }
  }

  selectPokemon2(pokemon: PokemonSummary): void {
    const id = this.extractId(pokemon.url);
    if (id) {
      this.loadPokemonById(id, 2);
      this.searchQuery2.set('');
    }
  }

  private extractId(url: string): number | null {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : null;
  }

  loadPokemonById(id: number, slot: 1 | 2): void {
    this.loading.set(true);
    this.dataService.getPokemonDetail(id).pipe(
      catchError(() => {
        this.error.set('Failed to load Pokémon');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe(pokemon => {
      if (pokemon) {
        if (slot === 1) {
          this.selectedPokemon1.set(pokemon);
        } else {
          this.selectedPokemon2.set(pokemon);
        }
      }
      this.loading.set(false);
    });
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  clearPokemon(slot: 1 | 2): void {
    if (slot === 1) {
      this.selectedPokemon1.set(null);
    } else {
      this.selectedPokemon2.set(null);
    }
  }

  swapPokemon(): void {
    const temp = this.selectedPokemon1();
    this.selectedPokemon1.set(this.selectedPokemon2());
    this.selectedPokemon2.set(temp);
  }

  getStatValue(pokemon: PokemonDetail, statName: string): number {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat?.base_stat || 0;
  }

  getStatDifference(pokemon1: PokemonDetail, pokemon2: PokemonDetail, statName: string): number {
    return this.getStatValue(pokemon1, statName) - this.getStatValue(pokemon2, statName);
  }

  capitalize = capitalize;
  getStatShortName = getStatShortName;

  getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
      grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
      ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
      steel: '#B8B8D0', fairy: '#EE99AC'
    };
    return typeColors[type] || '#A8A878';
  }

  getSpriteUrl(pokemon: PokemonDetail): string {
    return pokemon.sprites.other?.['official-artwork']?.front_default
      || pokemon.sprites.front_default
      || '';
  }

  hasShinySprite(pokemon: PokemonDetail): boolean {
    return !!(pokemon.sprites.other?.['official-artwork']?.front_shiny || pokemon.sprites.front_shiny);
  }
}