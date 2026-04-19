import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataServiceService } from '../services/data-service.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { StatBarComponent } from '../shared/components/stat-bar/stat-bar.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { capitalize, getStatShortName } from '../shared/utils/pokemon.utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-photo-pokemon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TypeBadgeComponent, StatBarComponent, PokeballSpinnerComponent],
  templateUrl: './photo-pokemon.component.html',
  styleUrls: ['./photo-pokemon.component.scss']
})
export class PhotoPokemonComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  pokemonId = signal<number | null>(null);
  pokemon = signal<PokemonDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  hasPrev = signal(true);
  hasNext = signal(true);
  prevId = signal(0);
  nextId = signal(0);
  isShiny = signal(false);
  readonly maxPokemonId = 1025;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataServiceService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params) => {
      const id = parseInt(params['id'], 10);
      if (!isNaN(id)) {
        this.pokemonId.set(id);
        this.updateNavButtons(id);
        this.loadPokemon(id);
      } else {
        this.error.set('Invalid Pokémon ID');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavButtons(id: number): void {
    this.hasPrev.set(id > 1);
    this.hasNext.set(id < this.maxPokemonId);
    this.prevId.set(id > 1 ? id - 1 : 0);
    this.nextId.set(id < this.maxPokemonId ? id + 1 : 0);
  }

  private loadPokemon(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.isShiny.set(false);

    this.dataService.getPokemonDetail(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: PokemonDetail) => {
        if (data && data.id) {
          this.pokemon.set(data);
          this.prefetchNeighbors(id);
        } else {
          this.error.set('Pokémon not found.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading Pokémon:', err);
        this.error.set('Failed to load Pokémon details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private prefetchNeighbors(id: number): void {
    if (id > 1) {
      this.dataService.getPokemonDetail(id - 1).pipe(takeUntil(this.destroy$)).subscribe();
    }
    if (id < this.maxPokemonId) {
      this.dataService.getPokemonDetail(id + 1).pipe(takeUntil(this.destroy$)).subscribe();
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

  capitalize = capitalize;
  getStatShortName = getStatShortName;

  getSpriteUrl(pokemon: PokemonDetail): string {
    if (this.isShiny()) {
      return pokemon.sprites.other?.['official-artwork']?.front_shiny
        || pokemon.sprites.front_shiny
        || pokemon.sprites.other?.['official-artwork']?.front_default
        || pokemon.sprites.front_default
        || '';
    }
    return pokemon.sprites.other?.['official-artwork']?.front_default
      || pokemon.sprites.front_default
      || '';
  }

  toggleShiny(): void {
    this.isShiny.update(v => !v);
  }

  hasShinySprite(pokemon: PokemonDetail): boolean {
    return !!(pokemon.sprites.other?.['official-artwork']?.front_shiny || pokemon.sprites.front_shiny);
  }

  handleImageError(event: Event): void {
    if (!event || !event.target || !(event.target instanceof HTMLImageElement)) {
      return;
    }
    event.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg';
  }
}
