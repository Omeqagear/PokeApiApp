import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, retry } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PokemonListResponse, PokemonDetail, PokemonSummary, PokemonSpecies, EvolutionChain,
  AbilityListResponse, AbilityDetail, MoveListResponse, MoveDetail,
  PokedexListResponse, PokedexDetail, RegionDetail
} from '../shared/pokemon-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';
  private readonly speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species';
  private readonly evolutionUrl = 'https://pokeapi.co/api/v2/evolution-chain';
  private readonly abilityUrl = 'https://pokeapi.co/api/v2/ability';
  private readonly moveUrl = 'https://pokeapi.co/api/v2/move';
  private readonly pokedexUrl = 'https://pokeapi.co/api/v2/pokedex';
  private readonly regionUrl = 'https://pokeapi.co/api/v2/region';
  private readonly maxPokemonCount = 1025;
  private allPokemonCache: PokemonSummary[] | null = null;
  private pokemonDetailCache = new Map<number, PokemonDetail>();
  private pokemonSpeciesCache = new Map<number, PokemonSpecies>();
  private evolutionChainCache = new Map<number, EvolutionChain>();
  private abilityListCache: PokemonSummary[] | null = null;
  private moveListCache: PokemonSummary[] | null = null;
  private pokedexListCache: PokemonSummary[] | null = null;
  private abilityDetailCache = new Map<number, AbilityDetail>();
  private moveDetailCache = new Map<number, MoveDetail>();
  private pokedexDetailCache = new Map<number, PokedexDetail>();

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

  getAbilitiesList(limit = 20, offset = 0): Observable<AbilityListResponse> {
    return this.http.get<AbilityListResponse>(`${this.abilityUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching abilities list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllAbilities(): Observable<PokemonSummary[]> {
    if (this.abilityListCache) {
      return of(this.abilityListCache);
    }
    return this.http.get<AbilityListResponse>(`${this.abilityUrl}/?limit=400`).pipe(
      map((response) => {
        this.abilityListCache = response.results;
        return this.abilityListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all abilities:', error);
        return of([]);
      })
    );
  }

  getAbilityDetail(id: number): Observable<AbilityDetail> {
    if (id <= 0) {
      return of({} as AbilityDetail);
    }
    const cached = this.abilityDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<AbilityDetail>(`${this.abilityUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.abilityDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching ability with id ${id}:`, error);
        return of({} as AbilityDetail);
      })
    );
  }

  searchAbilityByName(name: string): Observable<PokemonSummary[]> {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      return of([]);
    }
    return this.getAllAbilities().pipe(
      map((list) => list.filter((a) => a.name.toLowerCase().includes(trimmedName))),
      catchError((error) => {
        console.error('Error searching ability by name:', error);
        return of([]);
      })
    );
  }

  getMovesList(limit = 20, offset = 0): Observable<MoveListResponse> {
    return this.http.get<MoveListResponse>(`${this.moveUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching moves list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllMoves(): Observable<PokemonSummary[]> {
    if (this.moveListCache) {
      return of(this.moveListCache);
    }
    return this.http.get<MoveListResponse>(`${this.moveUrl}/?limit=1000`).pipe(
      map((response) => {
        this.moveListCache = response.results;
        return this.moveListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all moves:', error);
        return of([]);
      })
    );
  }

  getMoveDetail(id: number): Observable<MoveDetail> {
    if (id <= 0) {
      return of({} as MoveDetail);
    }
    const cached = this.moveDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<MoveDetail>(`${this.moveUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.moveDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching move with id ${id}:`, error);
        return of({} as MoveDetail);
      })
    );
  }

  searchMoveByName(name: string): Observable<PokemonSummary[]> {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      return of([]);
    }
    return this.getAllMoves().pipe(
      map((list) => list.filter((m) => m.name.toLowerCase().includes(trimmedName))),
      catchError((error) => {
        console.error('Error searching move by name:', error);
        return of([]);
      })
    );
  }

  getPokedexesList(): Observable<PokedexListResponse> {
    return this.http.get<PokedexListResponse>(`${this.pokedexUrl}/?limit=50`).pipe(
      catchError((error) => {
        console.error('Error fetching pokedexes list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllPokedexes(): Observable<PokemonSummary[]> {
    if (this.pokedexListCache) {
      return of(this.pokedexListCache);
    }
    return this.getPokedexesList().pipe(
      map((response) => {
        this.pokedexListCache = response.results;
        return this.pokedexListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all pokedexes:', error);
        return of([]);
      })
    );
  }

  getPokedexDetail(id: number): Observable<PokedexDetail> {
    if (id <= 0) {
      return of({} as PokedexDetail);
    }
    const cached = this.pokedexDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<PokedexDetail>(`${this.pokedexUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.pokedexDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching pokedex with id ${id}:`, error);
        return of({} as PokedexDetail);
      })
    );
  }

  getRegionDetail(id: number): Observable<RegionDetail> {
    return this.http.get<RegionDetail>(`${this.regionUrl}/${id}/`).pipe(
      retry(2),
      catchError((error) => {
        console.error(`Error fetching region with id ${id}:`, error);
        return of({} as RegionDetail);
      })
    );
  }
}
