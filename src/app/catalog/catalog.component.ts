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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, style, transition, query, stagger, animate } from '@angular/animations';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of } from 'rxjs';
import { PokemonSummary, PokemonListResponse } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';

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
              '50ms',
              animate(
                '550ms ease-out',
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

  // Signal-based state
  pokemons = signal<PokemonSummary[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal<string | null>(null);
  
  // Pagination
  limit = 40;
  offset = signal(0);
  totalCount = signal(0);
  hasNext = signal(false);

  // Search
  searchForm: FormGroup = this.fb.group({
    searchInput: ['', [Validators.min(1), Validators.max(1025), Validators.pattern('^[0-9]+$')]]
  });
  searchResults = signal<PokemonSummary[]>([]);
  isSearching = signal(false);
  searchMode = signal(false); // true when searching, false when browsing

  // Computed signals
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
          this.totalCount.set(0);
          return of(null);
        }

        // Check if input is numeric (ID search) or text (name search)
        if (/^\d+$/.test(strValue)) {
          // ID search
          const id = parseInt(strValue, 10);
          if (id >= 1 && id <= 1025) {
            this.isSearching.set(true);
            return this.dataService.getPokemonDetail(id).pipe(
              map((data) => {
                this.isSearching.set(false);
                this.searchMode.set(true);
                this.totalCount.set(1);
                return [{
                  name: data.name,
                  url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`
                }];
              }),
              catchError(() => {
                this.isSearching.set(false);
                this.searchMode.set(true);
                this.totalCount.set(0);
                return of([]);
              })
            );
          }
        }

        // Name search (non-numeric)
        this.isSearching.set(true);
        return this.dataService.searchPokemonByName(strValue).pipe(
          map((results) => {
            this.isSearching.set(false);
            this.searchMode.set(true);
            this.totalCount.set(results.length);
            return results;
          }),
          catchError(() => {
            this.isSearching.set(false);
            this.searchMode.set(true);
            this.totalCount.set(0);
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

    this.dataService.getPokemonNames(this.limit, this.offset()).subscribe({
      next: (data: PokemonListResponse) => {
        if (isLoadMore) {
          this.pokemons.update(existing => [...existing, ...data.results]);
        } else {
          this.pokemons.set(data.results);
        }
        
        this.totalCount.set(data.count);
        this.hasNext.set(data.next !== null);
        
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
    this.offset.update(current => current + this.limit);
    this.loadPokemonList(true);
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

  onItem(item: PokemonSummary): number {
    return this.extractPokemonId(item.url);
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }
}
