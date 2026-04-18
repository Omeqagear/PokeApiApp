import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'catalog',
    loadComponent: () => import('./catalog/catalog.component')
      .then(m => m.CatalogComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./equipo-pokemon/equipo-pokemon.component')
      .then(m => m.EquipoPokemonComponent)
  },
  {
    path: 'photo/:id',
    loadComponent: () => import('./photo-pokemon/photo-pokemon.component')
      .then(m => m.PhotoPokemonComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
