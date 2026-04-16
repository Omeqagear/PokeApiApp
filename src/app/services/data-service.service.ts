import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { PokemonListResponse, PokemonDetail, PokemonSummary } from '../shared/pokemon-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private allPokemonCache: PokemonSummary[] | null = null;
  private readonly maxPokemonCount = 1025;

  constructor(private http: HttpClient) {}

  getPokemonNames(limit = 20, offset = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching Pokémon list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getPokemonDetail(id: number): Observable<PokemonDetail> {
    if (id <= 0) {
      return of({} as PokemonDetail);
    }
    return this.http.get<PokemonDetail>(`${this.baseUrl}/${id}/`).pipe(
      catchError((error) => {
        console.error(`Error fetching Pokémon with id ${id}:`, error);
        return of({} as PokemonDetail);
      })
    );
  }

  /**
   * @deprecated Use getPokemonDetail instead
   */
  getPokemonImages(id: number): Observable<PokemonDetail> {
    return this.getPokemonDetail(id);
  }

  searchPokemonByName(name: string): Observable<PokemonSummary[]> {
    const trimmedName = name.trim().toLowerCase();

    if (!trimmedName) {
      return of([]);
    }

    return this.getAllPokemon().pipe(
      map((pokemonList) =>
        pokemonList.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(trimmedName)
        )
      ),
      catchError((error) => {
        console.error('Error searching Pokémon by name:', error);
        return of([]);
      })
    );
  }

  private getAllPokemon(): Observable<PokemonSummary[]> {
    if (this.allPokemonCache) {
      return of(this.allPokemonCache);
    }

    return this.http.get<PokemonListResponse>(`${this.baseUrl}/?limit=${this.maxPokemonCount}`).pipe(
      map((response) => {
        this.allPokemonCache = response.results;
        return this.allPokemonCache;
      })
    );
  }
}
