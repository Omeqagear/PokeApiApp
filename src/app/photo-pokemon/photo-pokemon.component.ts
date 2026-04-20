import { Component, OnInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataServiceService } from '../services/data-service.service';
import { FavoritesService } from '../services/favorites.service';
import { TeamService } from '../services/team.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PokemonDetail, PokemonSpecies } from '../shared/pokemon-api.interfaces';
import { Pokemon } from '../shared/pokemon';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { StatBarComponent } from '../shared/components/stat-bar/stat-bar.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EvolutionChainComponent } from '../shared/components/evolution-chain/evolution-chain.component';
import { capitalize, getStatShortName } from '../shared/utils/pokemon.utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-photo-pokemon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TypeBadgeComponent, StatBarComponent, PokeballSpinnerComponent, EvolutionChainComponent],
  templateUrl: './photo-pokemon.component.html',
  styleUrls: ['./photo-pokemon.component.scss']
})
export class PhotoPokemonComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private favoritesService = inject(FavoritesService);
  private teamService = inject(TeamService);

  pokemonId = signal<number | null>(null);
  pokemon = signal<PokemonDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  species = signal<PokemonSpecies | null>(null);
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
    this.species.set(null);

    this.dataService.getPokemonDetail(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: PokemonDetail) => {
        if (data && data.id) {
          this.pokemon.set(data);
          this.loadSpecies(id);
          this.prefetchNeighbors(id);
        } else {
          this.error.set('Pokémon not found.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading Pokémon:', err);
        this.error.set('Failed to load Pokémon details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private loadSpecies(id: number): void {
    this.dataService.getPokemonSpecies(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (speciesData: PokemonSpecies) => {
        if (speciesData && speciesData.id) {
          this.species.set(speciesData);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading species:', err);
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

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.loading()) return;

    switch (event.key) {
      case 'ArrowLeft':
        if (this.hasPrev() && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.navigateToPokemon(this.prevId());
        }
        break;
      case 'ArrowRight':
        if (this.hasNext() && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.navigateToPokemon(this.nextId());
        }
        break;
      case 's':
      case 'S':
        if (!event.ctrlKey && !event.metaKey && !(event.target instanceof HTMLInputElement)) {
          this.toggleShiny();
        }
        break;
      case 'Escape':
        if (event.target instanceof HTMLInputElement) {
          (event.target as HTMLInputElement).blur();
        }
        break;
    }
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

  isFavorite(): boolean {
    const id = this.pokemonId();
    return id !== null ? this.favoritesService.isFavorite(id) : false;
  }

  isInTeam(): boolean {
    const id = this.pokemonId();
    return id !== null ? this.teamService.isInTeam(id) : false;
  }

  toggleFavorite(): void {
    const pokemon = this.pokemon();
    if (pokemon) {
      this.favoritesService.toggleFavorite(pokemon);
    }
  }

  addToTeam(): void {
    const pokemon = this.pokemon();
    if (!pokemon) return;

    if (this.teamService.isTeamFull()) {
      alert('Your team is full! Remove a Pokémon to add more.');
      return;
    }

    if (this.teamService.isInTeam(pokemon.id)) {
      alert('This Pokémon is already in your team!');
      return;
    }

    const pokemonObj = new Pokemon(
      pokemon.id.toString(),
      pokemon.name,
      pokemon.sprites.front_default || '',
      pokemon.types[0]?.type.name || 'unknown',
      pokemon.types[1]?.type.name || '',
      pokemon.moves[0]?.move.name || 'unknown',
      pokemon.moves[1]?.move.name || 'unknown',
      pokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0),
      1,
      pokemon.base_experience,
      pokemon.types,
      pokemon.height,
      pokemon.weight,
      pokemon.abilities,
      pokemon.moves
    );

    const added = this.teamService.addToTeam(pokemonObj);
    if (added) {
      this.teamService.refreshCount();
    }
  }
}
