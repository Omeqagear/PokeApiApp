import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forkJoin } from 'rxjs';
import { Pokemon } from '../shared/pokemon';
import { DataServiceService } from '../services/data-service.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-equipo-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './equipo-pokemon.component.html',
  styleUrls: ['./equipo-pokemon.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('* <=> *', animate(300)),
    ]),
  ]
})
export class EquipoPokemonComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private storageService = inject(StorageService);

  teamPokemon: Pokemon[] = [];

  ngOnInit(): void {
    this.loadTeamFromStorage();
  }

  private loadTeamFromStorage(): void {
    const keys = this.storageService.keys();
    this.teamPokemon = [];
    
    keys.forEach(key => {
      const pokemon = this.storageService.get<Pokemon>(key);
      if (pokemon) {
        this.teamPokemon.push(pokemon);
      }
    });
  }

  deletePokemon(pokemon: Pokemon): void {
    this.storageService.remove(pokemon.id.toString());
    this.teamPokemon = this.teamPokemon.filter(p => p.id !== pokemon.id);
  }

  deleteTeam(): void {
    this.storageService.clear();
    this.teamPokemon = [];
  }

  genRandomTeam(): void {
    this.deleteTeam();
    
    const ids = new Set<number>();
    while (ids.size < 6) {
      ids.add(Math.floor(Math.random() * 151) + 1); // Gen 1 Pokemon (1-151)
    }

    const requests = Array.from(ids).map(id => 
      this.dataService.getPokemonDetail(id)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach(data => {
          const pokemon = new Pokemon(
            data.id.toString(),
            data.name,
            data.sprites.front_default || '',
            data.types[0]?.type.name ?? 'unknown',
            data.types[1]?.type.name ?? '',
            data.moves[0]?.move.name ?? 'unknown',
            data.moves[1]?.move.name ?? ''
          );
          
          this.storageService.set(data.id.toString(), pokemon);
          this.teamPokemon.push(pokemon);
        });
      },
      error: (error) => {
        console.error('Error generating random team:', error);
        alert('Error generating team. Please try again.');
      }
    });
  }
}
