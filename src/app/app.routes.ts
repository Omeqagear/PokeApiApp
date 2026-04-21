import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./regional-pokedex/regional-pokedex.component')
      .then(m => m.RegionalPokedexComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./equipo-pokemon/equipo-pokemon.component')
      .then(m => m.EquipoPokemonComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites.component')
      .then(m => m.FavoritesComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./compare/compare.component')
      .then(m => m.CompareComponent)
  },
  {
    path: 'photo/:id',
    loadComponent: () => import('./photo-pokemon/photo-pokemon.component')
      .then(m => m.PhotoPokemonComponent)
  },
  {
    path: 'moves',
    loadComponent: () => import('./moves/moves.component')
      .then(m => m.MovesComponent)
  },
  {
    path: 'move/:id',
    loadComponent: () => import('./moves/move-detail/move-detail.component')
      .then(m => m.MoveDetailComponent)
  },
  {
    path: 'abilities',
    loadComponent: () => import('./abilities/abilities.component')
      .then(m => m.AbilitiesComponent)
  },
  {
    path: 'abilities/:id',
    loadComponent: () => import('./abilities/ability-detail/ability-detail.component')
      .then(m => m.AbilityDetailComponent)
  },
  {
    path: 'evolution-chains',
    loadComponent: () => import('./evolution-chains/evolution-chains.component')
      .then(m => m.EvolutionChainsComponent)
  },
  {
    path: 'battle-strategy',
    loadComponent: () => import('./battle-strategy/battle-strategy.component')
      .then(m => m.BattleStrategyComponent)
  },
  {
    path: 'locations',
    loadComponent: () => import('./locations/locations.component')
      .then(m => m.LocationsComponent)
  },
  {
    path: 'types',
    loadComponent: () => import('./types-deep-dive/types-deep-dive.component')
      .then(m => m.TypesDeepDiveComponent)
  },
  {
    path: 'natures',
    loadComponent: () => import('./natures-stats/natures-stats.component')
      .then(m => m.NaturesStatsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
