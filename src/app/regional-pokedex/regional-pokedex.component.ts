import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DataServiceService } from '../services/data-service.service';
import { PokedexDetail } from '../shared/pokemon-api.interfaces';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { PokeCardComponent } from '../shared/components/poke-card/poke-card.component';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { capitalize, getOfficialArtworkUrl } from '../shared/utils/pokemon.utils';
import { TeamService } from '../services/team.service';
import { ProgressService } from '../services/progress.service';
import { Pokemon } from '../shared/pokemon';

interface PokedexOption {
  id: number;
  name: string;
  displayName: string;
  region: string;
  count: number;
}

const POKEDEX_OPTIONS: PokedexOption[] = [
  { id: 1, name: 'national', displayName: 'National Pokédex', region: 'All', count: 1025 },
  { id: 2, name: 'kanto', displayName: 'Kanto Pokédex', region: 'Kanto', count: 151 },
  { id: 3, name: 'original-johto', displayName: 'Johto Pokédex', region: 'Johto', count: 251 },
  { id: 4, name: 'hoenn', displayName: 'Hoenn Pokédex', region: 'Hoenn', count: 386 },
  { id: 5, name: 'original-sinnoh', displayName: 'Sinnoh Pokédex', region: 'Sinnoh', count: 493 },
  { id: 6, name: 'extended-sinnoh', displayName: 'Extended Sinnoh', region: 'Sinnoh', count: 493 },
  { id: 7, name: 'updated-johto', displayName: 'Updated Johto', region: 'Johto', count: 251 },
  { id: 8, name: 'original-unova', displayName: 'Unova Pokédex', region: 'Unova', count: 649 },
  { id: 9, name: 'updated-unova', displayName: 'Updated Unova', region: 'Unova', count: 649 },
  { id: 10, name: 'kalos-central', displayName: 'Kalos Central', region: 'Kalos', count: 721 },
  { id: 11, name: 'kalos-coastal', displayName: 'Kalos Coastal', region: 'Kalos', count: 721 },
  { id: 12, name: 'kalos-mountain', displayName: 'Kalos Mountain', region: 'Kalos', count: 721 },
  { id: 13, name: 'updated-hoenn', displayName: 'Updated Hoenn', region: 'Hoenn', count: 721 },
  { id: 14, name: 'original-alola', displayName: 'Alola Pokédex', region: 'Alola', count: 809 },
  { id: 15, name: 'original-melemele', displayName: 'Melemele Pokédex', region: 'Alola', count: 809 },
  { id: 16, name: 'original-akala', displayName: 'Akala Pokédex', region: 'Alola', count: 809 },
  { id: 17, name: 'original-ulaula', displayName: 'Ulaula Pokédex', region: 'Alola', count: 809 },
  { id: 18, name: 'original-ulaula', displayName: 'Ulaula Pokédex', region: 'Alola', count: 809 },
  { id: 19, name: 'original-poni', displayName: 'Poni Pokédex', region: 'Alola', count: 809 },
  { id: 20, name: 'updated-alola', displayName: 'Updated Alola', region: 'Alola', count: 809 },
  { id: 21, name: 'letsgo-kanto', displayName: "Let's Go Kanto", region: 'Kanto', count: 151 },
  { id: 22, name: 'galar', displayName: 'Galar Pokédex', region: 'Galar', count: 905 },
  { id: 23, name: 'isle-of-armor', displayName: 'Isle of Armor', region: 'Galar', count: 905 },
  { id: 24, name: 'crown-tundra', displayName: 'Crown Tundra', region: 'Galar', count: 905 },
  { id: 25, name: 'paldea', displayName: 'Paldea Pokédex', region: 'Paldea', count: 1025 },
  { id: 26, name: 'kitakami', displayName: 'Kitakami Pokédex', region: 'Paldea', count: 1025 },
  { id: 27, name: 'blueberry', displayName: 'Blueberry Pokédex', region: 'Paldea', count: 1025 },
];

@Component({
  selector: 'app-regional-pokedex',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    PokeCardComponent
  ],
  templateUrl: './regional-pokedex.component.html',
  styleUrls: ['./regional-pokedex.component.scss']
})
export class RegionalPokedexComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private teamService = inject(TeamService);
  private progressService = inject(ProgressService);
  private router = inject(Router);

  pokedexOptions = POKEDEX_OPTIONS;

  searchControl = new FormControl('');

  selectedPokedex = signal<PokedexOption | null>(null);
  pokedex = signal<PokedexDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  filteredEntries = computed(() => {
    const entries = this.pokedex()?.pokemon_entries || [];
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return entries;

    return entries.filter(entry =>
      entry.pokemon_species.name.toLowerCase().includes(term)
    );
  });

  viewedCount = computed(() => {
    let count = 0;
    this.filteredEntries().forEach(entry => {
      const id = this.extractPokemonId(entry.pokemon_species.url);
      if (this.progressService.isViewed(id)) count++;
    });
    return count;
  });

  ngOnInit(): void {
    this.selectedPokedex.set(POKEDEX_OPTIONS[0]);
    this.loadPokedex(POKEDEX_OPTIONS[0].id);

    this.searchControl.valueChanges.pipe(
      debounceTime(200)
    ).subscribe(value => {
      this.searchTerm.set(value ?? '');
    });
  }

  private loadPokedex(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.dataService.getPokedexDetail(id).subscribe({
      next: (data) => {
        if (data && data.id) {
          this.pokedex.set(data);
        } else {
          this.error.set('Pokédex not found.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pokedex:', err);
        this.error.set('Failed to load Pokédex.');
        this.loading.set(false);
      }
    });
  }

  selectPokedex(option: PokedexOption): void {
    this.selectedPokedex.set(option);
    this.loadPokedex(option.id);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  extractPokemonId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  capitalize(name: string): string {
    return capitalize(name);
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  getSpriteUrl(id: number): string {
    return getOfficialArtworkUrl(id);
  }

  addToTeam(id: number, name: string, spriteUrl: string): void {
    if (this.teamService.isTeamFull()) {
      alert('Your team is full! Remove a Pokémon to add more.');
      return;
    }
    const pokemon = new Pokemon(
      id.toString(), name, spriteUrl, 'unknown', '', 'unknown', 'unknown',
      [], 0, 1, 0, [], 0, 0, [], []
    );
    const added = this.teamService.addToTeam(pokemon);
    if (added) {
      const card = document.querySelector(`[data-pokemon-id="${id}"]`);
      if (card) {
        card.classList.add('added-to-team');
        setTimeout(() => card.classList.remove('added-to-team'), 600);
      }
    } else {
      alert('This Pokémon is already in your team!');
    }
  }

  isInTeam(id: number): boolean {
    return this.teamService.isInTeam(id);
  }

  isViewed(id: number): boolean {
    return this.progressService.isViewed(id);
  }
}
