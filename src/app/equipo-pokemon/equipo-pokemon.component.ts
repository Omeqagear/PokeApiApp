import { DataServiceService } from './../services/data-service.service';
import { Pokemon } from './../shared/pokemon';
import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate, state} from '@angular/animations';

@Component({
  selector: 'app-equipo-pokemon',
  templateUrl: './equipo-pokemon.component.html',
  styleUrls: ['./equipo-pokemon.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('* <=> *', animate(1000)),
    ]),
  ]
})

export class EquipoPokemonComponent implements OnInit {

  pokemonTeam: Array<Pokemon> = [];
  pokemons$: Array<any> = [];
  pokemonName: Array<string> = [];
  types1: Array<string> = [];
  types2: Array<string> = [];
  moves1: Array<string> = [];
  moves2: Array<string> = [];
  img: Array<string> = [];


  constructor(private data: DataServiceService) { }

  ngOnInit() {
    this.pokemons$ = this.obtainAllLocalStorage();
    this.createPokemons();
  }

  // Function that obtain all data from the LocalStorage and return a JSON Object with the Pokemons
  obtainAllLocalStorage() {
    let json: Array<JSON> = [];
    let values = [],
      keys = Object.keys(localStorage),
      i = keys.length;

    while (i--) {
      values.push(localStorage.getItem(keys[i]));
    }

    for (let i = 0; i < values.length; i++) {
      let aux = JSON.parse(values[i]);
      json.push(aux);
    }
    return json;
  }

  // Function used to create de Pokemon's Object and fill it with the data obtained from the LocalStorage
  createPokemons() {
    for (let i = 0; i < this.pokemons$.length; i++) {
      this.pokemonTeam[i] = new Pokemon(this.pokemons$[i].id, this.pokemons$[i].name, this.pokemons$[i].spriteUrl, this.pokemons$[i].type1, this.pokemons$[i].type2, this.pokemons$[i].move1, this.pokemons$[i].move2);
    }
  }

  // Function use to delete one Pokemon from the team when the button "Eliminar" is pressed
  deletePokemon(id) {
    localStorage.removeItem(id.id);
    var index = this.pokemonTeam.indexOf(id);

    if (index > -1) {
      this.pokemonTeam.splice(index, 1);
    }
  }

  // Function used to clear de LocalStorage (delete all pokemons from the team)
  deleteTeam() {
    localStorage.clear();
    this.pokemonTeam = [];
  }

  // Function to generate random pokemons and build a team with all of them (6 pokemon/team)
  genRandomTeam(){
    var randomIDs = [];
    this.deleteTeam();
    for(let i = 0; i < 6; i++){
      randomIDs.push(Math.round(Math.random() * 644));
    }

    for (let i = 0; i < 6; i++) {
      let auxID = randomIDs[i];
      let auxName = this.getNameAPI(randomIDs[i]);
      let auxImg = this.getImgAPI(randomIDs[i]);
      let auxType1 = this.getTypesAPI(randomIDs[i])[0];
      let auxType2 = this.getTypesAPI(randomIDs[i])[1];
      let auxMove1 = this.getAbilitiesAPI(randomIDs[i])[0];
      let auxMove2 = this.getAbilitiesAPI(randomIDs[i])[1];
      this.pokemonTeam[i] = new Pokemon(auxID, auxName, auxImg, auxType1, auxType2, auxMove1, auxMove2);
    }
  }

  // Function that returns the Name of the Pokemon given an ID
  getNameAPI(id) {
    this.data.getPokemonImages(id).subscribe(data => this.pokemonName = (data["forms"][0].name));
    return this.pokemonName;
  }

  // Function that returns the Types of the Pokemon given an ID
  getTypesAPI(id) {
    this.data.getPokemonImages(id).subscribe(data => this.types1.push(data["types"][0]["type"].name));
    this.data.getPokemonImages(id).subscribe(data => this.types2.push(data["types"][1]["type"].name));
    return [this.types1, this.types2];
  }

  // Function that returns the Moves of the Pokemon given an ID
  getAbilitiesAPI(id) {
    this.data.getPokemonImages(id).subscribe(data => this.moves1.push(data["moves"][0]["move"].name));
    this.data.getPokemonImages(id).subscribe(data => this.moves2.push(data["moves"][1]["move"].name));
    return [this.moves1, this.moves2];
  }

  // Function that returns the Img of the Pokemon given an ID
  getImgAPI(id){
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png';
  }

}
