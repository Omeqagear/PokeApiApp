import { DataServiceService } from './../services/data-service.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
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

export class PokemonComponent implements OnInit {

  pokemon$: Array<any> = [];
  types$: Array<any> = [];
  idForm: FormGroup;
  id: string;


  constructor(private fb: FormBuilder, private route: ActivatedRoute, private data: DataServiceService) {
    this.crearFormulario();
  }

  ngOnInit() {
  }

  crearFormulario() {
    this.idForm = this.fb.group({
      id: ''
    });
  }

  onSubmit() {
    this.id = this.idForm.value;
    this.idForm.reset();
    this.getName();
    this.getTypes();
    this.types$ = [];
  }

  //Function that use the service to get the Name from the API
  getName() {
    this.data.getPokemonImages(Object.values(this.id)[0]).subscribe(data => this.pokemon$ = data["forms"]);
  }

  //Function that use the service to get the Types from the API
  getTypes() {
    this.data.getPokemonImages(Object.values(this.id)[0]).subscribe(data => this.types$.push(data["types"][0]["type"]));
    this.data.getPokemonImages(Object.values(this.id)[0]).subscribe(data => this.types$.push(data["types"][1]["type"]));
  }

}
