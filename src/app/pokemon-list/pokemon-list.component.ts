import { DataServiceService } from './../services/data-service.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {

  pokemonJSON: Array<any> = [];

  constructor(private data: DataServiceService) {}

  ngOnInit() {
    this.data.getPokemonNames().subscribe( data => this.pokemonJSON = data['results']);
  }

}
