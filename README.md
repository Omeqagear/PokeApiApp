# Pokédex - Angular 21

A modern Pokédex application built with **Angular 21** that consumes the [PokeAPI](https://pokeapi.co/) to display Pokémon information, manage teams, compare stats, and browse the complete catalog of 1025+ Pokémon.

## ✨ Features

### 📚 Pokémon Catalog
- **Complete Pokédex** — Browse all 1025+ Pokémon across 9 generations
- **Infinite scroll** — Loads 40 Pokémon at a time via IntersectionObserver
- **Search by name or ID** — Debounced input (300ms) with direct ID lookup
- **Generation filter chips** — Quick filter by Kanto through Paldea
- **Advanced filters** — Multi-select type filter (18 types) and base stat range filters
- **Active filter badges** — Visual count of applied filters with clear-all option
- **Skeleton loading cards** — Shimmer animation while data loads
- **Add to team** — Directly from catalog cards with visual feedback animation

### 📸 Pokémon Detail Page
- **Official artwork sprites** — High-quality images with shiny toggle
- **Type-based gradient backgrounds** — Dynamic per Pokémon type
- **Type-based image glow effects** — Ambient glow matching Pokémon type
- **Floating animation** — Smooth CSS animation on the main image
- **Base stats as progress bars** — Color-coded by value (max 255)
- **Abilities list** — With hidden ability badge indicator
- **Moves list** — First 8 moves displayed
- **Evolution chain** — Interactive visualization with sprites, evolution details (level, item, trigger, etc.), and clickable nodes
- **Favorite toggle** — Heart icon to save favorites
- **Add to team** — Direct button from detail view
- **Prefetching** — Neighboring Pokémon loaded in advance for instant navigation

### 👥 Team Management
- **Manual team building** — Add/remove Pokémon individually (max 6)
- **Random team generator** — Creates 6 unique random Pokémon
- **META Team Builder** — 6 archetypes with role-based selection:
  - Balanced, Hyper Offense, Stall, Weather Team, Type Synergy, Speed Demon
- **Stat-based team generator** — Select priority stats, get optimal Pokémon
- **Generation filter** — Restrict team builder to specific generations
- **Legendary/Mythical toggle** — Include or exclude legendary Pokémon
- **Export/Import teams** — JSON file download and upload
- **Team persistence** — localStorage with `pokedex_` prefix
- **Valid Pokémon ID caching** — 24h TTL to avoid invalid IDs in random teams
- **Form/Mega exclusion** — Filters out mega, gmax, alola, galar, hisui, paldea forms

### ❤️ Favorites
- **Save up to 50 favorites** — With localStorage persistence
- **Clear all** — With confirmation dialog
- **Add to team** — Directly from favorites list
- **Favorite count badge** — Displayed in sidebar navigation

### ⚔️ Pokémon Comparison
- **Side-by-side stat comparison** — Compare 2 Pokémon at once
- **Autocomplete search** — For both Pokémon slots
- **Stat difference indicators** — Up/down arrows showing advantages
- **Type-colored stat bars** — Visual comparison with type theming
- **Detail cards** — Height, weight, base exp, abilities with hidden tags
- **Swap & clear** — Quick actions for both slots

### 🧭 Navigation
- **6 routes** — Home, Catalog, Team, Favorites, Compare, Photo (`/photo/:id`)
- **Collapsible sidebar** — Icon-only mode with toggle
- **Badge counters** — Team (X/6) and favorites count in sidebar
- **Active route highlighting** — Visual indicator for current page
- **Prev/Next navigation** — Sequential browsing on detail page

### 🎨 Theming & Design
- **Dark/Light mode toggle** — With system preference detection (`prefers-color-scheme`)
- **Theme persistence** — Saved to localStorage
- **CSS custom properties** — Design tokens for all colors, spacing, typography
- **Linear-Stripe hybrid design language** — Modern, clean aesthetic
- **18 Pokémon type themes** — Gradient backgrounds and glow effects per type
- **Angular Material** — Magenta-violet prebuilt theme
- **Responsive design** — Mobile breakpoints and adaptive layouts

### ♿ Accessibility
- **ARIA live region** — Screen reader announcements for route changes
- **Comprehensive ARIA attributes** — `aria-label`, `aria-pressed`, `aria-live`
- **Role attributes** — `list`, `listitem`, `tablist`, `tab`, `tabpanel`, `option`
- **Keyboard navigation** — Full keyboard support throughout:
  - `Ctrl+K` — Focus search in catalog
  - `1-9` — Select generations in catalog
  - `←/→` — Navigate Pokémon on detail page
  - `S` — Toggle shiny variant
  - `Escape` — Blur inputs
- **Focus trap utility** — For modals and dialogs
- **Screen reader only class** — `.sr-only` for hidden labels

### ⚡ Performance
- **HTTP cache interceptor** — 5-minute TTL for PokeAPI GET requests
- **In-memory caches** — Pokémon details, species, evolution chains, full list
- **Lazy-loaded routes** — Code splitting via `loadComponent()`
- **Debounced search** — 300ms delay to reduce API calls
- **IntersectionObserver** — Efficient infinite scroll with 200px root margin
- **Batched API requests** — Team builder loads 50 Pokémon per batch with rate limiting
- **Retry logic** — 2 retries on failed HTTP requests
- **Signal-based state** — Angular 17+ signals for reactive state management
- **Image lazy loading** — Native browser optimization

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd PokeApiApp

# Install dependencies
npm install
```

### Development Server

```bash
npm start
# or
npx ng serve
```

Navigate to [http://localhost:4200/](http://localhost:4200/). The app automatically reloads on file changes.

### Build

```bash
# Development build
npm run watch

# Production build
npm run build
```

Build artifacts are stored in the `dist/` directory.

### Running Unit Tests

```bash
npm test
```

Executes unit tests via [Karma](https://karma-runner.github.io).

### Code Linting

```bash
npm run lint
```

## 🏗️ Architecture

### Tech Stack

| Technology | Version |
|---|---|
| **Framework** | Angular 21 |
| **Language** | TypeScript 5.9 |
| **UI Library** | Angular Material 21 |
| **State Management** | Signals + RxJS |
| **Build System** | ESBuild |
| **Testing** | Karma + Jasmine |
| **Linting** | ESLint + angular-eslint |

### Key Patterns

#### Standalone Components
All components use Angular 21's standalone API (no NgModules):
```typescript
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, MatGridListModule],
  templateUrl: './catalog.component.html'
})
export class CatalogComponent { }
```

#### Lazy Loading Routes
Routes use `loadComponent()` for code splitting:
```typescript
{
  path: 'catalog',
  loadComponent: () => import('./catalog/catalog.component')
    .then(m => m.CatalogComponent)
}
```

#### HTTP Caching
Automatic caching of API responses (5 minutes) via `CacheInterceptor`:
```typescript
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Caches GET requests to PokeAPI
};
```

#### Modern Control Flow
Uses Angular 17+ syntax:
- `@if` instead of `*ngIf`
- `@for` instead of `*ngFor`
- `@switch` instead of `*ngSwitch`

## 📁 Project Structure

```
src/
├── app/
│   ├── catalog/              # Pokémon catalog with infinite scroll & filters
│   ├── compare/              # Side-by-side Pokémon stat comparison
│   ├── equipo-pokemon/       # Team management & META team builder
│   ├── favorites/            # Saved favorites list
│   ├── home/                 # Landing page
│   ├── photo-pokemon/        # Detailed Pokémon view with evolution chain
│   ├── services/             # Core services
│   │   ├── cache.interceptor.ts         # HTTP response caching (5 min)
│   │   ├── data-service.service.ts      # PokeAPI v2 calls
│   │   ├── favorites.service.ts         # Favorites CRUD + localStorage
│   │   ├── storage.service.ts           # Typed localStorage wrapper
│   │   ├── team-builder.service.ts      # META/stat-based team generation
│   │   └── team.service.ts              # Team management (6 Pokémon max)
│   ├── shared/               # Shared code
│   │   ├── components/       # Reusable UI components (9)
│   │   │   ├── evolution-chain/          # Evolution chain visualization
│   │   │   ├── empty-state/              # Empty state with CTA
│   │   │   ├── generation-chip/          # Generation filter button
│   │   │   ├── page-header/              # Page header with stats slot
│   │   │   ├── poke-card/                # Pokémon card component
│   │   │   ├── pokeball-spinner/         # Animated loading spinner
│   │   │   ├── skeleton-card/            # Loading placeholder
│   │   │   ├── stat-bar/                 # Colored stat progress bar
│   │   │   └── type-badge/               # Type label with variants
│   │   ├── services/         # Cross-cutting services
│   │   │   ├── accessibility.service.ts  # ARIA live region, focus management
│   │   │   └── theme.service.ts          # Dark/light mode toggle
│   │   ├── types/            # Type utilities
│   │   │   └── pokemon-transformer.service.ts  # API-to-internal model conversion
│   │   ├── utils/            # Utility functions
│   │   │   ├── pokemon.utils.ts          # Formatting helpers
│   │   │   └── type.utils.ts             # Type color utilities
│   │   ├── pokemon.ts                    # Internal Pokémon model
│   │   └── pokemon-api.interfaces.ts     # PokeAPI response types
│   ├── sidebar/              # Collapsible navigation sidebar
│   ├── app.component.ts      # Root component
│   └── app.routes.ts         # Route configuration
├── styles/                   # Design system
│   ├── tokens/               # Design tokens
│   │   ├── _colors.scss
│   │   ├── _breakpoints.scss
│   │   ├── _effects.scss
│   │   ├── _spacing.scss
│   │   └── _typography.scss
│   ├── themes/               # Theme definitions
│   │   ├── _dark.scss
│   │   ├── _light.scss
│   │   └── _type-themes.scss
│   └── utils/                # SCSS utilities
│       ├── _mixins.scss
│       └── _animations.scss
├── assets/                   # Static assets
├── environments/             # Environment configs
├── main.ts                   # Application bootstrap
└── styles.scss               # Global styles
```

## 🔒 Security

- ✅ Content Security Policy (CSP) enabled
- ✅ Type-safe HTTP requests
- ✅ Input validation with Angular forms
- ✅ Secure localStorage service with scoped prefix
- ✅ Sanitized external URLs

## ⚡ Performance Metrics

| Metric | Value |
|---|---|
| **Initial bundle** | ~818 KB raw / ~165 KB estimated transfer |
| **Lazy chunks** | 15+ route-level code splits |
| **API call reduction** | 80% fewer requests via caching |
| **HTTP cache TTL** | 5 minutes |
| **Search debounce** | 300ms |
| **Infinite scroll batch** | 40 Pokémon per load |
| **Team builder batch** | 50 Pokémon per batch with 100ms rate limit |

## 🔄 Migration History

This project was migrated from **Angular 8.2.13** to **Angular 21**.

### Key Improvements

| Metric | Before | After | Improvement |
|---|---|---|---|
| Angular Version | 8.2.13 | 21.0.0 | +13 versions |
| TypeScript | 3.5.3 | 5.9.0 | Modern syntax |
| API Calls | 5 per view | 1 per view | 80% reduction |
| Bundle Size | ~2.5 MB | ~818 KB | ~67% smaller |
| Type Safety | 0% (all `any`) | 100% | Fully typed |
| Lazy Loading | No | Yes | Better initial load |
| Caching | No | Yes (5 min) | Faster navigation |

See [MIGRATION_CHANGES.md](./MIGRATION_CHANGES.md) for full details.

## 📚 Documentation

- [Migration Plan](./MIGRATION_PLAN.md) — Detailed migration strategy
- [Migration Changes](./MIGRATION_CHANGES.md) — What was changed
- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)

## 🛠️ Development

### Code Style

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable issues
npx ng lint --fix
```

### Adding New Components

```bash
# Generate a new standalone component
npx ng generate component components/my-new-component --standalone

# Generate a service
npx ng generate service services/my-service
```

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using Angular 21**
