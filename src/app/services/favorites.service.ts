import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Pokemon } from '../shared/pokemon';

export interface FavoritePokemon {
  id: number;
  name: string;
  spriteUrl: string;
  types: { type: { name: string } }[];
  addedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favorites';
  private readonly MAX_FAVORITES = 50;

  private _favorites = signal<FavoritePokemon[]>([]);
  private _favoritesCount = signal(0);
  favorites = this._favorites.asReadonly();
  favoritesCount = this._favoritesCount.asReadonly();

  constructor(private storageService: StorageService) {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const stored = this.storageService.get<FavoritePokemon[]>(this.FAVORITES_KEY);
    if (stored && Array.isArray(stored)) {
      this._favorites.set(stored);
      this._favoritesCount.set(stored.length);
    }
  }

  private saveFavorites(): void {
    this.storageService.set(this.FAVORITES_KEY, this._favorites());
  }

  addFavorite(pokemon: Pokemon | { id: number; name: string; spriteUrl?: string; types?: any[] }): boolean {
    const currentFavorites = this._favorites();

    if (currentFavorites.some(f => f.id === pokemon.id)) {
      return false;
    }

    if (currentFavorites.length >= this.MAX_FAVORITES) {
      return false;
    }

    const favorite: FavoritePokemon = {
      id: pokemon.id,
      name: pokemon.name,
      spriteUrl: pokemon.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      types: pokemon.types || [],
      addedAt: Date.now()
    };

    this._favorites.update(favorites => [...favorites, favorite]);
    this._favoritesCount.set(this._favoritesCount() + 1);
    this.saveFavorites();
    return true;
  }

  removeFavorite(pokemonId: number): void {
    this._favorites.update(favorites => favorites.filter(f => f.id !== pokemonId));
    this._favoritesCount.set(Math.max(0, this._favoritesCount() - 1));
    this.saveFavorites();
  }

  toggleFavorite(pokemon: Pokemon | { id: number; name: string; spriteUrl?: string; types?: any[] }): boolean {
    if (this.isFavorite(pokemon.id)) {
      this.removeFavorite(pokemon.id);
      return false;
    } else {
      return this.addFavorite(pokemon);
    }
  }

  isFavorite(pokemonId: number): boolean {
    return this._favorites().some(f => f.id === pokemonId);
  }

  clearFavorites(): void {
    this._favorites.set([]);
    this._favoritesCount.set(0);
    this.storageService.remove(this.FAVORITES_KEY);
  }

  getFavoritesCount(): number {
    return this._favorites().length;
  }
}