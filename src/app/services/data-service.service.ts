import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  pokeIds: Observable<number[]>;
  constructor(private http: HttpClient) { }

  getPokemonNames() {
    return this.http.get('https://pokeapi.co/api/v2/pokemon/');
  }
  getPokemonImages(id) {
    return this.http.get('https://pokeapi.co/api/v2/pokemon/' + id + '/');
  }
}
