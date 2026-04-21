import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, retry, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  PokemonListResponse, PokemonDetail, PokemonSummary, PokemonSpecies, EvolutionChain,
  AbilityListResponse, AbilityDetail, MoveListResponse, MoveDetail,
  PokedexListResponse, PokedexDetail, RegionDetail,
  PokemonSpeciesDetail, LocationListResponse, LocationDetail, LocationAreaDetail,
  TypeListResponse, TypeDetail, NatureListResponse, NatureDetail,
  EggGroupListResponse, EggGroupDetail, GrowthRateDetail, CharacteristicDetail, EvolutionTriggerDetail
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
  private readonly locationUrl = 'https://pokeapi.co/api/v2/location';
  private readonly locationAreaUrl = 'https://pokeapi.co/api/v2/location-area';
  private readonly typeUrl = 'https://pokeapi.co/api/v2/type';
  private readonly natureUrl = 'https://pokeapi.co/api/v2/nature';
  private readonly eggGroupUrl = 'https://pokeapi.co/api/v2/egg-group';
  private readonly growthRateUrl = 'https://pokeapi.co/api/v2/growth-rate';
  private readonly characteristicUrl = 'https://pokeapi.co/api/v2/characteristic';
  private readonly evolutionTriggerUrl = 'https://pokeapi.co/api/v2/evolution-trigger';
  private readonly maxPokemonCount = 1025;
  private allPokemonCache: PokemonSummary[] | null = null;
  private pokemonDetailCache = new Map<number, PokemonDetail>();
  private pokemonSpeciesCache = new Map<number, PokemonSpecies>();
  private pokemonSpeciesDetailCache = new Map<number, PokemonSpeciesDetail>();
  private evolutionChainCache = new Map<number, EvolutionChain>();
  private abilityListCache: PokemonSummary[] | null = null;
  private moveListCache: PokemonSummary[] | null = null;
  private pokedexListCache: PokemonSummary[] | null = null;
  private locationListCache: PokemonSummary[] | null = null;
  private typeListCache: PokemonSummary[] | null = null;
  private natureListCache: PokemonSummary[] | null = null;
  private eggGroupListCache: PokemonSummary[] | null = null;
  private abilityDetailCache = new Map<number, AbilityDetail>();
  private moveDetailCache = new Map<number, MoveDetail>();
  private pokedexDetailCache = new Map<number, PokedexDetail>();
  private locationDetailCache = new Map<number, LocationDetail>();
  private locationAreaDetailCache = new Map<number, LocationAreaDetail>();
  private typeDetailCache = new Map<number, TypeDetail>();
  private natureDetailCache = new Map<number, NatureDetail>();
  private eggGroupDetailCache = new Map<number, EggGroupDetail>();
  private growthRateCache = new Map<number, GrowthRateDetail>();

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

  getPokemonSpeciesDetail(id: number): Observable<PokemonSpeciesDetail> {
    if (id <= 0 || id > this.maxPokemonCount) {
      return of({} as PokemonSpeciesDetail);
    }
    const cached = this.pokemonSpeciesDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<PokemonSpeciesDetail>(`${this.speciesUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.pokemonSpeciesDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching species detail for ID ${id}:`, error);
        return of({} as PokemonSpeciesDetail);
      })
    );
  }

  getAllEvolutionChains(limit = 20, offset = 0): Observable<{ count: number; next: string | null; previous: string | null; results: { url: string }[] }> {
    return this.http.get<{ count: number; next: string | null; previous: string | null; results: { url: string }[] }>(`${this.evolutionUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching evolution chains:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getEvolutionChainById(id: number): Observable<EvolutionChain> {
    if (id <= 0) {
      return of({} as EvolutionChain);
    }
    const cached = this.evolutionChainCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<EvolutionChain>(`${this.evolutionUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.evolutionChainCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching evolution chain ${id}:`, error);
        return of({} as EvolutionChain);
      })
    );
  }

  getLocationsList(limit = 20, offset = 0): Observable<LocationListResponse> {
    return this.http.get<LocationListResponse>(`${this.locationUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching locations list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllLocations(): Observable<PokemonSummary[]> {
    if (this.locationListCache) {
      return of(this.locationListCache);
    }
    return this.http.get<LocationListResponse>(`${this.locationUrl}/?limit=1200`).pipe(
      map((response) => {
        this.locationListCache = response.results;
        return this.locationListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all locations:', error);
        return of([]);
      })
    );
  }

  getLocationDetail(id: number): Observable<LocationDetail> {
    if (id <= 0) {
      return of({} as LocationDetail);
    }
    const cached = this.locationDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<LocationDetail>(`${this.locationUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.locationDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching location ${id}:`, error);
        return of({} as LocationDetail);
      })
    );
  }

  getLocationAreaDetail(id: number): Observable<LocationAreaDetail> {
    if (id <= 0) {
      return of({} as LocationAreaDetail);
    }
    const cached = this.locationAreaDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<LocationAreaDetail>(`${this.locationAreaUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.locationAreaDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching location area ${id}:`, error);
        return of({} as LocationAreaDetail);
      })
    );
  }

  getTypesList(): Observable<TypeListResponse> {
    return this.http.get<TypeListResponse>(`${this.typeUrl}/?limit=30`).pipe(
      catchError((error) => {
        console.error('Error fetching types list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllTypes(): Observable<PokemonSummary[]> {
    if (this.typeListCache) {
      return of(this.typeListCache);
    }
    return this.getTypesList().pipe(
      map((response) => {
        this.typeListCache = response.results;
        return this.typeListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all types:', error);
        return of([]);
      })
    );
  }

  getTypeDetail(id: number): Observable<TypeDetail> {
    if (id <= 0) {
      return of({} as TypeDetail);
    }
    const cached = this.typeDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<TypeDetail>(`${this.typeUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.typeDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching type ${id}:`, error);
        return of({} as TypeDetail);
      })
    );
  }

  getAllTypesWithDetails(): Observable<TypeDetail[]> {
    return this.getAllTypes().pipe(
      switchMap((types) => {
        const requests = types.map(t => {
          const id = parseInt(t.url.split('/').filter(Boolean).pop() ?? '0', 10);
          return this.getTypeDetail(id);
        });
        return forkJoin(requests);
      })
    );
  }

  getNaturesList(limit = 20, offset = 0): Observable<NatureListResponse> {
    return this.http.get<NatureListResponse>(`${this.natureUrl}/?limit=${limit}&offset=${offset}`).pipe(
      catchError((error) => {
        console.error('Error fetching natures list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllNatures(): Observable<PokemonSummary[]> {
    if (this.natureListCache) {
      return of(this.natureListCache);
    }
    return this.http.get<NatureListResponse>(`${this.natureUrl}/?limit=30`).pipe(
      map((response) => {
        this.natureListCache = response.results;
        return this.natureListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all natures:', error);
        return of([]);
      })
    );
  }

  getNatureDetail(id: number): Observable<NatureDetail> {
    if (id <= 0) {
      return of({} as NatureDetail);
    }
    const cached = this.natureDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<NatureDetail>(`${this.natureUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.natureDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching nature ${id}:`, error);
        return of({} as NatureDetail);
      })
    );
  }

  getEggGroupsList(): Observable<EggGroupListResponse> {
    return this.http.get<EggGroupListResponse>(`${this.eggGroupUrl}/?limit=20`).pipe(
      catchError((error) => {
        console.error('Error fetching egg groups list:', error);
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getAllEggGroups(): Observable<PokemonSummary[]> {
    if (this.eggGroupListCache) {
      return of(this.eggGroupListCache);
    }
    return this.getEggGroupsList().pipe(
      map((response) => {
        this.eggGroupListCache = response.results;
        return this.eggGroupListCache;
      }),
      catchError((error) => {
        console.error('Error fetching all egg groups:', error);
        return of([]);
      })
    );
  }

  getEggGroupDetail(id: number): Observable<EggGroupDetail> {
    if (id <= 0) {
      return of({} as EggGroupDetail);
    }
    const cached = this.eggGroupDetailCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<EggGroupDetail>(`${this.eggGroupUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.eggGroupDetailCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching egg group ${id}:`, error);
        return of({} as EggGroupDetail);
      })
    );
  }

  getGrowthRateDetail(id: number): Observable<GrowthRateDetail> {
    if (id <= 0) {
      return of({} as GrowthRateDetail);
    }
    const cached = this.growthRateCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<GrowthRateDetail>(`${this.growthRateUrl}/${id}/`).pipe(
      retry(2),
      tap((data) => {
        if (data && data.id) {
          this.growthRateCache.set(id, data);
        }
      }),
      catchError((error) => {
        console.error(`Error fetching growth rate ${id}:`, error);
        return of({} as GrowthRateDetail);
      })
    );
  }

  getEvolutionTriggers(): Observable<EvolutionTriggerDetail[]> {
    return this.http.get<{ results: PokemonSummary[] }>(`${this.evolutionTriggerUrl}/?limit=20`).pipe(
      switchMap((response) => {
        const requests = response.results.map(t => {
          const id = parseInt(t.url.split('/').filter(Boolean).pop() ?? '0', 10);
          return this.http.get<EvolutionTriggerDetail>(`${this.evolutionTriggerUrl}/${id}/`);
        });
        return forkJoin(requests);
      }),
      catchError((error) => {
        console.error('Error fetching evolution triggers:', error);
        return of([]);
      })
    );
  }

  getCharacteristicDetail(id: number): Observable<CharacteristicDetail> {
    if (id <= 0) {
      return of({} as CharacteristicDetail);
    }
    return this.http.get<CharacteristicDetail>(`${this.characteristicUrl}/${id}/`).pipe(
      retry(2),
      catchError((error) => {
        console.error(`Error fetching characteristic ${id}:`, error);
        return of({} as CharacteristicDetail);
      })
    );
  }
}
