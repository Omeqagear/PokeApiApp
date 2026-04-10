import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';
import { StorageService } from '../services/storage.service';
import { Pokemon } from '../shared/pokemon';

@Component({
  selector: 'app-photo-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './photo-pokemon.component.html',
  styleUrls: ['./photo-pokemon.component.scss']
})
export class PhotoPokemonComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataServiceService);
  private storageService = inject(StorageService);

  private destroy$ = new Subject<void>();

  id: number = 0;
  pokemonDetail: PokemonDetail | null = null;
  name: string = '';
  types: string[] = [];
  moves: string[] = [];
  spriteUrl: string = '';
  showBackSprite: boolean = false;

  readonly MAX_POKEMON_ID = 1025;

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.id = +params['id'];
      this.loadPokemonData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPokemonData(): void {
    this.dataService.getPokemonDetail(this.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.pokemonDetail = data;
        this.name = data.name;
        this.types = data.types.map(t => t.type.name);
        this.moves = data.moves.slice(0, 10).map(m => m.move.name);
        this.spriteUrl = data.sprites.front_default || '';
        this.showBackSprite = false;
      },
      error: (error) => {
        console.error('Error loading Pokemon data:', error);
      }
    });
  }

  showFrontImage(): void {
    this.spriteUrl = this.pokemonDetail?.sprites.front_default || '';
    this.showBackSprite = false;
  }

  showBackImage(): void {
    this.spriteUrl = this.pokemonDetail?.sprites.back_default || this.pokemonDetail?.sprites.front_default || '';
    this.showBackSprite = true;
  }

  nextID(): void {
    this.id = this.id >= this.MAX_POKEMON_ID ? 1 : this.id + 1;
    this.loadPokemonData();
    this.router.navigate(['/photo', this.id]);
  }

  prevID(): void {
    this.id = this.id <= 1 ? this.MAX_POKEMON_ID : this.id - 1;
    this.loadPokemonData();
    this.router.navigate(['/photo', this.id]);
  }

  addPokemonToTeam(): void {
    if (!this.pokemonDetail) return;

    const teamKeys = this.storageService.keys().filter(k => k.match(/^\d+$/));
    
    if (teamKeys.length >= 6) {
      alert('Your Pokemon team is already full (6 Pokemon maximum)');
      return;
    }

    if (this.storageService.get(this.id.toString())) {
      alert('This Pokemon is already in your team!');
      return;
    }

    const pokemon = new Pokemon(
      this.id.toString(),
      this.name,
      this.spriteUrl,
      this.types[0] || 'unknown',
      this.types[1] || '',
      this.moves[0] || 'unknown',
      this.moves[1] || ''
    );

    this.storageService.set(this.id.toString(), pokemon);
    alert(`${this.name.toUpperCase()} is excited to join your team!`);
  }
}
