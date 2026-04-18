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

## Routes (app.routes.ts)
- `/` -> `HomeComponent`
- `/catalog` -> `CatalogComponent`
- `/team` -> `EquipoPokemonComponent`
- `/photo/:id` -> `PhotoPokemonComponent`

## Type System
- `pokemon-api.interfaces.ts` defines canonical `PokemonDetail` (with `types[].type.name`, `abilities[].ability.name`)
- `equipo-pokemon` uses `Pokemon` class (from `shared/pokemon.ts`) - different from `PokemonDetail` interface
- `photo-pokemon.component.ts` uses canonical `PokemonDetail` from interfaces file
- `PokemonTypeEntry` has `type: PokemonSummary` so access is `type.type.name` (not `type.name`)

## PhotoPokemonComponent
- Dark theme with type-based gradient backgrounds
- Stats displayed as colored progress bars (max stat = 255)
- Prev/next navigation arrows for browsing Pokédex sequentially
- Uses official artwork sprites when available, falls back to default
- Floating animation on Pokemon image
- Pokeball spinner during loading

## Styling
- Global theme: `@angular/material/prebuilt-themes/magenta-violet.css`
- All components use SCSS
