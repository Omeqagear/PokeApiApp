# Evolution Chains Filter + Theme Fix Design

**Date:** 2026-04-23
**Status:** Approved

## Problem

1. **Filter badge buttons don't work:** The `selectedTrigger` signal is toggled on click, but `loadChains()` never applies the filter. Chains are loaded without trigger filtering.
2. **Theme colors broken:** Cards and chips use hardcoded fallback colors (`#ffffff`, `#e4e4e4`) and non-existent CSS variables (`--surface`, `--border`, `--primary`) instead of the proper theme system variables.

## Solution

### Approach A: Load All Chains, Filter In-Memory

Load all evolution chains in batches, store in a signal, and use a `computed()` signal to filter by trigger client-side.

### Architecture Changes

#### Data Loading
- Add `allChains` signal to store all loaded `ChainPreview[]`
- Modify `loadChains()` to fetch all chains in batches (limit=100 per request, loop until `hasMore` is false)
- Remove pagination state: `loadingMore`, `hasMore`, `offset`
- Remove intersection observer and scroll-based loading
- Keep `loading` signal for initial load state

#### Trigger Filtering
- Create `filteredChains` computed signal:
  - If no trigger selected: return all chains
  - If trigger selected: filter chains where `chainHasTrigger(chain, triggerName)` returns true
- Add `chainHasTrigger(chainId, triggerName)` method:
  - Uses `DataServiceService.getEvolutionChainById()` which has in-memory caching (`evolutionChainCache`)
  - First batch load already populates the cache, so filtering reads from cache (no additional API calls)
  - Recursively traverses each node's `evolution_details` checking `detail.trigger.name`
  - Returns true if any node in the chain matches the trigger

#### Combined Display Signal
- `displayChains` computed handles both search and trigger filtering:
  1. If searching: return search results filtered by trigger (if any)
  2. If trigger selected: return `filteredChains`
  3. Otherwise: return all chains

#### Theme Color Fixes

| Element | Current (Broken) | Fixed |
|---------|-----------------|-------|
| Card background | `var(--surface-card, #ffffff)` | Keep as-is (already correct) |
| Card border | `var(--border, #e4e4e4)` | `var(--border-default, #D4C4A8)` |
| Card name text | `var(--text-primary, #171717)` | `var(--text-primary, #1A1A1A)` |
| Card meta text | `var(--text-secondary, #525252)` | `var(--text-secondary, #4A4A4A)` |
| Card hover shadow | `rgba(0, 0, 0, 0.1)` | `var(--shadow-card-hover)` |
| Chip background | `var(--surface, #ffffff)` | `var(--surface-card, #ffffff)` |
| Chip border | `var(--border, #e4e4e4)` | `var(--border-default, #D4C4A8)` |
| Chip hover/active | `var(--primary, #8b5cf6)` | `var(--brand-primary, #DC0A2D)` |
| Card image bg | `linear-gradient(135deg, #f8f9fa, #e9ecef)` | `var(--bg-secondary)` |

### Component State (After)

```typescript
signals:
  - allChains: ChainPreview[]
  - selectedTrigger: string | null
  - loading: boolean
  - isSearching: boolean
  - searchResults: ChainPreview[]
  - triggers: EvolutionTriggerDetail[]
  - triggerLoading: boolean

computed:
  - filteredChains: ChainPreview[] (trigger filter applied)
  - displayChains: ChainPreview[] (search + trigger combined)
  - hasResults: boolean
```

### Files Modified

1. **evolution-chains.component.ts**
   - Remove: `loadingMore`, `hasMore`, `offset`, `chains`, `scrollAnchor`, `IntersectionObserver`
   - Add: `allChains`, `filteredChains` computed
   - Modify: `loadChains()` to batch-load all chains
   - Add: `chainHasTrigger(chainId, triggerName)` recursive method
   - Update: `displayChains` to combine search + trigger filtering
   - Remove: `onScroll()`, `setupIntersectionObserver()`, `ngAfterViewInit()`

2. **evolution-chains.component.scss**
   - Fix all CSS variable references to use proper theme tokens
   - Replace `--primary` with `--brand-primary`
   - Replace `--surface` with `--surface-card`
   - Replace `--border` with `--border-default`
   - Update hover shadows to use theme variables

3. **evolution-chains.component.html**
   - Remove `#scrollAnchor` div
   - Remove `loadingMore` spinner section
   - Simplify loading state (no pagination)

### Error Handling

- If a chain fails to load during batch fetch, skip it and continue
- If trigger filtering causes an API error (cache miss), log and show unfiltered results
- Loading state shows skeleton cards during initial batch load

### Testing

- Verify trigger filter shows/hides correct chains
- Verify search + trigger filter combination works
- Verify dark/light theme colors match design system
- Verify loading state displays correctly
- Verify empty states display when no results match
