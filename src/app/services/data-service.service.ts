import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, retry } from 'rxjs';
import { map } from 'rxjs/operators';
import { PokemonListResponse, PokemonDetail, PokemonSummary, PokemonSpecies, EvolutionChain } from '../shared/pokemon-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private readonly speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
  private readonly evolutionUrl = 'https://pokeapi.co/api/v2/evolution-chain';
  private readonly maxPokemonCount = 1025;
  private allPokemonCache: PokemonSummary[] | null = null;
  private pokemonDetailCache = new Map<number, PokemonDetail>();
  private pokemonSpeciesCache = new Map<number, PokemonSpecies>();
  private evolutionChainCache = new Map<number, EvolutionChain>();

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
    if (id <= 0 || id > this.maxPokemonCount) {
      return of({} as PokemonDetail);
    }

    const cached = this.pokemonDetailCache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<PokemonDetail>(`${this.baseUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.pokemonDetailCache.set(id, data);
        }
      }),
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

  getPokemonSpecies(id: number): Observable<PokemonSpecies> {
    if (id <= 0 || id > this.maxPokemonCount) {
      return of({} as PokemonSpecies);
    }

    const cachedSpecies = this.pokemonSpeciesCache.get(id);
    if (cachedSpecies) {
      return of(cachedSpecies);
    }

    return this.http.get<PokemonSpecies>(`${this.speciesUrl}/${id}/`).pipe(
      tap((data) => {
        if (data && data.id) {
          this.pokemonSpeciesCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching species for Pokémon ID ${id}:`, error);
        return of({} as PokemonSpecies);
      })
    );
  }

  getEvolutionChain(url: string): Observable<EvolutionChain> {
    const chainId = this.extractChainId(url);
    if (!chainId) {
      return of({} as EvolutionChain);
    }

    const cachedEvolution = this.evolutionChainCache.get(chainId);
    if (cachedEvolution) {
      return of(cachedEvolution);
    }

    return this.http.get<EvolutionChain>(url).pipe(
      tap((data) => {
        if (data && data.id) {
          this.evolutionChainCache.set(chainId, data);
        }
      }),
      catchError((error) => {
        console.error('Error fetching evolution chain:', error);
        return of({} as EvolutionChain);
      })
    );
  }

  private extractChainId(url: string): number | null {
    const matches = url.match(/\/evolution-chain\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : null;
  }
}
