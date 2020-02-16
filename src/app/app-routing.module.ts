import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { PokemonComponent } from './pokemon/pokemon.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PhotoPokemonComponent } from './photo-pokemon/photo-pokemon.component';
import { EquipoPokemonComponent } from './equipo-pokemon/equipo-pokemon.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'catalog',
    component: CatalogComponent
  },
  {
    path: 'details',
    component: PokemonComponent
  },
  {
    path: 'photo/:id',
    component: PhotoPokemonComponent
  },
  {
    path: 'team',
    component: EquipoPokemonComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
