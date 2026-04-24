import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin, of, catchError } from 'rxjs';
import { Pokemon } from '../shared/pokemon';
import { PokemonDetail, PokemonMoveEntry } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';
import { StorageService } from '../services/storage.service';
import { TeamService } from '../services/team.service';
import {
  TeamBuilderService,
  TEAM_ARCHETYPES,
  GENERATIONS,
  TeamArchetype,
  GenerationFilter,
  GeneratedTeam
} from '../services/team-builder.service';
import { PokeCardComponent } from '../shared/components/poke-card/poke-card.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { PokemonTransformerService } from '../shared/types/pokemon-transformer.service';

@Component({
  selector: 'app-equipo-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    PokeCardComponent,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './equipo-pokemon.component.html',
  styleUrls: ['./equipo-pokemon.component.scss'],
})
export class EquipoPokemonComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private storageService = inject(StorageService);
  private teamBuilderService = inject(TeamBuilderService);
  private teamService = inject(TeamService);
  private pokemonTransformer = inject(PokemonTransformerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  teamPokemon = signal<Pokemon[]>([]);
  private validPokemonIds: number[] = [];
  private validPokemonLoaded = false;
  private readonly POKEAPI_LIST_LIMIT = 1350;

  selectedArchetype = signal<TeamArchetype | null>(null);
  selectedGeneration = signal<GenerationFilter | null>(null);
  selectedStatPriority = signal<string[]>([]);
  generatedTeam = signal<GeneratedTeam | null>(null);
  isGenerating = signal(false);
  generationProgress = signal(0);
  activeTab = signal<'manual' | 'builder'>('manual');
  includeLegendary = signal<boolean>(true);
  teamArchetypes = TEAM_ARCHETYPES;
  generations = GENERATIONS;

  availableStats = [
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'Attack' },
    { value: 'defense', label: 'Defense' },
    { value: 'special-attack', label: 'Sp. Attack' },
    { value: 'special-defense', label: 'Sp. Defense' },
    { value: 'speed', label: 'Speed' }
  ];

  ngOnInit(): void {
    this.loadTeamFromStorage();
  }

  private loadTeamFromStorage(): void {
    const keys = this.storageService.keys();
    const team: Pokemon[] = [];

    keys.forEach(key => {
      if (key === 'valid_pokemon_ids_cache' || key === 'viewed-pokemon') return;
      const pokemon = this.storageService.get<Pokemon>(key);
      if (pokemon && pokemon.id && pokemon.name) {
        team.push(pokemon);
      }
    });
    
    this.teamPokemon.set(team);
  }

  deletePokemon(pokemon: Pokemon): void {
    this.storageService.remove(pokemon.id.toString());
    this.teamPokemon.update(team => team.filter(p => p.id !== pokemon.id));
    this.teamService.refreshCount();
  }

  getPokemonImage(item: Pokemon | { id: number; spriteUrl?: string }): string {
    return item.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
  }

  deleteTeam(): void {
    this.teamPokemon().forEach(p => this.storageService.remove(p.id.toString()));
    this.teamPokemon.set([]);
    this.generatedTeam.set(null);
    this.teamService.refreshCount();
  }

  exportTeam(): void {
    if (this.teamPokemon().length === 0) return;

    const teamData = this.teamPokemon().map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name,
      spriteUrl: pokemon.spriteUrl,
      type1: pokemon.type1,
      type2: pokemon.type2,
      stats: pokemon.stats,
      totalStats: pokemon.totalStats
    }));

    const dataStr = JSON.stringify(teamData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `pokedex-team-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  importTeam(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const teamData = JSON.parse(content);

          if (!Array.isArray(teamData)) {
            this.snackBar.open('Invalid team file format', 'OK', { duration: 4000 });
            return;
          }

          const existingIds = this.teamPokemon().map(p => p.id);
          let imported = 0;

          teamData.forEach((data: {
            id: number;
            name: string;
            spriteUrl?: string;
            type1?: string;
            type2?: string;
            move1?: string;
            move2?: string;
            stats?: { name: string; value: number }[];
            totalStats?: number;
            generation?: number;
            baseExperience?: number;
            types?: { slot: number; type: { name: string; url: string } }[];
            height?: number;
            weight?: number;
            abilities?: { is_hidden: boolean; slot: number; ability: { name: string; url: string } }[];
            moves?: PokemonMoveEntry[];
          }) => {
            if (data.id && !existingIds.includes(data.id)) {
              const pokemon = new Pokemon(
            data.id.toString(),
            data.name,
            data.spriteUrl || '',
            data.type1 || 'unknown',
            data.type2 || '',
            data.move1 || 'unknown',
            data.move2 || 'unknown',
            data.stats || [],
            data.totalStats || 0,
            data.generation || 1,
            data.baseExperience || 0,
            data.types || [],
            data.height || 0,
            data.weight || 0,
            data.abilities || [],
            data.moves || []
          );

              this.storageService.set(pokemon.id.toString(), pokemon);
              imported++;
            }
          });

          if (imported > 0) {
            this.loadTeamFromStorage();
            this.teamService.refreshCount();
            this.snackBar.open(`Successfully imported ${imported} Pokémon!`, 'OK', { duration: 4000 });
          } else {
            this.snackBar.open('No new Pokémon to import (team may already have these)', 'OK', { duration: 4000 });
          }
        } catch (error) {
          console.error('Error importing team:', error);
          this.snackBar.open('Failed to import team. Invalid file format.', 'OK', { duration: 4000 });
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  setActiveTab(tab: 'manual' | 'builder'): void {
    this.activeTab.set(tab);
  }

  selectArchetype(archetype: TeamArchetype): void {
    if (this.selectedArchetype()?.id === archetype.id) {
      this.selectedArchetype.set(null);
    } else {
      this.selectedArchetype.set(archetype);
    }
  }

  selectGeneration(gen: GenerationFilter): void {
    if (this.selectedGeneration()?.name === gen.name) {
      this.selectedGeneration.set(null);
    } else {
      this.selectedGeneration.set(gen);
    }
  }

  toggleStat(stat: string): void {
    this.selectedStatPriority.update(stats => {
      if (stats.includes(stat)) {
        return stats.filter(s => s !== stat);
      }
      return [...stats, stat];
    });
  }

  async generateMetaTeam(): Promise<void> {
    const archetype = this.selectedArchetype();
    if (!archetype) return;

    this.isGenerating.set(true);
    this.generationProgress.set(10);

    try {
      const team = await this.teamBuilderService.generateMetaTeam(
        archetype.id,
        this.selectedGeneration() || undefined,
        this.includeLegendary()
      );

      this.generationProgress.set(80);

      if (team) {
        this.generatedTeam.set(team);

        const newTeam: Pokemon[] = team.pokemon.map(p => new Pokemon(
          p.id.toString(),
          p.name,
          p.spriteUrl,
          p.type1,
          p.type2,
          p.move1,
          p.move2,
          p.stats || [],
          p.totalStats,
          p.generation,
          p.baseExperience,
          p.types || [],
          p.height || 0,
          p.weight || 0,
          p.abilities || [],
          p.moves || []
        ));

        this.deleteTeam();
        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });
        this.teamPokemon.set(newTeam);
        this.teamService.refreshCount();
      }

      this.generationProgress.set(100);
      setTimeout(() => {
        this.isGenerating.set(false);
        this.generationProgress.set(0);
      }, 500);
    } catch (error) {
      console.error('Error generating team:', error);
      this.isGenerating.set(false);
      this.generationProgress.set(0);
    }
  }

  async generateStatTeam(): Promise<void> {
    const stats = this.selectedStatPriority();
    if (stats.length === 0) return;

    this.isGenerating.set(true);
    this.generationProgress.set(10);

    try {
      const team = await this.teamBuilderService.generateStatBasedTeam(
        stats,
        this.selectedGeneration() || undefined,
        this.includeLegendary()
      );

      this.generationProgress.set(80);

      if (team) {
        this.generatedTeam.set(team);

        const newTeam: Pokemon[] = team.pokemon.map(p => new Pokemon(
          p.id.toString(),
          p.name,
          p.spriteUrl,
          p.type1,
          p.type2,
          p.move1,
          p.move2,
          p.stats || [],
          p.totalStats,
          p.generation,
          p.baseExperience,
          p.types || [],
          p.height || 0,
          p.weight || 0,
          p.abilities || [],
          p.moves || []
        ));

        this.deleteTeam();
        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });
        this.teamPokemon.set(newTeam);
        this.teamService.refreshCount();
      }

      this.generationProgress.set(100);
      setTimeout(() => {
        this.isGenerating.set(false);
        this.generationProgress.set(0);
      }, 500);
    } catch (error) {
      console.error('Error generating stat team:', error);
      this.isGenerating.set(false);
      this.generationProgress.set(0);
    }
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  async loadValidPokemonIds(): Promise<void> {
    if (this.validPokemonLoaded) return;

    const CACHE_KEY = 'valid_pokemon_ids_cache';

    const cached = this.storageService.get<{ ids: number[]; timestamp: number }>(CACHE_KEY);
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

    if (cached?.ids && cached.timestamp && (now - cached.timestamp < CACHE_DURATION)) {
      this.validPokemonIds = cached.ids;
      this.validPokemonLoaded = true;
      return;
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.POKEAPI_LIST_LIMIT}`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      this.validPokemonIds = data.results
        .map((p: { url: string }) => {
          const match = p.url.match(/\/pokemon\/(\d+)\/$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((id: number | null): id is number => id !== null && id > 0);

      this.storageService.set(CACHE_KEY, {
        ids: this.validPokemonIds,
        timestamp: now
      });

      this.validPokemonLoaded = true;

    } catch (error) {
      console.warn('Failed to load valid Pokémon IDs, using fallback range:', error);
      this.validPokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);
      this.validPokemonLoaded = true;
    }
  }

  private getRandomUniqueIds(count: number, exclude: number[] = []): number[] {
    const pool = this.validPokemonIds.filter(id => !exclude.includes(id));

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  async genRandomTeam(): Promise<void> {
    if (!this.validPokemonLoaded) {
      await this.loadValidPokemonIds();
    }

    this.deleteTeam();

    let ids = this.getRandomUniqueIds(6);

    if (!this.includeLegendary()) {
      const nonLegendaryIds: number[] = [];
      let attempts = 0;
      const maxAttempts = ids.length * 3;

      for (const id of ids) {
        if (nonLegendaryIds.length >= 6) break;
        if (attempts >= maxAttempts) break;

        const isLegendary = await this.teamBuilderService.isLegendary(id);
        if (!isLegendary) {
          nonLegendaryIds.push(id);
        } else {
          const replacementIds = this.getRandomUniqueIds(1, [...ids, ...nonLegendaryIds]);
          if (replacementIds.length > 0) {
            ids = [...ids.filter(i => i !== id), ...replacementIds];
          }
        }
        attempts++;
      }

      if (nonLegendaryIds.length < 6) {
        const remaining = 6 - nonLegendaryIds.length;
        const extraIds = this.getRandomUniqueIds(remaining, nonLegendaryIds);
        for (const id of extraIds) {
          const isLegendary = await this.teamBuilderService.isLegendary(id);
          if (!isLegendary) {
            nonLegendaryIds.push(id);
          }
        }
      }

      ids = nonLegendaryIds.length > 0 ? nonLegendaryIds : ids;
    }

    const requests = ids.map(id =>
      this.dataService.getPokemonDetail(id).pipe(
        catchError(error => {
          console.warn(`Failed to load Pokémon ID ${id}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const validResults = results.filter(
          (data): data is PokemonDetail => data !== null && !!data?.sprites?.front_default
        );

        if (validResults.length === 0) {
          console.error('No valid Pokémon could be loaded');
          this.snackBar.open('Error generating team. Please try again.', 'OK', { duration: 4000 });
          return;
        }

        // Convert API PokemonDetail to internal Pokemon model
        const newTeam: Pokemon[] = validResults.map((data) => 
          this.pokemonTransformer.convertToInternalPokemon(data)
        );

        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });

        this.teamPokemon.set(newTeam);
        this.teamService.refreshCount();
      },
      error: (error) => {
        console.error('Unexpected error in forkJoin:', error);
        this.snackBar.open('Error generating team. Please try again.', 'OK', { duration: 4000 });
      }
    });
  }
}
