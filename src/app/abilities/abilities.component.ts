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

@Component({
  selector: 'app-abilities',
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
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.scss']
})
export class AbilitiesComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataServiceService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('loadMoreTrigger') loadMoreTrigger!: ElementRef;

  readonly limit = 40;
  private observer!: IntersectionObserver;

  abilities = signal<PokemonSummary[]>([]);
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

  displayedAbilities = computed(() =>
    this.searchMode() ? this.searchResults() : this.abilities()
  );

  skeletonArray = Array(12).fill(0);

  ngOnInit(): void {
    this.loadAbilitiesList();
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
        return this.dataService.searchAbilityByName(strValue).pipe(
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

  private loadAbilitiesList(isLoadMore = false): void {
    if (isLoadMore) this.loadingMore.set(true);
    else this.loading.set(true);
    this.error.set(null);

    this.dataService.getAbilitiesList(this.limit, this.currentOffset()).subscribe({
      next: (data) => {
        if (isLoadMore) {
          this.abilities.update(existing => [...existing, ...data.results]);
        } else {
          this.abilities.set(data.results);
        }
        this.totalCount.set(data.count);
        this.loadedCount.update(c => c + data.results.length);
        this.hasNext.set(!!data.next);
        if (isLoadMore) this.loadingMore.set(false);
        else this.loading.set(false);
        setTimeout(() => this.updateObserver(), 100);
      },
      error: (err) => {
        console.error('Error loading abilities:', err);
        this.error.set('Failed to load abilities. Please try again.');
        if (isLoadMore) this.loadingMore.set(false);
        else this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    this.currentOffset.update(current => current + this.limit);
    this.loadAbilitiesList(true);
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

  extractAbilityId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  capitalize(name: string): string {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  navigateToAbility(id: number): void {
    this.router.navigate(['/abilities', id]);
  }
}
