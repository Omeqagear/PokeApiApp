import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { trigger, style, transition, query, stagger, animate } from '@angular/animations';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of } from 'rxjs';
import { PokemonSummary, PokemonListResponse } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';

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

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  animations: [
    trigger('listStagger', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-15px)' }),
            stagger(
              '30ms',
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0px)' })
              )
            )
          ],
          { optional: true }
        ),
        query(':leave', animate('50ms', style({ opacity: 0 })), {
          optional: true
        })
      ])
    ])
  ]
})
export class CatalogComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  generations = GENERATIONS;
  readonly limit = 40;

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

  // Computed
  displayedPokemon = computed(() =>
    this.searchMode() ? this.searchResults() : this.pokemons()
  );

  ngOnInit(): void {
    this.loadPokemonList();
    this.setupSearch();
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
      },
      error: (err) => {
        console.error('Error loading Pokemon list:', err);
        this.error.set('Failed to load Pokemon list. Please try again.');

        if (isLoadMore) {
          this.loadingMore.set(false);
        } else {
          this.loading.set(false);
        }
      }
    });
  }

  loadMore(): void {
    this.currentOffset.update(current => current + this.limit);
    this.loadPokemonList(true);
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
}
