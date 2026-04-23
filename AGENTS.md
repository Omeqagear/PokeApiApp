# AGENTS.md - PokeApiApp

## Commands
- `ng serve` - Start dev server (hot-reload)
- `ng build --configuration production` - Production build
- `ng test` - Unit tests (Karma)
- `ng lint` - ESLint check
- `ng e2e` - End-to-end tests

## Architecture
- Angular standalone components (no NgModules)
- Routing via `provideRouter` in `main.ts`, lazy-loaded via `loadComponent`
- HTTP requests intercepted by `CacheInterceptor` (registered in `main.ts`)
- All API calls go through `DataServiceService` (PokeAPI v2)
- Team state persisted via `StorageService` (localStorage, prefix: `pokedex_`)
- Progress tracking via `ProgressService` (localStorage, key: `viewed-pokemon`)
- Uses Angular Signals for reactive state management
- New `@if`/`@for` control flow syntax used in newer components

## Routes (app.routes.ts)
- `/` -> `HomeComponent`
- `/catalog` -> `RegionalPokedexComponent` (replaced old CatalogComponent)
- `/team` -> `EquipoPokemonComponent`
- `/favorites` -> `FavoritesComponent`
- `/compare` -> `CompareComponent`
- `/photo/:id` -> `PhotoPokemonComponent`
- `/moves` -> `MovesComponent`
- `/move/:id` -> `MoveDetailComponent`
- `/abilities` -> `AbilitiesComponent`
- `/abilities/:id` -> `AbilityDetailComponent`
- `/evolution-chains` -> `EvolutionChainsComponent`
- `/battle-strategy` -> `BattleStrategyComponent`
- `/locations` -> `LocationsComponent`
- `/types` -> `TypesDeepDiveComponent`
- `/natures` -> `NaturesStatsComponent`
- `/photo/:id` -> `PhotoPokemonComponent`

## Type System
- `pokemon-api.interfaces.ts` defines canonical `PokemonDetail` (with `types[].type.name`, `abilities[].ability.name`)
- `equipo-pokemon` uses `Pokemon` class (from `shared/pokemon.ts`) - different from `PokemonDetail` interface
- `photo-pokemon.component.ts` uses canonical `PokemonDetail` from interfaces file
- `PokemonTypeEntry` has `type: PokemonSummary` so access is `type.type.name` (not `type.name`)
- New interfaces added: `PokemonSpeciesDetail`, `TypeDetail`, `LocationDetail`, `NatureDetail`, `AbilityDetail`, `MoveDetail`, `PokedexDetail`, `RegionDetail`, `EggGroupDetail`, `GrowthRateDetail`, `CharacteristicDetail`, `EvolutionTriggerDetail`
- Max Pokemon ID: 1025

## Services
- `DataServiceService`: All API calls, extensive in-memory caching via Map instances
  - Methods for: Pokemon list/detail, species, evolution, abilities, moves, pokedex, regions, locations, types, natures, egg groups, growth rates, characteristics, evolution triggers
  - `getAllTypesWithDetails()` uses `forkJoin` for parallel requests
  - Cache keys: `pokemonDetailCache`, `pokemonSpeciesCache`, `pokemonSpeciesDetailCache`, `evolutionChainCache`, `abilityDetailCache`, `moveDetailCache`, `pokedexDetailCache`, `locationDetailCache`, `locationAreaDetailCache`, `typeDetailCache`, `natureDetailCache`, `eggGroupDetailCache`, `growthRateCache`
- `StorageService`: localStorage wrapper with prefix `pokedex_`
- `ProgressService`: Tracks viewed Pokemon, persists to localStorage

## PhotoPokemonComponent
- Dark theme with type-based gradient backgrounds
- Stats displayed as colored progress bars (max stat = 255)
- Prev/next navigation arrows for browsing Pokédex sequentially
- Uses official artwork sprites when available, falls back to default
- Floating animation on Pokemon image
- Pokeball spinner during loading

## Shared Components
- `PokeCardComponent`: Pokemon card with sprite, name, types
- `TypeBadgeComponent`: Type-colored badge with size variants (sm, md, lg) and variants (solid, outline, ghost)
- `PokeballSpinnerComponent`: Loading spinner with customizable size and label
- `PageHeaderComponent`: Consistent page headers with title and subtitle
- `SkeletonCardComponent`: Loading placeholder cards
- `StatBarComponent`: Stat visualization bars
- `EvolutionChainComponent`: Evolution chain visualization
- `EmptyStateComponent`: Empty state placeholders
- `GenerationChipComponent`: Generation filter chips
- `SpeciesDetailComponent`: Species information display
- `SpriteGalleryComponent`: Sprite variants gallery
- `StatsRadarComponent`: Radar chart for stats (canvas-based)
- `ShortcutsModalComponent`: Keyboard shortcuts modal

## Encyclopedia Features
- **Moves**: List view with infinite scroll, search, type/damage class filters; detail view with power, accuracy, PP, effects, learned-by Pokemon
- **Abilities**: List view with infinite scroll, search; detail view with English effects, flavor text, Pokemon with ability
- **Regional Pokedex**: 27 regional pokedexes (National, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea, and sub-regional)
- **Types Deep Dive**: Type chart, effectiveness calculator, Pokemon by type, moves by type
- **Battle Strategy**: Interactive type chart matrix, damage calculator (simplified)
- **Locations**: Location browser with details and areas
- **Natures**: Nature stats and battle style preferences
- **Evolution Chains**: Evolution chain browser with triggers

## Styling
- Global theme: `@angular/material/prebuilt-themes/magenta-violet.css`
- All components use SCSS
- Design system CSS variables: `--surface-card`, `--border-default`, `--text-primary`, `--text-secondary`, `--bg-primary`, `--bg-secondary`, `--surface-card-hover`, `--border-subtle`, `--gradient-brand`, `--text-tertiary`, `--text-inverse`, `--shadow-card`, `--shadow-card-hover`, `--brand-primary`
- Type colors via `getTypeColor()` utility in `shared/utils/type.utils`
- Utility functions in `shared/utils/pokemon.utils` (e.g., `capitalize`)
- Dark/light theme support via CSS custom properties

## Navigation
- Sidebar with nav items (computed signal in `SidebarComponent`)
- Badge counts for favorites and team
- Home page with feature cards linking to all major sections
