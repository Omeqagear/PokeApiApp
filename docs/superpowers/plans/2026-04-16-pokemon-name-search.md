# Pokémon Name Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add substring name search capability to the catalog search bar, supporting both ID and name queries with case-insensitive matching.

**Architecture:** 
- Extend `DataServiceService` with `searchPokemonByName()` method using a cache
- Update `CatalogComponent` search logic to dispatch to ID search or name search based on input type
- Sanitize input (trim, lowercase) before searching
- Use cached Pokémon list for fast substring matching; fetch full list only once

**Tech Stack:** Angular 17+, RxJS, TypeScript, PokeAPI

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/services/data-service.service.ts` | Add `searchPokemonByName()` method |
| `src/app/catalog/catalog.component.ts` | Update search logic for name support |
| `src/app/catalog/catalog.component.html` | Update placeholder text to show name search capability |

---

## Task 1: Add name search method to DataServiceService

**Files:**
- Modify: `src/app/services/data-service.service.ts`

- [ ] **Step 1: Add searchPokemonByName method with caching**

Read the current service file, then add a private cache and the new search method. This avoids fetching all Pokémon on every search by caching them after first load:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PokemonListResponse, PokemonSummary, PokemonDetail } from '../shared/pokemon-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  
  // Cache for all Pokémon to enable fast name searches
  private allPokemonCache: PokemonSummary[] | null = null;

  constructor(private http: HttpClient) {}

  getPokemonNames(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/?limit=${limit}&offset=${offset}`);
  }

  getPokemonDetail(id: number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/${id}/`);
  }

  /**
   * @deprecated Use getPokemonDetail instead
   */
  getPokemonImages(id: number): Observable<PokemonDetail> {
    return this.getPokemonDetail(id);
  }

  /**
   * Search Pokémon by name (case-insensitive substring match)
   * Uses cached list for fast filtering; fetches full list once
   * @param name The name substring to search for
   * @returns Observable of matching Pokémon summaries
   */
  searchPokemonByName(name: string): Observable<PokemonSummary[]> {
    const trimmedName = name.trim().toLowerCase();
    
    if (!trimmedName) {
      return of([]);
    }

    if (this.allPokemonCache) {
      // Use cached data for fast filtering
      return of(this.allPokemonCache.filter(pokemon => 
        pokemon.name.toLowerCase().includes(trimmedName)
      ));
    }

    // First load - fetch full list and cache it
    return this.getPokemonNames(1025, 0).pipe(
      map(response => {
        this.allPokemonCache = response.results;
        return response.results.filter(pokemon => 
          pokemon.name.toLowerCase().includes(trimmedName)
        );
      })
    );
  }
}
```

- [ ] **Step 2: Commit the service changes**

```bash
git add src/app/services/data-service.service.ts
git commit -m "feat: add searchPokemonByName method for name-based search"
```

---

## Task 2: Update CatalogComponent search logic

**Files:**
- Modify: `src/app/catalog/catalog.component.ts`

- [ ] **Step 1: Add method to handle name search results**

In the component, add a new private method to process name search results. The `setupSearch` method currently only handles ID lookups. We need to distinguish between numeric IDs and names:

```typescript
  private handleNameSearchResults(results: PokemonSummary[]): void {
    if (results.length > 0) {
      this.searchMode.set(true);
      this.searchResults.set(results);
      this.totalCount.set(results.length);
    } else {
      this.searchMode.set(true);
      this.searchResults.set([]);
      this.totalCount.set(0);
    }
    this.isSearching.set(false);
  }
```

- [ ] **Step 2: Update setupSearch to handle both ID and name searches**

Modify the `setupSearch` method to detect if input is numeric (ID) or text (name), and route accordingly:

```typescript
  private setupSearch(): void {
    this.searchForm.get('searchInput')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: number | string | null) => {
        const strValue = value !== null && value !== undefined ? String(value).trim() : '';

        if (!strValue) {
          this.searchMode.set(false);
          this.searchResults.set([]);
          return of(null);
        }

        // Check if input is numeric (ID search) or text (name search)
        const isNumeric = /^\d+$/.test(strValue);
        
        if (isNumeric) {
          const id = parseInt(strValue, 10);
          if (id >= 1 && id <= 1025) {
            this.isSearching.set(true);
            return this.dataService.getPokemonDetail(id).pipe(
              map(detail => [{
                name: detail.name,
                url: `https://pokeapi.co/api/v2/pokemon/${detail.id}/`
              }]),
              catchError(() => of<PokemonSummary[]>([]))
            );
          }
        }
        
        // Name search - substring match
        this.isSearching.set(true);
        return this.dataService.searchPokemonByName(strValue);
      })
    ).subscribe({
      next: (data: PokemonSummary[] | null) => {
        if (data) {
          this.searchMode.set(true);
          this.searchResults.set(data);
          this.totalCount.set(data.length);
        }
        this.isSearching.set(false);
      },
      error: () => {
        this.searchMode.set(true);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }
```

- [ ] **Step 3: Commit the component changes**

```bash
git add src/app/catalog/catalog.component.ts
git commit -m "feat: support name-based search with substring matching"
```

---

## Task 3: Update Search Bar Placeholder Text

**Files:**
- Modify: `src/app/catalog/catalog.component.html`

- [ ] **Step 1: Update placeholder to show both ID and name search**

Update line 8 to reflect that both ID and name searches are supported:

```html
<input matInput formControlName="searchInput" type="text" placeholder="e.g., 25 for Pikachu or 'pika' for name">
```

- [ ] **Step 2: Commit the HTML changes**

```bash
git add src/app/catalog/catalog.component.html
git commit -m "docs: update search placeholder to show name search support"
```

---

## Task 4: Verification

- [ ] **Step 1: Run the application**

```bash
ng serve
```

- [ ] **Step 2: Test ID search** - Enter "25", verify Pikachu appears
- [ ] **Step 3: Test name search** - Enter "pika", verify Pikachu appears (case-insensitive)
- [ ] **Step 4: Test partial name search** - Enter "char", verify Charizard and others appear
- [ ] **Step 5: Test empty search** - Clear input, verify all Pokémon appear
- [ ] **Step 6: Run lint** - Ensure no linting errors

```bash
ng lint
```

- [ ] **Step 7: Run tests** - Ensure no test regressions

```bash
ng test --watch=false
```

---

## Implementation Notes

1. **Input Sanitization**: The implementation trims whitespace and handles case-insensitivity by converting both query and Pokémon names to lowercase before comparison.

2. **Search Logic**: 
   - Numeric input → ID lookup via `getPokemonDetail()`
   - Non-numeric input → Name substring search via `searchPokemonByName()`

3. **Error Handling**: Both search paths now have error handlers that clear results and stop loading state.

4. **Backward Compatibility**: Existing ID search functionality remains unchanged.
