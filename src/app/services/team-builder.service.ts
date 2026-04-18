import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataServiceService } from './data-service.service';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { Pokemon } from '../shared/pokemon';

export interface TeamArchetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  strategy: string;
  roles: TeamRole[];
}

export interface TeamRole {
  role: string;
  description: string;
  priorityStats: string[];
  preferredTypes?: string[];
}

export interface GeneratedTeam {
  archetype: TeamArchetype;
  pokemon: PokemonWithStats[];
  synergyScore: number;
}

export interface PokemonWithStats extends Pokemon {
  stats: { name: string; value: number }[];
  totalStats: number;
  generation: number;
  baseExperience: number;
  types: any[];
  height: number;
  weight: number;
  abilities: any[];
  moves: any[];
}

export interface GenerationFilter {
  name: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: GenerationFilter[] = [
  { name: 'Gen I', startId: 1, endId: 151 },
  { name: 'Gen II', startId: 152, endId: 251 },
  { name: 'Gen III', startId: 252, endId: 386 },
  { name: 'Gen IV', startId: 387, endId: 493 },
  { name: 'Gen V', startId: 494, endId: 649 },
  { name: 'Gen VI', startId: 650, endId: 721 },
  { name: 'Gen VII', startId: 722, endId: 809 },
  { name: 'Gen VIII', startId: 810, endId: 905 },
  { name: 'Gen IX', startId: 906, endId: 1025 },
];

export const TEAM_ARCHETYPES: TeamArchetype[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Well-rounded team with no weaknesses',
    icon: 'balance',
    strategy: 'Mix of offense and defense with type coverage',
    roles: [
      { role: 'Physical Attacker', description: 'High Attack stat', priorityStats: ['attack'] },
      { role: 'Special Attacker', description: 'High Special Attack', priorityStats: ['special-attack'] },
      { role: 'Physical Wall', description: 'High Defense and HP', priorityStats: ['defense', 'hp'] },
      { role: 'Special Wall', description: 'High Special Defense', priorityStats: ['special-defense'] },
      { role: 'Speed Lead', description: 'Fastest Pokemon', priorityStats: ['speed'] },
      { role: 'Mixed Attacker', description: 'Good Attack and Sp. Atk', priorityStats: ['attack', 'special-attack'] },
    ]
  },
  {
    id: 'hyper-offense',
    name: 'Hyper Offense',
    description: 'Maximum damage output',
    icon: 'local_fire_department',
    strategy: 'Overwhelm opponents with raw power and speed',
    roles: [
      { role: 'Sweeper', description: 'Highest Attack', priorityStats: ['attack', 'speed'] },
      { role: 'Wall Breaker', description: 'Massive Special Attack', priorityStats: ['special-attack'] },
      { role: 'Fast Attacker', description: 'Highest Speed', priorityStats: ['speed'] },
      { role: 'Priority User', description: 'Good Attack + Speed', priorityStats: ['attack', 'speed'] },
      { role: 'Setup Sweeper', description: 'Good all-around stats', priorityStats: ['attack', 'special-attack', 'speed'] },
      { role: 'Revenge Killer', description: 'Extreme Speed', priorityStats: ['speed', 'attack'] },
    ]
  },
  {
    id: 'stall',
    name: 'Stall',
    description: 'Defensive powerhouse',
    icon: 'shield',
    strategy: 'Outlast opponents with superior bulk and recovery',
    roles: [
      { role: 'Physical Wall', description: 'Highest Defense', priorityStats: ['defense', 'hp'] },
      { role: 'Special Wall', description: 'Highest Sp. Defense', priorityStats: ['special-defense', 'hp'] },
      { role: 'Mixed Wall', description: 'Balanced defenses', priorityStats: ['defense', 'special-defense', 'hp'] },
      { role: 'Status Spreader', description: 'High HP and bulk', priorityStats: ['hp', 'defense'] },
      { role: 'Cleric', description: 'High Special Defense', priorityStats: ['special-defense', 'hp'] },
      { role: 'Hazard Setter', description: 'Bulky with good stats', priorityStats: ['defense', 'hp'] },
    ]
  },
  {
    id: 'weather',
    name: 'Weather Team',
    description: 'Control the battlefield with weather',
    icon: 'wb_sunny',
    strategy: 'Exploit weather-boosted moves and abilities',
    roles: [
      { role: 'Weather Setter', description: 'Good bulk to set up', priorityStats: ['defense', 'special-defense'] },
      { role: 'Weather Sweeper', description: 'High Attack + Speed', priorityStats: ['attack', 'speed'] },
      { role: 'Weather Abuser', description: 'High Special Attack', priorityStats: ['special-attack'] },
      { role: 'Defensive Core', description: 'High bulk', priorityStats: ['hp', 'defense'] },
      { role: 'Special Attacker', description: 'High Sp. Attack', priorityStats: ['special-attack'] },
      { role: 'Utility', description: 'Balanced stats', priorityStats: ['defense', 'special-defense'] },
    ]
  },
  {
    id: 'type-synergy',
    name: 'Type Synergy',
    description: 'Perfect type coverage and resistances',
    icon: 'hub',
    strategy: 'Cover all weaknesses with complementary types',
    roles: [
      { role: 'Fire Type', description: 'Fire coverage', priorityStats: ['special-attack'], preferredTypes: ['fire'] },
      { role: 'Water Type', description: 'Water coverage', priorityStats: ['special-attack'], preferredTypes: ['water'] },
      { role: 'Grass Type', description: 'Grass coverage', priorityStats: ['special-attack'], preferredTypes: ['grass'] },
      { role: 'Electric Type', description: 'Electric coverage', priorityStats: ['special-attack'], preferredTypes: ['electric'] },
      { role: 'Psychic Type', description: 'Psychic coverage', priorityStats: ['special-attack'], preferredTypes: ['psychic'] },
      { role: 'Dragon Type', description: 'Dragon coverage', priorityStats: ['attack'], preferredTypes: ['dragon'] },
    ]
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Strike first every time',
    icon: 'bolt',
    strategy: 'Outspeed and eliminate threats before they act',
    roles: [
      { role: 'Fastest', description: 'Highest Speed in team', priorityStats: ['speed'] },
      { role: 'Second Fastest', description: 'High Speed + Attack', priorityStats: ['speed', 'attack'] },
      { role: 'Third Fastest', description: 'Speed + Sp. Attack', priorityStats: ['speed', 'special-attack'] },
      { role: 'Priority User', description: 'Good Speed', priorityStats: ['speed'] },
      { role: 'Choice Scarfer', description: 'Decent Speed + Attack', priorityStats: ['speed', 'attack'] },
      { role: 'Late Cleaner', description: 'Speed + Power', priorityStats: ['speed', 'attack', 'special-attack'] },
    ]
  },
];

@Injectable({
  providedIn: 'root'
})
export class TeamBuilderService {
  private dataService = inject(DataServiceService);
  private pokemonCache = new Map<number, PokemonDetail>();
  private allPokemonLoaded = false;
  private allPokemonDetails: PokemonDetail[] = [];

  async generateMetaTeam(archetypeId: string, generation?: GenerationFilter): Promise<GeneratedTeam | null> {
    const archetype = TEAM_ARCHETYPES.find(a => a.id === archetypeId);
    if (!archetype) return null;

    const pokemonPool = await this.getPokemonPool(generation);
    if (pokemonPool.length === 0) return null;

    const team: PokemonWithStats[] = [];
    const usedIds = new Set<number>();

    for (const role of archetype.roles) {
      const bestPokemon = this.findBestForRole(pokemonPool, role, usedIds);
      if (bestPokemon) {
        team.push(bestPokemon);
        usedIds.add(bestPokemon.id);
      }
    }

    while (team.length < 6) {
      const remaining = pokemonPool.filter(p => !usedIds.has(p.id));
      if (remaining.length === 0) break;
      const random = remaining[Math.floor(Math.random() * remaining.length)];
      team.push(random);
      usedIds.add(random.id);
    }

    return {
      archetype,
      pokemon: team,
      synergyScore: this.calculateSynergy(team)
    };
  }

  async generateStatBasedTeam(stats: string[], generation?: GenerationFilter): Promise<GeneratedTeam | null> {
    const pokemonPool = await this.getPokemonPool(generation);
    if (pokemonPool.length === 0) return null;

    const sorted = [...pokemonPool].sort((a, b) => {
      const aScore = this.calculateStatScore(a, stats);
      const bScore = this.calculateStatScore(b, stats);
      return bScore - aScore;
    });

    const team: PokemonWithStats[] = [];
    const usedIds = new Set<number>();

    for (const pokemon of sorted) {
      if (team.length >= 6) break;
      if (usedIds.has(pokemon.id)) continue;
      team.push(pokemon);
      usedIds.add(pokemon.id);
    }

    return {
      archetype: TEAM_ARCHETYPES[0],
      pokemon: team,
      synergyScore: this.calculateSynergy(team)
    };
  }

  private async getPokemonPool(generation?: GenerationFilter): Promise<PokemonWithStats[]> {
    if (!this.allPokemonLoaded) {
      await this.loadAllPokemon();
    }

    let pool = this.allPokemonDetails;

    if (generation) {
      pool = pool.filter(p => p.id >= generation.startId && p.id <= generation.endId);
    }

    pool = pool.filter(p => p.id > 0 && !this.isFormOrMega(p.name));

    return pool.map(detail => this.toPokemonWithStats(detail));
  }

  private async loadAllPokemon(): Promise<void> {
    const batchSize = 50;
    const maxId = 1025;
    const allDetails: PokemonDetail[] = [];

    for (let offset = 1; offset <= maxId; offset += batchSize) {
      const requests: Observable<PokemonDetail | null>[] = [];
      for (let i = 0; i < batchSize && offset + i <= maxId; i++) {
        const id = offset + i;
        if (this.pokemonCache.has(id)) {
          requests.push(of(this.pokemonCache.get(id)!));
        } else {
          requests.push(this.dataService.getPokemonDetail(id).pipe(
            catchError(() => of(null))
          ));
        }
      }

      const results = await new Promise<PokemonDetail[]>(resolve => {
        forkJoin(requests).subscribe({
          next: (data) => resolve(data.filter((d): d is PokemonDetail => d !== null && d.id > 0)),
          error: () => resolve([])
        });
      });

      results.forEach(detail => {
        this.pokemonCache.set(detail.id, detail);
        allDetails.push(detail);
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.allPokemonDetails = allDetails;
    this.allPokemonLoaded = true;
  }

  private findBestForRole(
    pool: PokemonWithStats[],
    role: TeamRole,
    usedIds: Set<number>
  ): PokemonWithStats | null {
    const available = pool.filter(p => !usedIds.has(p.id));

    if (role.preferredTypes && role.preferredTypes.length > 0) {
      const typeMatch = available.filter(p =>
        p.types.some((t: any) => role.preferredTypes!.includes(t.type.name))
      );
      if (typeMatch.length > 0) {
        return this.sortByStats(typeMatch, role.priorityStats)[0] || null;
      }
    }

    return this.sortByStats(available, role.priorityStats)[0] || null;
  }

  private sortByStats(pool: PokemonWithStats[], priorityStats: string[]): PokemonWithStats[] {
    return [...pool].sort((a, b) => {
      const aScore = this.calculateStatScore(a, priorityStats);
      const bScore = this.calculateStatScore(b, priorityStats);
      return bScore - aScore;
    });
  }

  private calculateStatScore(pokemon: PokemonWithStats, stats: string[]): number {
    let score = 0;
    for (const statName of stats) {
      const stat = pokemon.stats.find(s => s.name === statName);
      if (stat) {
        score += stat.value;
      }
    }
    return score;
  }

  private calculateSynergy(team: PokemonWithStats[]): number {
    const totalStats = team.reduce((sum, p) => sum + p.totalStats, 0);
    const avgStats = totalStats / team.length;

    return Math.min(100, Math.round(avgStats / 5));
  }

  private toPokemonWithStats(detail: PokemonDetail): PokemonWithStats {
    const stats = detail.stats.map(s => ({
      name: s.stat.name,
      value: s.base_stat
    }));

    const totalStats = stats.reduce((sum, s) => sum + s.value, 0);

    const pokemon = new Pokemon(
      detail.id.toString(),
      detail.name,
      detail.sprites.other?.['official-artwork']?.front_default || detail.sprites.front_default || '',
      detail.types[0]?.type.name ?? 'unknown',
      detail.types[1]?.type.name ?? '',
      detail.moves[0]?.move.name ?? 'unknown',
      detail.moves[1]?.move.name ?? '',
      stats,
      totalStats,
      this.getGeneration(detail.id),
      detail.base_experience,
      detail.types,
      detail.height,
      detail.weight,
      detail.abilities,
      detail.moves
    );

    return {
      ...pokemon,
      stats,
      totalStats,
      generation: this.getGeneration(detail.id),
      baseExperience: detail.base_experience,
      types: detail.types,
      height: detail.height,
      weight: detail.weight,
      abilities: detail.abilities,
      moves: detail.moves
    } as PokemonWithStats;
  }

  private getGeneration(id: number): number {
    for (let i = 0; i < GENERATIONS.length; i++) {
      if (id >= GENERATIONS[i].startId && id <= GENERATIONS[i].endId) {
        return i + 1;
      }
    }
    return 9;
  }

  private isFormOrMega(name: string): boolean {
    const formKeywords = ['mega', 'gmax', 'alola', 'galar', 'hisui', 'paldea', 'totem', 'primal'];
    return formKeywords.some(keyword => name.includes(keyword));
  }

  clearCache(): void {
    this.pokemonCache.clear();
    this.allPokemonDetails = [];
    this.allPokemonLoaded = false;
  }
}
