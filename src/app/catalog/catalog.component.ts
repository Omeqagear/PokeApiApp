import { DataServiceService } from './../services/data-service.service';
import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  animations: [
    trigger('listStagger', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-15px)' }),
            stagger(
              '50ms',
              animate(
                '550ms ease-out',
                style({ opacity: 1, transform: 'translateY(0px)' })
              )
            )
          ],
          { optional: true }
        ),
        query(':leave', animate('50ms', style({ opacity: 0 })), {
          optional: true
        })
      ])
    ])
  ]
})

export class CatalogComponent implements OnInit {

  pokemons$: Array<any> = [];
  id: string = "";

  constructor(private data: DataServiceService) { }

  //Class catalog use DataServiceService function GetPokemonNames() to get all pokemons from API
  ngOnInit() {
    this.data.getPokemonNames().subscribe(data => this.pokemons$ = data["results"]);
  }

  //This function returns the ID of the pokemon that has been clicked in catalog display
  onItem(item) {
    this.id = ((item.url).split('/').splice(6, 7, 1))[0];
    return this.id;
  }
}
