import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataServiceService } from '../services/data-service.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-photo-pokemon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: './photo-pokemon.component.html',
  styleUrls: ['./photo-pokemon.component.scss']
})
export class PhotoPokemonComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  pokemonId: number | null = null;
  pokemon: PokemonDetail | null = null;
  loading = true;
  error: string | null = null;
  hasPrev = true;
  hasNext = true;
  prevId = 0;
  nextId = 0;
  readonly maxPokemonId = 1025;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataServiceService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((params) => {
      const id = parseInt(params['id'], 10);
      if (!isNaN(id)) {
        this.pokemonId = id;
        this.updateNavButtons();
        this.loadPokemon(id);
        this.prefetchNeighbors(id);
      } else {
        this.error = 'Invalid Pokémon ID';
        this.loading = false;
      }
    });
  }

  private updateNavButtons(): void {
    this.hasPrev = this.pokemonId !== null && this.pokemonId > 1;
    this.hasNext = this.pokemonId !== null && this.pokemonId < this.maxPokemonId;
    this.prevId = this.pokemonId ? this.pokemonId - 1 : 0;
    this.nextId = this.pokemonId ? this.pokemonId + 1 : 0;
  }

  private loadPokemon(id: number): void {
    this.loading = true;
    this.error = null;

    this.dataService.getPokemonDetail(id).subscribe({
      next: (data: PokemonDetail) => {
        if (data && data.id) {
          this.pokemon = data;
        } else {
          this.error = 'Pokémon not found.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading Pokémon:', err);
        this.error = 'Failed to load Pokémon details. Please try again.';
        this.loading = false;
      }
    });
  }

  private prefetchNeighbors(id: number): void {
    if (id > 1) {
      this.dataService.getPokemonDetail(id - 1).subscribe();
    }
    if (id < this.maxPokemonId) {
      this.dataService.getPokemonDetail(id + 1).subscribe();
    }
  }

  navigateToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  navigateToTeam(): void {
    this.router.navigate(['/team']);
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getStatPercentage(baseStat: number): number {
    return Math.min((baseStat / 255) * 100, 100);
  }

  getStatColor(baseStat: number): string {
    if (baseStat >= 150) return '#ff4081';
    if (baseStat >= 120) return '#ff7043';
    if (baseStat >= 90) return '#ffca28';
    if (baseStat >= 60) return '#66bb6a';
    return '#42a5f5';
  }

  getStatShortName(statName: string): string {
    const shortNames: Record<string, string> = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SPA',
      'special-defense': 'SPD',
      'speed': 'SPE'
    };
    return shortNames[statName] || statName;
  }

  getSpriteUrl(pokemon: PokemonDetail): string {
    return pokemon.sprites.other?.['official-artwork']?.front_default
      || pokemon.sprites.front_default
      || '';
  }

  handleImageError(event: Event): void {
    if (!event || !event.target || !(event.target instanceof HTMLImageElement)) {
      return;
    }
    event.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg';
  }
}
