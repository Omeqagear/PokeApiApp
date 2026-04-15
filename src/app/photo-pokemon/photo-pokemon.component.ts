import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './photo-pokemon.component.html',
  styleUrls: ['./photo-pokemon.component.scss']
})
export class PhotoPokemonComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataServiceService);
  private storageService = inject(StorageService);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  // Signal-based state
  id = signal(0);
  pokemonDetail = signal<PokemonDetail | null>(null);
  loading = signal(true);
  error = signal(false);

  readonly MIN_POKEMON_ID = 1;
  readonly MAX_POKEMON_ID = 1025;

  /**
   * Validates that the Pokemon ID is numeric and within valid range (1-1025)
   */
  private isValidPokemonId(id: number): boolean {
    return id >= this.MIN_POKEMON_ID && id <= this.MAX_POKEMON_ID && Number.isInteger(id);
  }

  // Computed signals
  name = computed(() => this.pokemonDetail()?.name || '');
  types = computed(() => this.pokemonDetail()?.types.map(t => t.type.name) || []);
  moves = computed(() => this.pokemonDetail()?.moves.slice(0, 10).map(m => m.move.name) || []);
  stats = computed(() => this.pokemonDetail()?.stats || []);
  abilities = computed(() => this.pokemonDetail()?.abilities.map(a => a.ability.name) || []);
  height = computed(() => this.pokemonDetail()?.height || 0);
  weight = computed(() => this.pokemonDetail()?.weight || 0);
  
  // Image URLs - using official artwork
  artworkUrl = computed(() => 
    this.pokemonDetail()?.sprites.other?.['official-artwork']?.front_default || 
    this.pokemonDetail()?.sprites.front_default || ''
  );
  frontSprite = computed(() => this.pokemonDetail()?.sprites.front_default || '');
  backSprite = computed(() => this.pokemonDetail()?.sprites.back_default || '');
  shinyArtwork = computed(() => 
    this.pokemonDetail()?.sprites.other?.['official-artwork']?.front_shiny || ''
  );

  selectedView = signal<'front' | 'back' | 'shiny'>('front');

  displayUrl = computed(() => {
    const view = this.selectedView();
    if (view === 'back') return this.backSprite() || this.artworkUrl();
    if (view === 'shiny') return this.shinyArtwork() || this.artworkUrl();
    return this.artworkUrl();
  });

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const rawId = +params['id'];
      // Validate ID is numeric and within valid range
      if (this.isValidPokemonId(rawId)) {
        this.id.set(rawId);
        this.loadPokemonData();
      } else {
        // Invalid ID - redirect to catalog with error
        console.error(`Invalid Pokemon ID: ${rawId}. Must be between ${this.MIN_POKEMON_ID} and ${this.MAX_POKEMON_ID}`);
        this.router.navigate(['/catalog']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPokemonData(): void {
    this.loading.set(true);
    this.error.set(false);
    
    this.dataService.getPokemonDetail(this.id()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.pokemonDetail.set(data);
        this.loading.set(false);
        this.selectedView.set('front');
      },
      error: (err) => {
        console.error('Error loading Pokemon data:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  setSelectedView(view: 'front' | 'back' | 'shiny'): void {
    this.selectedView.set(view);
  }

  nextID(): void {
    const currentId = this.id();
    const newId = currentId >= this.MAX_POKEMON_ID ? this.MIN_POKEMON_ID : currentId + 1;
    if (this.isValidPokemonId(newId)) {
      this.id.set(newId);
      this.router.navigate(['/photo', newId]);
    }
  }

  prevID(): void {
    const currentId = this.id();
    const newId = currentId <= this.MIN_POKEMON_ID ? this.MAX_POKEMON_ID : currentId - 1;
    if (this.isValidPokemonId(newId)) {
      this.id.set(newId);
      this.router.navigate(['/photo', newId]);
    }
  }

  addPokemonToTeam(): void {
    const detail = this.pokemonDetail();
    if (!detail) return;

    const teamKeys = this.storageService.keys().filter(k => k.match(/^\d+$/));

    if (teamKeys.length >= 6) {
      this.snackBar.open('Your Pokemon team is already full (6 Pokemon maximum)', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.storageService.get(this.id().toString())) {
      this.snackBar.open('This Pokemon is already in your team!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const pokemon = new Pokemon(
      this.id().toString(),
      this.name(),
      this.displayUrl(),
      this.types()[0] || 'unknown',
      this.types()[1] || '',
      this.moves()[0] || 'unknown',
      this.moves()[1] || ''
    );

    this.storageService.set(this.id().toString(), pokemon);
    this.snackBar.open(`${this.name().toUpperCase()} is excited to join your team!`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getStatColor(stat: number): string {
    // Stats range from 0-255
    const percentage = (stat / 255) * 100;
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#8bc34a'; // Light green
    if (percentage >= 40) return '#ffc107'; // Yellow
    if (percentage >= 20) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
