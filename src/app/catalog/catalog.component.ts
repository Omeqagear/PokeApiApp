import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of } from 'rxjs';
import { PokemonSummary, PokemonListResponse } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';
import { TeamService } from '../services/team.service';
import { PokeCardComponent } from '../shared/components/poke-card/poke-card.component';
import { SkeletonCardComponent } from '../shared/components/skeleton-card/skeleton-card.component';
import { GenerationChipComponent } from '../shared/components/generation-chip/generation-chip.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

interface Generation {
  name: string;
  region: string;
  startId: number;
  endId: number;
  color: string;
}

const GENERATIONS: Generation[] = [
  { name: 'Gen I', region: 'Kanto', startId: 1, endId: 151, color: '#ff6b6b' },
  { name: 'Gen II', region: 'Johto', startId: 152, endId: 251, color: '#feca57' },
  { name: 'Gen III', region: 'Hoenn', startId: 252, endId: 386, color: '#48dbfb' },
  { name: 'Gen IV', region: 'Sinnoh', startId: 387, endId: 493, color: '#a29bfe' },
  { name: 'Gen V', region: 'Unova', startId: 494, endId: 649, color: '#55efc4' },
  { name: 'Gen VI', region: 'Kalos', startId: 650, endId: 721, color: '#fd79a8' },
  { name: 'Gen VII', region: 'Alola', startId: 722, endId: 809, color: '#fdcb6e' },
  { name: 'Gen VIII', region: 'Galar', startId: 810, endId: 905, color: '#74b9ff' },
  { name: 'Gen IX', region: 'Paldea', startId: 906, endId: 1025, color: '#ff7675' },
];

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const STATS = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'special-attack', label: 'Sp. Atk' },
  { key: 'special-defense', label: 'Sp. Def' },
  { key: 'speed', label: 'Speed' }
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    PokeCardComponent,
    SkeletonCardComponent,
    GenerationChipComponent,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataServiceService);
  private teamService = inject(TeamService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;

  generations = GENERATIONS;
  pokemonTypes = POKEMON_TYPES;
  stats = STATS;
  readonly limit = 40;
  private observer!: IntersectionObserver;

  // Signal-based state
  pokemons = signal<PokemonSummary[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal<string | null>(null);

  // Pagination (offset into the full PokeAPI list)
  currentOffset = signal(0);
  totalCount = signal(0);
  hasNext = signal(false);
  genLoadedCount = signal(0);

  // Generation filter
  selectedGeneration = signal<Generation | null>(null);

  // Search
  searchForm: FormGroup = this.fb.group({
    searchInput: ['']
  });
  searchResults = signal<PokemonSummary[]>([]);
  isSearching = signal(false);
  searchMode = signal(false);

  // Advanced filters
  selectedTypes = signal<string[]>([]);
  minStat = signal<number>(0);
  maxStat = signal<number>(255);
  statFilterActive = signal<string | null>(null);
  showFilters = signal(false);

  // Computed
  displayedPokemon = computed(() =>
    this.searchMode() ? this.searchResults() : this.pokemons()
  );

  skeletonArray = Array(12).fill(0);

  ngOnInit(): void {
    this.loadPokemonList();
    this.setupSearch();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    if (event.key >= '1' && event.key <= '9' && !(event.target instanceof HTMLInputElement)) {
      const index = parseInt(event.key, 10) - 1;
      if (index < this.generations.length) {
        const gen = index === 0 ? null : this.generations[index];
        this.selectGeneration(gen);
      }
    }
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && this.hasNext() && !this.loadingMore() && !this.searchMode()) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (this.loadMoreTrigger) {
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  private setupSearch(): void {
    this.searchForm.get('searchInput')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const strValue = value !== null && value !== undefined ? String(value).trim() : '';

        if (!strValue) {
          this.searchMode.set(false);
          this.searchResults.set([]);
          return of(null);
        }

        if (/^\d+$/.test(strValue)) {
          const id = parseInt(strValue, 10);
          if (id >= 1 && id <= 1025) {
            this.isSearching.set(true);
            return this.dataService.getPokemonDetail(id).pipe(
              map((data) => {
                this.isSearching.set(false);
                this.searchMode.set(true);
                return [{
                  name: data.name,
                  url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`
                }];
              }),
              catchError(() => {
                this.isSearching.set(false);
                this.searchMode.set(true);
                return of([]);
              })
            );
          }
        }

        this.isSearching.set(true);
        return this.dataService.searchPokemonByName(strValue).pipe(
          map((results) => {
            this.isSearching.set(false);
            this.searchMode.set(true);
            return results;
          }),
          catchError(() => {
            this.isSearching.set(false);
            this.searchMode.set(true);
            return of([]);
          })
        );
      })
    ).subscribe({
      next: (results: PokemonSummary[] | null) => {
        if (results !== null) {
          this.searchResults.set(results);
        }
      }
    });
  }

  private loadPokemonList(isLoadMore = false): void {
    if (isLoadMore) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
    }
    this.error.set(null);

    const gen = this.selectedGeneration();
    const offset = this.currentOffset();
    const genSize = gen ? gen.endId - gen.startId + 1 : 1025;

    this.dataService.getPokemonNames(this.limit, offset).subscribe({
      next: (data: PokemonListResponse) => {
        if (isLoadMore) {
          this.pokemons.update(existing => [...existing, ...data.results]);
        } else {
          this.pokemons.set(data.results);
        }

        this.totalCount.set(genSize);
        this.genLoadedCount.update(c => c + data.results.length);

        const loadedSoFar = this.genLoadedCount();
        this.hasNext.set(loadedSoFar < genSize && data.results.length === this.limit);

        if (isLoadMore) {
          this.loadingMore.set(false);
        } else {
          this.loading.set(false);
        }

        setTimeout(() => this.updateObserver(), 100);
      },
      error: (err) => {
        console.error('Error loading Pokemon list:', err);
        this.error.set('Failed to load Pokemon list. Please try again.');

        if (isLoadMore) {
          this.loadingMore.set(false);
        } else {
          this.loading.set(false);
        }

        setTimeout(() => this.updateObserver(), 100);
      }
    });
  }

  loadMore(): void {
    this.currentOffset.update(current => current + this.limit);
    this.loadPokemonList(true);
  }

  private updateObserver(): void {
    if (this.observer && this.loadMoreTrigger) {
      this.observer.disconnect();
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  selectGeneration(gen: Generation | null): void {
    if (this.selectedGeneration()?.name === gen?.name) return;

    this.selectedGeneration.set(gen);
    this.clearSearch();

    if (gen) {
      // PokeAPI is 0-indexed, so Gen I starts at offset 0
      const offset = gen.startId - 1;
      this.currentOffset.set(offset);
      this.genLoadedCount.set(0);
    } else {
      this.currentOffset.set(0);
      this.genLoadedCount.set(0);
    }

    this.loadPokemonList(false);
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchMode.set(false);
    this.searchResults.set([]);
  }

  extractPokemonId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  addToTeam(id: number, name: string, spriteUrl: string): void {
    if (this.teamService.isTeamFull()) {
      alert('Your team is full! Remove a Pokémon to add more.');
      return;
    }

    const pokemon = new Pokemon(
      id.toString(),
      name,
      spriteUrl,
      'unknown',
      '',
      'unknown',
      'unknown',
      [],
      0,
      1,
      0,
      [],
      0,
      0,
      [],
      []
    );

    const added = this.teamService.addToTeam(pokemon);
    if (added) {
      this.showAddedFeedback(id);
    } else {
      alert('This Pokémon is already in your team!');
    }
  }

  private showAddedFeedback(id: number): void {
    const card = document.querySelector(`[data-pokemon-id="${id}"]`);
    if (card) {
      card.classList.add('added-to-team');
      setTimeout(() => {
        card.classList.remove('added-to-team');
      }, 600);
    }
  }

  isInTeam(id: number): boolean {
    return this.teamService.isInTeam(id);
  }

  toggleFiltersPanel(): void {
    this.showFilters.update(v => !v);
  }

  toggleTypeFilter(type: string): void {
    this.selectedTypes.update(types => {
      if (types.includes(type)) {
        return types.filter(t => t !== type);
      }
      return [...types, type];
    });
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  clearTypeFilters(): void {
    this.selectedTypes.set([]);
  }

  setStatFilter(statKey: string | null): void {
    if (this.statFilterActive() === statKey) {
      this.statFilterActive.set(null);
      this.minStat.set(0);
      this.maxStat.set(255);
    } else {
      this.statFilterActive.set(statKey);
      this.minStat.set(0);
      this.maxStat.set(255);
    }
  }

  updateMinStat(value: number): void {
    this.minStat.set(Math.min(value, this.maxStat()));
  }

  updateMaxStat(value: number): void {
    this.maxStat.set(Math.max(value, this.minStat()));
  }

  clearAllFilters(): void {
    this.selectedTypes.set([]);
    this.statFilterActive.set(null);
    this.minStat.set(0);
    this.maxStat.set(255);
  }

  hasActiveFilters(): boolean {
    return this.selectedTypes().length > 0 || this.statFilterActive() !== null;
  }
}

class Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
  type1: string;
  type2: string;
  move1: string;
  move2: string;
  stats: any[];
  totalStats: number;
  generation: number;
  baseExperience: number;
  types: any[];
  height: number;
  weight: number;
  abilities: any[];
  moves: any[];

  constructor(
    id: string,
    name: string,
    spriteUrl: string,
    type1: string,
    type2: string,
    move1: string,
    move2: string,
    stats: any[],
    totalStats: number,
    generation: number,
    baseExperience: number,
    types: any[],
    height: number,
    weight: number,
    abilities: any[],
    moves: any[]
  ) {
    this.id = typeof id === 'string' ? parseInt(id, 10) : id;
    this.name = name;
    this.spriteUrl = spriteUrl;
    this.type1 = type1;
    this.type2 = type2;
    this.move1 = move1;
    this.move2 = move2;
    this.stats = stats;
    this.totalStats = totalStats;
    this.generation = generation;
    this.baseExperience = baseExperience;
    this.types = types;
    this.height = height;
    this.weight = weight;
    this.abilities = abilities;
    this.moves = moves;
  }
}
