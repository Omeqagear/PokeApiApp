# Evolution Chains Filter + Theme Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix evolution chain trigger filter badges to work with client-side filtering, and fix dark/light theme colors on cards and chips.

**Architecture:** Load all evolution chains upfront in batches, store in a signal, and use computed signals for trigger filtering. Replace hardcoded/non-existent CSS variables with proper theme tokens.

**Tech Stack:** Angular 21, Signals, RxJS, SCSS, PokeAPI v2

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/evolution-chains/evolution-chains.component.ts` | Modify | Component logic: batch loading, trigger filtering, state management |
| `src/app/evolution-chains/evolution-chains.component.scss` | Modify | Theme color fixes for cards, chips, backgrounds |
| `src/app/evolution-chains/evolution-chains.component.html` | Modify | Remove pagination elements, simplify template |

---

### Task 1: Update Component State and Remove Pagination

**Files:**
- Modify: `src/app/evolution-chains/evolution-chains.component.ts`

- [ ] **Step 1: Replace pagination state with batch loading state**

Replace the old pagination signals and variables with new state for batch loading:

```typescript
// REMOVE these signals/variables:
// chains = signal<ChainPreview[]>([]);
// loadingMore = signal<boolean>(false);
// hasMore = signal<boolean>(true);
// private offset = 0;
// private observer: IntersectionObserver | null = null;

// ADD/REPLACE with:
allChains = signal<ChainPreview[]>([]);
```

Remove `@ViewChild('scrollAnchor') scrollAnchor!: ElementRef;`

Remove `ngAfterViewInit(): void { this.setupIntersectionObserver(); }`

Remove `setupIntersectionObserver()` method entirely.

Remove `onScroll(): void` method entirely.

- [ ] **Step 2: Update imports**

Remove unused imports: `ViewChild`, `ElementRef`, `AfterViewInit` from the Angular import line.

The import line should become:
```typescript
import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
```

- [ ] **Step 3: Update class implements**

Change `export class EvolutionChainsComponent implements OnInit, AfterViewInit, OnDestroy` to:
```typescript
export class EvolutionChainsComponent implements OnInit, OnDestroy {
```

- [ ] **Step 4: Commit**

```bash
git add src/app/evolution-chains/evolution-chains.component.ts
git commit -m "refactor: remove pagination state from evolution-chains component"
```

---

### Task 2: Implement Batch Loading for All Chains

**Files:**
- Modify: `src/app/evolution-chains/evolution-chains.component.ts`

- [ ] **Step 1: Rewrite loadChains() to batch-load all chains**

Replace the existing `loadChains()` method with:

```typescript
private loadChains(): void {
  this.loading.set(true);
  const allChains: ChainPreview[] = [];
  let offset = 0;
  const limit = 100;

  const loadBatch = (): void => {
    this.dataService.getAllEvolutionChains(limit, offset).pipe(
      switchMap(response => {
        const chainUrls = response.results;
        if (chainUrls.length === 0) return of([]);
        const requests = chainUrls.map(item => {
          const id = extractPokemonId(item.url);
          return this.dataService.getEvolutionChainById(id).pipe(
            catchError(() => of(null))
          );
        });
        return forkJoin(requests);
      }),
      map(chains => {
        const previews: ChainPreview[] = chains
          .filter((chain): chain is EvolutionChain => chain !== null && !!chain && !!chain.id && !!chain.chain)
          .map(chain => this.buildChainPreview(chain));
        return previews;
      }),
      catchError(() => of([]))
    ).subscribe(previews => {
      allChains.push(...previews);
      offset += limit;

      // Check if there are more chains to load
      this.dataService.getAllEvolutionChains(1, offset).pipe(
        map(response => response.results.length > 0),
        catchError(() => of(false))
      ).subscribe(hasMore => {
        if (hasMore) {
          loadBatch();
        } else {
          this.allChains.set(allChains);
          this.loading.set(false);
        }
      });
    });
  };

  loadBatch();
}
```

- [ ] **Step 2: Update ngOnInit to use new loadChains**

The `ngOnInit` already calls `this.loadChains()`, no changes needed there.

- [ ] **Step 3: Commit**

```bash
git add src/app/evolution-chains/evolution-chains.component.ts
git commit -m "feat: implement batch loading for all evolution chains"
```

---

### Task 3: Implement Trigger Filtering Logic

**Files:**
- Modify: `src/app/evolution-chains/evolution-chains.component.ts`

- [ ] **Step 1: Add chainHasTrigger helper method**

Add this method to the component:

```typescript
private chainHasTrigger(chainId: number, triggerName: string): boolean {
  const cached = this.dataService.getEvolutionChainFromCache(chainId);
  if (!cached || !cached.chain) return false;
  return this.linkHasTrigger(cached.chain, triggerName);
}

private linkHasTrigger(link: EvolutionChainLink, triggerName: string): boolean {
  // Check current node's evolution details
  if (link.evolution_details && link.evolution_details.length > 0) {
    const hasMatch = link.evolution_details.some(
      detail => detail.trigger?.name === triggerName
    );
    if (hasMatch) return true;
  }
  // Recursively check child nodes
  if (link.evolves_to && link.evolves_to.length > 0) {
    return link.evolves_to.some(child => this.linkHasTrigger(child, triggerName));
  }
  return false;
}
```

- [ ] **Step 2: Add getEvolutionChainFromCache to DataServiceService**

Add this method to `src/app/services/data-service.service.ts`:

```typescript
getEvolutionChainFromCache(id: number): EvolutionChain | undefined {
  return this.evolutionChainCache.get(id);
}
```

Place it right after the `getEvolutionChainById()` method (around line 478).

- [ ] **Step 3: Add filteredChains computed signal**

Add this computed signal to the component (after the existing `hasResults` computed):

```typescript
filteredChains = computed(() => {
  const trigger = this.selectedTrigger();
  const chains = this.allChains();
  if (!trigger) return chains;
  return chains.filter(chain => this.chainHasTrigger(chain.chainId, trigger));
});
```

- [ ] **Step 4: Update displayChains computed to combine search + trigger filtering**

Replace the existing `displayChains` computed with:

```typescript
displayChains = computed(() => {
  if (this.isSearching()) {
    const searchResults = this.searchResults();
    const trigger = this.selectedTrigger();
    if (!trigger) return searchResults;
    return searchResults.filter(chain => this.chainHasTrigger(chain.chainId, trigger));
  }
  return this.filteredChains();
});
```

- [ ] **Step 5: Commit**

```bash
git add src/app/evolution-chains/evolution-chains.component.ts src/app/services/data-service.service.ts
git commit -m "feat: add trigger filtering logic for evolution chains"
```

---

### Task 4: Update Template to Remove Pagination Elements

**Files:**
- Modify: `src/app/evolution-chains/evolution-chains.component.html`

- [ ] **Step 1: Remove scroll anchor and loading-more elements**

Replace the entire HTML file with:

```html
<div class="evolution-chains-container">
  <ds-page-header
    title="Evolution Chains"
    subtitle="Explore how Pokémon evolve across all families">
  </ds-page-header>

  <div class="controls-section">
    <mat-form-field class="search-field" appearance="outline">
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [formControl]="searchControl"
        placeholder="Search by Pokémon name..."
        type="text"
        autocomplete="off" />
      @if (searchControl.value) {
        <button matSuffix mat-icon-button aria-label="Clear" (click)="searchControl.setValue('')">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>

    <div class="trigger-filters">
      @if (triggerLoading()) {
        <div class="trigger-skeleton-chips">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="trigger-chip skeleton"></div>
          }
        </div>
      } @else {
        @for (trigger of triggers(); track trigger.id) {
          <button
            class="trigger-chip"
            [class.active]="selectedTrigger() === trigger.name"
            (click)="onTriggerFilter(trigger.name)">
            <mat-icon>{{ getTriggerIcon(trigger.name) }}</mat-icon>
            <span>{{ getTriggerLabel(trigger.name) }}</span>
          </button>
        }
      }
    </div>
  </div>

  @if (loading()) {
    <div class="chains-grid">
      @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
        <ds-skeleton-card size="md"></ds-skeleton-card>
      }
    </div>
  } @else if (isSearching() && displayChains().length === 0) {
    <ds-empty-state
      icon="search_off"
      title="No evolution chains found"
      [message]="'No results for \'' + searchControl.value + '\''">
    </ds-empty-state>
  } @else if (!hasResults() && !loading()) {
    <ds-empty-state
      icon="sync_disabled"
      title="No evolution chains available"
      message="Try again later">
    </ds-empty-state>
  } @else {
    <div class="chains-grid">
      @for (chain of displayChains(); track chain.chainId) {
        <div class="chain-card" (click)="onChainClick(chain.basePokemonId)">
          <div class="chain-card-image">
            <img [src]="chain.spriteUrl" [alt]="chain.basePokemonName" loading="lazy" />
            <div class="chain-card-badge">#{{ chain.chainId }}</div>
          </div>
          <div class="chain-card-content">
            <h3 class="chain-card-name">{{ chain.basePokemonName }}</h3>
            <div class="chain-card-meta">
              <span class="chain-stages">
                <mat-icon>account_tree</mat-icon>
                {{ chain.totalStages }} stage{{ chain.totalStages > 1 ? 's' : '' }}
              </span>
              @if (chain.branchCount > 0) {
                <span class="chain-branches">
                  <mat-icon>fork_right</mat-icon>
                  {{ chain.branchCount }} branch{{ chain.branchCount > 1 ? 'es' : '' }}
                </span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  }
</div>
```

Changes made:
- Removed `<div #scrollAnchor class="scroll-anchor"></div>`
- Removed `@if (loadingMore()) { ... }` block

- [ ] **Step 2: Commit**

```bash
git add src/app/evolution-chains/evolution-chains.component.html
git commit -m "refactor: remove pagination elements from evolution-chains template"
```

---

### Task 5: Fix Theme Colors in SCSS

**Files:**
- Modify: `src/app/evolution-chains/evolution-chains.component.scss`

- [ ] **Step 1: Update trigger chip styles**

Replace the `.trigger-chip` block with:

```scss
.trigger-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-default, #D4C4A8);
  border-radius: 24px;
  background: var(--surface-card, #ffffff);
  color: var(--text-secondary, #4A4A4A);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--brand-primary, #DC0A2D);
    color: var(--brand-primary, #DC0A2D);
    background: rgba(220, 10, 45, 0.05);
  }

  &.active {
    border-color: var(--brand-primary, #DC0A2D);
    background: var(--brand-primary, #DC0A2D);
    color: #ffffff;

    mat-icon {
      color: #ffffff;
    }
  }

  mat-icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
  }

  &.skeleton {
    width: 100px;
    height: 36px;
    background: linear-gradient(90deg, var(--gray-100, #f4f4f4) 25%, var(--gray-200, #e4e4e4) 50%, var(--gray-100, #f4f4f4) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border: none;
    cursor: default;
  }
}
```

- [ ] **Step 2: Update chain card styles**

Replace the `.chain-card` block with:

```scss
.chain-card {
  background: var(--surface-card, #ffffff);
  border: 1px solid var(--border-default, #D4C4A8);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover, 6px 6px 0px #1A1A1A);
    border-color: var(--brand-primary, #DC0A2D);

    .chain-card-image::after {
      opacity: 0.1;
    }
  }
}
```

- [ ] **Step 3: Update chain-card-image background**

Replace the `.chain-card-image` block with:

```scss
.chain-card-image {
  position: relative;
  height: 200px;
  background: var(--bg-secondary, #FFF8F0);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--brand-primary, #DC0A2D);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  img {
    width: 140px;
    height: 140px;
    object-fit: contain;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
}
```

- [ ] **Step 4: Update text colors**

Replace `.chain-card-name` with:

```scss
.chain-card-name {
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1A1A1A);
  letter-spacing: -0.01em;
}
```

Replace `.chain-stages, .chain-branches` with:

```scss
.chain-stages,
.chain-branches {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-secondary, #4A4A4A);

  mat-icon {
    font-size: 16px;
    width: 16px;
    height: 16px;
    color: var(--brand-primary, #DC0A2D);
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/evolution-chains/evolution-chains.component.scss
git commit -m "fix: update evolution-chains styles to use proper theme CSS variables"
```

---

### Task 6: Verify and Test

**Files:**
- All modified files

- [ ] **Step 1: Run linting**

```bash
ng lint
```

Expected: No errors. If there are lint errors, fix them before proceeding.

- [ ] **Step 2: Run the dev server**

```bash
ng serve
```

- [ ] **Step 3: Manual testing checklist**

Open the app at `http://localhost:4200` and navigate to `/evolution-chains`. Verify:

1. **Loading state:** Skeleton cards display while chains load
2. **All chains load:** Scroll through and verify all evolution chains are displayed (not just first 20)
3. **Trigger filter badges:** Click each trigger badge (Level Up, Trade, Use Item, Shed, Other)
   - Badge becomes active (red background, white text)
   - Only chains containing that trigger are shown
   - Clicking active badge again deselects it and shows all chains
4. **Search + filter combination:** Type a search term, then click a trigger filter
   - Results should match both search AND trigger
5. **Empty states:** Search for a nonexistent name → shows "No evolution chains found"
6. **Dark theme:** Toggle to dark mode in sidebar
   - Card backgrounds: dark purple (`#221A20`)
   - Card borders: subtle dark border (`#4A3A40`)
   - Text: light colors (`#FFF8F0`, `#D4C4C8`)
   - Trigger chips: dark background, proper borders
   - Card image backgrounds: dark (`#1A1418`)
7. **Light theme:** Toggle back to light mode
   - Card backgrounds: white (`#ffffff`)
   - Card borders: tan (`#D4C4A8`)
   - Text: dark colors (`#1A1A1A`, `#4A4A4A`)
   - Trigger chips: white background, tan borders
   - Active chips: red (`#DC0A2D`)
8. **Card hover:** Hover over cards → shadow appears, border turns red, image scales up

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address any remaining issues from manual testing"
```
