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
    path: '**',
    redirectTo: ''
  }
];
