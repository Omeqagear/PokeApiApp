import { Injectable } from '@angular/core';
import { Pokemon } from '../pokemon';
import { PokemonDetail } from '../pokemon-api.interfaces';
import { getGeneration } from '../utils/pokemon.utils';

@Injectable({
  providedIn: 'root'
})
export class PokemonTransformerService {
  
  /**
   * Converts a PokemonDetail from PokeAPI to internal Pokemon model
   */
  convertToInternalPokemon(detail: PokemonDetail): Pokemon {
    const stats = detail.stats.map(s => ({
      name: s.stat.name,
      value: s.base_stat
    }));
    
    return new Pokemon(
      detail.id.toString(),
      detail.name,
      detail.sprites.front_default || '',
      this.getPrimaryType(detail),
      this.getSecondaryType(detail),
      this.getMove(detail.moves[0]?.move.name),
      this.getMove(detail.moves[1]?.move.name),
      stats,
      this.calculateTotalStats(stats),
      getGeneration(detail.id),
      detail.base_experience,
      detail.types,
      detail.height,
      detail.weight,
      detail.abilities,
      detail.moves
    );
  }

  /**
   * Safely extracts the primary Pokemon type
   */
  private getPrimaryType(detail: PokemonDetail): string {
    return detail.types?.[0]?.type?.name ?? 'unknown';
  }

  /**
   * Safely extracts the secondary Pokemon type if it exists
   */
  private getSecondaryType(detail: PokemonDetail): string {
    return detail.types?.[1]?.type?.name ?? '';
  }

  /**
   * Gets a move name or returns 'unknown' if none exists
   */
  private getMove(moveName?: string): string {
    return moveName ?? 'unknown';
  }

  /**
   * Calculates total stats for display purposes
   */
  private calculateTotalStats(stats: { name: string; value: number }[]): number {
    if (stats.length === 0) return 0;
    
    const standardStats = [
      'hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'
    ];
    
    return stats.reduce((sum, stat) => {
      if (standardStats.includes(stat.name)) {
        return sum + stat.value;
      }
      return sum;
    }, 0);
  }
}
