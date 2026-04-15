import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PokemonListResponse, PokemonDetail } from '../shared/pokemon-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemonNames(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/?limit=${limit}&offset=${offset}`);
  }

  getPokemonDetail(id: number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/${id}/`);
  }

  /**
   * @deprecated Use getPokemonDetail instead
   */
  getPokemonImages(id: number): Observable<PokemonDetail> {
    return this.getPokemonDetail(id);
  }
}
