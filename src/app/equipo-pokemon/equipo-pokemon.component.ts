import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forkJoin, of, catchError } from 'rxjs'; // 👈 Added catchError, of
import { Pokemon } from '../shared/pokemon';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-equipo-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './equipo-pokemon.component.html',
  styleUrls: ['./equipo-pokemon.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('* <=> *', animate(300)),
    ]),
  ]
})
export class EquipoPokemonComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private storageService = inject(StorageService);

  // Signal-based state
  teamPokemon = signal<Pokemon[]>([]);
  
  // 👇 NEW: Cache for valid Pokémon IDs
  private validPokemonIds: number[] = [];
  private validPokemonLoaded = false;
  private readonly POKEAPI_LIST_LIMIT = 1350; // Current max in PokeAPI (update as needed)

  ngOnInit(): void {
    this.loadTeamFromStorage();
    // 👇 Optional: Preload valid IDs on init for faster random generation
    // this.loadValidPokemonIds();
  }

  private loadTeamFromStorage(): void {
    const keys = this.storageService.keys();
    const team: Pokemon[] = [];

    keys.forEach(key => {
      const pokemon = this.storageService.get<Pokemon>(key);
      if (pokemon) {
        team.push(pokemon);
      }
    });
    
    this.teamPokemon.set(team);
  }

  deletePokemon(pokemon: Pokemon): void {
    this.storageService.remove(pokemon.id.toString());
    this.teamPokemon.update(team => team.filter(p => p.id !== pokemon.id));
  }

  getPokemonImage(item: Pokemon | any): string {
    if (typeof item.getImage === 'function') {
      return item.getImage();
    }
    return item.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
  }

  deleteTeam(): void {
    this.storageService.clear();
    this.teamPokemon.set([]);
  }

  // 👇 NEW: Load valid Pokémon IDs from PokeAPI list endpoint
  async loadValidPokemonIds(): Promise<void> {
    if (this.validPokemonLoaded) return;
    
    const CACHE_KEY = 'valid_pokemon_ids_cache';
    
    // Try to load from cache first
    const cached = this.storageService.get<{ ids: number[]; timestamp: number }>(CACHE_KEY);
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    
    if (cached?.ids && cached.timestamp && (now - cached.timestamp < CACHE_DURATION)) {
      this.validPokemonIds = cached.ids;
      this.validPokemonLoaded = true;
      return;
    }
    
    try {
      // Fetch the list endpoint - returns all valid Pokémon with URLs
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.POKEAPI_LIST_LIMIT}`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // Extract IDs from URLs: "https://pokeapi.co/api/v2/pokemon/25/" → 25
      this.validPokemonIds = data.results
        .map((p: any) => {
          const match = p.url.match(/\/pokemon\/(\d+)\/$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((id: number | null): id is number => id !== null && id > 0);
      
      // Cache the results
      this.storageService.set(CACHE_KEY, {
        ids: this.validPokemonIds,
        timestamp: now
      });
      
      this.validPokemonLoaded = true;
      
    } catch (error) {
      console.warn('Failed to load valid Pokémon IDs, using fallback range:', error);
      // Fallback to safe range if API fails
      this.validPokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);
      this.validPokemonLoaded = true;
    }
  }

  // 👇 NEW: Helper to get unique random IDs from validated list
  private getRandomUniqueIds(count: number, exclude: number[] = []): number[] {
    const pool = this.validPokemonIds.filter(id => !exclude.includes(id));
    
    // Fisher-Yates shuffle for proper randomness
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }

  // 👇 IMPROVED: Main random team generation method
  async genRandomTeam(): Promise<void> {
    // Ensure we have valid IDs loaded
    if (!this.validPokemonLoaded) {
      await this.loadValidPokemonIds();
    }

    this.deleteTeam();

    // Get 6 unique valid IDs
    const ids = this.getRandomUniqueIds(6);

    // Create requests with individual error handling
    const requests = ids.map(id =>
      this.dataService.getPokemonDetail(id).pipe(
        // Prevent one failed request from breaking the entire forkJoin
        catchError(error => {
          console.warn(`⚠️ Failed to load Pokémon ID ${id}:`, error);
          return of(null); // Return null to filter out later
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        // Filter out failed requests and ensure we have sprites
        const validResults = results.filter(
          (data): data is PokemonDetail => data !== null && !!data?.sprites?.front_default
        );

        // If we got fewer than 6, try to fill gaps (optional recursion)
        if (validResults.length < 6 && validResults.length > 0) {
          
          // Could trigger additional requests here, or just proceed with partial team
        }

        // If all failed, show error
        if (validResults.length === 0) {
          console.error('❌ No valid Pokémon could be loaded');
          alert('Error generating team. Please try again.');
          return;
        }

        // Build Pokemon instances
        const newTeam: Pokemon[] = validResults.map(data => new Pokemon(
          data.id.toString(),
          data.name,
          data.sprites.front_default || '',
          data.types[0]?.type.name ?? 'unknown',
          data.types[1]?.type.name ?? '',
          data.moves[0]?.move.name ?? 'unknown',
          data.moves[1]?.move.name ?? ''
        ));

        // Save to storage and update signal state
        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });

        this.teamPokemon.set(newTeam);
      },
      error: (error) => {
        console.error('💥 Unexpected error in forkJoin:', error);
        alert('Error generating team. Please try again.');
      }
    });
  }
}