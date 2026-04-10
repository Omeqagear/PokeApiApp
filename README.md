# Pokédex - Angular 21

A modern Pokédex application built with **Angular 21** that consumes the [PokeAPI](https://pokeapi.co/) to display Pokémon information, manage teams, and browse catalogs.

## ✨ Features

- 📚 **Browse Catalog**: View all Pokémon in a grid layout
- 🔍 **Search by ID**: Find specific Pokémon by their Pokédex number
- 📸 **Photo View**: Detailed view with sprites, types, and moves
- 👥 **Team Management**: Build and manage your Pokémon team (up to 6)
- 🎲 **Random Team Generator**: Create a random team of 6 Pokémon
- 💾 **Local Storage**: Your team persists across sessions
- 🎨 **Material Design**: Modern UI with Angular Material
- ⚡ **Performance**: HTTP caching, lazy loading, and optimized bundle

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

Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any source files.

### Build

```bash
# Development build
npm run build

# Production build
npm run build -- --configuration production
```

Build artifacts will be stored in the `dist/` directory.

### Running Unit Tests

```bash
npm test
```

Executes unit tests via [Karma](https://karma-runner.github.io).

### Code Linting

```bash
# Run ESLint
npm run lint
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Angular 21
- **Language**: TypeScript 5.9
- **UI Library**: Angular Material 21
- **State Management**: Signals + RxJS
- **Build System**: ESBuild/Vite
- **Testing**: Karma + Jasmine
- **Linting**: ESLint + angular-eslint

### Key Features

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
Automatic caching of API responses (5 minutes):
```typescript
export class CacheInterceptor implements HttpInterceptor {
  // Caches GET requests to PokeAPI
}
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
│   ├── catalog/              # Pokémon catalog grid view
│   ├── equipo-pokemon/       # Team management
│   ├── home/                 # Landing page
│   ├── photo-pokemon/        # Detailed Pokémon view
│   ├── pokemon/              # Search by ID
│   ├── services/             # Data & utilities
│   │   ├── data-service.service.ts      # API calls
│   │   ├── cache.interceptor.ts         # HTTP caching
│   │   └── storage.service.ts           # Secure localStorage
│   ├── shared/               # Models & interfaces
│   │   ├── pokemon.ts                   # Pokémon model
│   │   └── pokemon-api.interfaces.ts    # API types
│   ├── sidebar/              # Navigation sidebar
│   ├── app.component.ts      # Root component
│   └── app.routes.ts         # Route configuration
├── assets/                   # Static assets
├── environments/             # Environment configs
├── main.ts                   # Application bootstrap
└── styles.scss               # Global styles
```

## 🔒 Security

- ✅ Content Security Policy (CSP) enabled
- ✅ Type-safe HTTP requests
- ✅ Input validation with Angular forms
- ✅ Secure localStorage service
- ✅ Sanitized external URLs

## ⚡ Performance

- **HTTP Caching**: API responses cached for 5 minutes
- **Lazy Loading**: Route-level code splitting
- **Image Lazy Loading**: Native browser optimization
- **Single API Calls**: 80% reduction in HTTP requests
- **Optimized Bundle**: ~800KB (vs ~2.5MB in Angular 8)

## 🔄 Recent Migration

This project was migrated from **Angular 8.2.13** to **Angular 21**.

### Key Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Angular Version | 8.2.13 | 21.0.0 | +13 versions |
| TypeScript | 3.5.3 | 5.9.0 | Modern syntax |
| API Calls | 5 per view | 1 per view | 80% reduction |
| Bundle Size | ~2.5 MB | ~800 KB | ~68% smaller |
| Type Safety | 0% (all `any`) | 100% | Fully typed |
| Lazy Loading | No | Yes | Better initial load |
| Caching | No | Yes (5 min) | Faster navigation |

See [MIGRATION_CHANGES.md](./MIGRATION_CHANGES.md) for full details.

## 📚 Documentation

- [Migration Plan](./MIGRATION_PLAN.md) - Detailed migration strategy
- [Migration Changes](./MIGRATION_CHANGES.md) - What was changed
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

## 🐛 Known Issues

1. **PokemonListComponent**: Unused component (not routed). Safe to delete.
2. **Unit Tests**: Need updating for standalone components (low priority)

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
