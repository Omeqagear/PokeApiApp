import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // Signal-based state
  teamPokemon = signal<Pokemon[]>([]);

  ngOnInit(): void {
    this.loadTeamFromStorage();
  }

  private loadTeamFromStorage(): void {
    const keys = this.storageService.keys();
    const team: Pokemon[] = [];

    keys.forEach(key => {
      const pokemon = this.storageService.get<Pokemon>(key);
      if (pokemon) {
        team.push(pokemon);
      }
    });
    
    this.teamPokemon.set(team);
  }

  deletePokemon(pokemon: Pokemon): void {
    this.storageService.remove(pokemon.id.toString());
    this.teamPokemon.update(team => team.filter(p => p.id !== pokemon.id));
  }

  getPokemonImage(item: Pokemon | any): string {
    // Handle both class instances and plain objects from localStorage
    if (typeof item.getImage === 'function') {
      return item.getImage();
    }
    // Fallback for plain objects after JSON parse
    return item.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
  }

  deleteTeam(): void {
    this.storageService.clear();
    this.teamPokemon.set([]);
  }

  genRandomTeam(): void {
    this.deleteTeam();

    const ids = new Set<number>();
    while (ids.size < 6) {
      ids.add(Math.floor(Math.random() * 1051) + 1); // All Gen Pokemon (1-1051)
    }

    const requests = Array.from(ids).map(id =>
      this.dataService.getPokemonDetail(id)
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const newTeam: Pokemon[] = [];
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
          newTeam.push(pokemon);
        });
        
        this.teamPokemon.set(newTeam);
      },
      error: (error) => {
        console.error('Error generating random team:', error);
        alert('Error generating team. Please try again.');
      }
    });
  }
}
