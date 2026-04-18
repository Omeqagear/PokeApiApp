import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { forkJoin, of, catchError } from 'rxjs';
import { Pokemon } from '../shared/pokemon';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';
import { StorageService } from '../services/storage.service';
import {
  TeamBuilderService,
  TEAM_ARCHETYPES,
  GENERATIONS,
  TeamArchetype,
  GenerationFilter,
  GeneratedTeam
} from '../services/team-builder.service';

function getGeneration(id: number): number {
  const genRanges = [
    { start: 1, end: 151 },
    { start: 152, end: 251 },
    { start: 252, end: 386 },
    { start: 387, end: 493 },
    { start: 494, end: 649 },
    { start: 650, end: 721 },
    { start: 722, end: 809 },
    { start: 810, end: 905 },
    { start: 906, end: 1025 },
  ];
  for (let i = 0; i < genRanges.length; i++) {
    if (id >= genRanges[i].start && id <= genRanges[i].end) {
      return i + 1;
    }
  }
  return 9;
}

@Component({
  selector: 'app-equipo-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule
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
  private teamBuilderService = inject(TeamBuilderService);
  private router = inject(Router);

  teamPokemon = signal<Pokemon[]>([]);
  private validPokemonIds: number[] = [];
  private validPokemonLoaded = false;
  private readonly POKEAPI_LIST_LIMIT = 1350;

  // Team builder state
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

  getPokemonImage(item: Pokemon | { id: number; spriteUrl?: string }): string {
    return item.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;
  }

  deleteTeam(): void {
    this.storageService.clear();
    this.teamPokemon.set([]);
    this.generatedTeam.set(null);
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
        
        const newTeam: Pokemon[] = team.pokemon.map(p => {
          const pokemon = new Pokemon(
            p.id.toString(),
            p.name,
            p.spriteUrl,
            p.type1,
            p.type2,
            p.move1,
            p.move2,
            p.stats,
            p.totalStats,
            p.generation,
            p.baseExperience,
            (p as any).types || [],
            (p as any).height || 0,
            (p as any).weight || 0,
            (p as any).abilities || [],
            (p as any).moves || []
          );
          return pokemon;
        });

        this.deleteTeam();
        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });
        this.teamPokemon.set(newTeam);
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
        
        const newTeam: Pokemon[] = team.pokemon.map(p => {
          const pokemon = new Pokemon(
            p.id.toString(),
            p.name,
            p.spriteUrl,
            p.type1,
            p.type2,
            p.move1,
            p.move2,
            p.stats,
            p.totalStats,
            p.generation,
            p.baseExperience,
            (p as any).types || [],
            (p as any).height || 0,
            (p as any).weight || 0,
            (p as any).abilities || [],
            (p as any).moves || []
          );
          return pokemon;
        });

        this.deleteTeam();
        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });
        this.teamPokemon.set(newTeam);
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

  getStatShortName(statName: string): string {
    const shortNames: Record<string, string> = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'SPA',
      'special-defense': 'SPD',
      'speed': 'SPE'
    };
    return shortNames[statName] || statName;
  }

  getStatPercentage(baseStat: number): number {
    return Math.min((baseStat / 255) * 100, 100);
  }

  getStatColor(baseStat: number): string {
    if (baseStat >= 150) return '#ff4081';
    if (baseStat >= 120) return '#ff7043';
    if (baseStat >= 90) return '#ffca28';
    if (baseStat >= 60) return '#66bb6a';
    return '#42a5f5';
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
        .map((p: any) => {
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
          console.warn(`⚠️ Failed to load Pokémon ID ${id}:`, error);
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
          console.error('❌ No valid Pokémon could be loaded');
          alert('Error generating team. Please try again.');
          return;
        }

        const newTeam: Pokemon[] = validResults.map(data => {
          const stats = data.stats.map(s => ({ name: s.stat.name, value: s.base_stat }));
          const totalStats = stats.reduce((sum, s) => sum + s.value, 0);
          return new Pokemon(
            data.id.toString(),
            data.name,
            data.sprites.front_default || '',
            data.types[0]?.type.name ?? 'unknown',
            data.types[1]?.type.name ?? '',
            data.moves[0]?.move.name ?? 'unknown',
            data.moves[1]?.move.name ?? '',
            stats,
            totalStats,
            getGeneration(data.id),
            data.base_experience,
            data.types,
            data.height,
            data.weight,
            data.abilities,
            data.moves
          );
        });

        newTeam.forEach(pokemon => {
          this.storageService.set(pokemon.id.toString(), pokemon);
        });

        this.teamPokemon.set(newTeam);
      },
      error: (error) => {
        console.error('💥 Unexpected error in forkJoin:', error);
        alert('Error generating team. Please try again.');
      }
    });
  }
}
