import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, forkJoin, finalize, Subscription } from 'rxjs';
import { DataServiceService } from '../services/data-service.service';
import { EvolutionChain, EvolutionChainLink, EvolutionTriggerDetail } from '../shared/pokemon-api.interfaces';
import { SkeletonCardComponent } from '../shared/components/skeleton-card/skeleton-card.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { capitalize, extractPokemonId, getOfficialArtworkUrl } from '../shared/utils/pokemon.utils';

interface ChainPreview {
  chainId: number;
  basePokemonName: string;
  basePokemonId: number;
  spriteUrl: string;
  totalStages: number;
  branchCount: number;
}

@Component({
  selector: 'app-evolution-chains',
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
  templateUrl: './evolution-chains.component.html',
  styleUrls: ['./evolution-chains.component.scss']
})
export class EvolutionChainsComponent implements OnInit, AfterViewInit, OnDestroy {
  private dataService = inject(DataServiceService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  searchControl = new FormControl('');
  chains = signal<ChainPreview[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  totalCount = signal<number>(0);
  selectedTrigger = signal<string | null>(null);
  searchResults = signal<ChainPreview[]>([]);
  isSearching = signal<boolean>(false);
  triggers = signal<EvolutionTriggerDetail[]>([]);
  triggerLoading = signal<boolean>(false);

  private offset = 0;
  private readonly limit = 20;
  private searchSubscription = new Subscription();
  private observer: IntersectionObserver | null = null;

  displayChains = computed(() => {
    if (this.isSearching()) {
      return this.searchResults();
    }
    return this.chains();
  });

  hasResults = computed(() => this.displayChains().length > 0);

  ngOnInit(): void {
    this.loadTriggers();
    this.loadChains();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.observer?.disconnect();
  }

  private loadTriggers(): void {
    this.triggerLoading.set(true);
    this.dataService.getEvolutionTriggers().pipe(
      catchError(() => of([])),
      finalize(() => this.triggerLoading.set(false))
    ).subscribe(triggers => this.triggers.set(triggers));
  }

  private loadChains(): void {
    if (this.loadingMore() || !this.hasMore() || this.loading() || this.isSearching()) return;

    if (this.offset === 0) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.dataService.getAllEvolutionChains(this.limit, this.offset).pipe(
      switchMap(response => {
        this.totalCount.set(response.count);
        this.hasMore.set(!!response.next);
        const chainUrls = response.results;
        const requests = chainUrls.map(item => {
          const id = extractPokemonId(item.url);
          return this.dataService.getEvolutionChainById(id);
        });
        return forkJoin(requests);
      }),
      map(chains => {
        const previews: ChainPreview[] = chains
          .filter(chain => chain && chain.id && chain.chain)
          .map(chain => this.buildChainPreview(chain));
        return previews;
      }),
      catchError(() => of([])),
      finalize(() => {
        this.loading.set(false);
        this.loadingMore.set(false);
      })
    ).subscribe(previews => {
      if (this.offset === 0) {
        this.chains.set(previews);
      } else {
        this.chains.update(current => [...current, ...previews]);
      }
      this.offset += this.limit;
    });
  }

  private buildChainPreview(chain: EvolutionChain): ChainPreview {
    const baseSpecies = chain.chain.species;
    const basePokemonId = extractPokemonId(baseSpecies.url);
    const totalStages = this.countStages(chain.chain);
    const branchCount = this.countBranches(chain.chain);
    return {
      chainId: chain.id,
      basePokemonName: capitalize(baseSpecies.name),
      basePokemonId,
      spriteUrl: getOfficialArtworkUrl(basePokemonId),
      totalStages,
      branchCount
    };
  }

  private countStages(link: EvolutionChainLink): number {
    if (!link.evolves_to || link.evolves_to.length === 0) return 1;
    let maxDepth = 0;
    for (const evolution of link.evolves_to) {
      const depth = this.countStages(evolution);
      if (depth > maxDepth) maxDepth = depth;
    }
    return 1 + maxDepth;
  }

  private countBranches(link: EvolutionChainLink): number {
    if (!link.evolves_to || link.evolves_to.length === 0) return 0;
    let branches = link.evolves_to.length > 1 ? 1 : 0;
    for (const evolution of link.evolves_to) {
      branches += this.countBranches(evolution);
    }
    return branches;
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length === 0) {
          this.isSearching.set(false);
          this.searchResults.set([]);
          return of([]);
        }
        this.isSearching.set(true);
        return this.dataService.searchPokemonByName(query).pipe(
          switchMap(results => {
            if (results.length === 0) return of([]);
            const requests = results.slice(0, 20).map(pokemon => {
              const id = extractPokemonId(pokemon.url);
              return this.dataService.getPokemonSpecies(id);
            });
            return forkJoin(requests);
          }),
          switchMap(speciesList => {
            const chainUrls = speciesList
              .filter(s => s && s.evolution_chain)
              .map(s => s.evolution_chain?.url ?? '');
            const uniqueUrls = [...new Set(chainUrls)];
            if (uniqueUrls.length === 0) return of([]);
            const requests = uniqueUrls.map(url => {
              const id = extractPokemonId(url);
              return this.dataService.getEvolutionChainById(id);
            });
            return forkJoin(requests);
          }),
          map(chains => {
            const previews: ChainPreview[] = chains
              .filter(chain => chain && chain.id && chain.chain)
              .map(chain => this.buildChainPreview(chain));
            return previews;
          }),
          catchError(() => of([]))
        );
      })
    ).subscribe(previews => {
      this.searchResults.set(previews);
    });
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore() && !this.loading()) {
        this.loadChains();
      }
    }, { rootMargin: '200px' });

    if (this.scrollAnchor?.nativeElement) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  onTriggerFilter(triggerName: string): void {
    if (this.selectedTrigger() === triggerName) {
      this.selectedTrigger.set(null);
    } else {
      this.selectedTrigger.set(triggerName);
    }
  }

  onChainClick(chainId: number): void {
    this.router.navigate(['/photo', chainId]);
  }

  getTriggerLabel(triggerName: string): string {
    const labels: Record<string, string> = {
      'level-up': 'Level Up',
      'trade': 'Trade',
      'use-item': 'Use Item',
      'shed': 'Shed',
      'other': 'Other'
    };
    return labels[triggerName] || capitalize(triggerName);
  }

  getTriggerIcon(triggerName: string): string {
    const icons: Record<string, string> = {
      'level-up': 'trending_up',
      'trade': 'swap_horiz',
      'use-item': 'science',
      'shed': 'bug_report',
      'other': 'more_horiz'
    };
    return icons[triggerName] || 'help_outline';
  }

  onScroll(): void {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;
    if (max - pos <= 500 && this.hasMore() && !this.loadingMore() && !this.loading() && !this.isSearching()) {
      this.loadChains();
    }
  }
}
