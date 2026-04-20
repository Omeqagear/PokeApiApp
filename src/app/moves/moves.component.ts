import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of } from 'rxjs';
import { DataServiceService } from '../services/data-service.service';
import { PokemonSummary } from '../shared/pokemon-api.interfaces';
import { SkeletonCardComponent } from '../shared/components/skeleton-card/skeleton-card.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

const MOVE_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const DAMAGE_CLASSES = [
  { key: 'physical', label: 'Physical', icon: 'swords' },
  { key: 'special', label: 'Special', icon: 'auto_awesome' },
  { key: 'status', label: 'Status', icon: 'healing' }
];

@Component({
  selector: 'app-moves',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SkeletonCardComponent,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './moves.component.html',
  styleUrls: ['./moves.component.scss']
})
export class MovesComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataServiceService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;

  moveTypes = MOVE_TYPES;
  damageClasses = DAMAGE_CLASSES;
  readonly limit = 40;
  private observer!: IntersectionObserver;

  moves = signal<PokemonSummary[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal<string | null>(null);

  currentOffset = signal(0);
  totalCount = signal(0);
  hasNext = signal(false);
  loadedCount = signal(0);

  searchForm = this.fb.group({ searchInput: [''] });
  searchResults = signal<PokemonSummary[]>([]);
  isSearching = signal(false);
  searchMode = signal(false);

  selectedType = signal<string | null>(null);
  selectedDamageClass = signal<string | null>(null);
  showFilters = signal(false);

  moveDetailsCache = new Map<number, { power: number | null; accuracy: number | null; pp: number | null; type: string; damageClass: string }>();

  displayedMoves = computed(() =>
    this.searchMode() ? this.searchResults() : this.moves()
  );

  skeletonArray = Array(12).fill(0);

  ngOnInit(): void {
    this.loadMovesList();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasNext() && !this.loadingMore() && !this.searchMode()) {
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
        const strValue = value?.trim() ?? '';
        if (!strValue) {
          this.searchMode.set(false);
          this.searchResults.set([]);
          return of(null);
        }
        this.isSearching.set(true);
        return this.dataService.searchMoveByName(strValue).pipe(
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
        if (results !== null) this.searchResults.set(results);
      }
    });
  }

  private loadMovesList(isLoadMore = false): void {
    if (isLoadMore) this.loadingMore.set(true);
    else this.loading.set(true);
    this.error.set(null);

    this.dataService.getMovesList(this.limit, this.currentOffset()).subscribe({
      next: (data) => {
        if (isLoadMore) {
          this.moves.update(existing => [...existing, ...data.results]);
        } else {
          this.moves.set(data.results);
        }
        this.totalCount.set(data.count);
        this.loadedCount.update(c => c + data.results.length);
        this.hasNext.set(!!data.next);
        if (isLoadMore) this.loadingMore.set(false);
        else this.loading.set(false);
        setTimeout(() => this.updateObserver(), 100);
      },
      error: (err) => {
        console.error('Error loading moves:', err);
        this.error.set('Failed to load moves. Please try again.');
        if (isLoadMore) this.loadingMore.set(false);
        else this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    this.currentOffset.update(current => current + this.limit);
    this.loadMovesList(true);
  }

  private updateObserver(): void {
    if (this.observer && this.loadMoreTrigger) {
      this.observer.disconnect();
      this.observer.observe(this.loadMoreTrigger.nativeElement);
    }
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchMode.set(false);
    this.searchResults.set([]);
  }

  extractMoveId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  capitalize(name: string): string {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  navigateToMove(id: number): void {
    this.router.navigate(['/move', id]);
  }

  toggleTypeFilter(type: string): void {
    this.selectedType.set(this.selectedType() === type ? null : type);
  }

  toggleDamageClassFilter(dc: string): void {
    this.selectedDamageClass.set(this.selectedDamageClass() === dc ? null : dc);
  }

  toggleFiltersPanel(): void {
    this.showFilters.update(v => !v);
  }

  clearAllFilters(): void {
    this.selectedType.set(null);
    this.selectedDamageClass.set(null);
  }

  hasActiveFilters(): boolean {
    return this.selectedType() !== null || this.selectedDamageClass() !== null;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
      grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
      ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
      steel: '#B8B8D0', fairy: '#EE99AC'
    };
    return colors[type] || '#A8A878';
  }

  getDamageClassIcon(dc: string): string {
    const icons: Record<string, string> = { physical: 'swords', special: 'auto_awesome', status: 'healing' };
    return icons[dc] || 'help';
  }

  getDamageClassColor(dc: string): string {
    const colors: Record<string, string> = { physical: '#F08030', special: '#6890F0', status: '#A8A878' };
    return colors[dc] || '#A8A878';
  }
}
