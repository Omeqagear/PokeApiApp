import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Pokemon } from '../shared/pokemon';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly TEAM_SIZE_LIMIT = 6;

  constructor(private storageService: StorageService) {
    this.loadTeamCount();
  }

  private _teamCount = signal(0);
  teamCount = this._teamCount.asReadonly();

  private loadTeamCount(): void {
    const keys = this.storageService.keys();
    this._teamCount.set(keys.length);
  }

  getTeam(): Pokemon[] {
    const keys = this.storageService.keys();
    const team: Pokemon[] = [];
    keys.forEach(key => {
      const pokemon = this.storageService.get<Pokemon>(key);
      if (pokemon) {
        team.push(pokemon);
      }
    });
    return team;
  }

  addToTeam(pokemon: Pokemon): boolean {
    if (this._teamCount() >= this.TEAM_SIZE_LIMIT) {
      return false;
    }

    const existingKeys = this.storageService.keys();
    const alreadyInTeam = existingKeys.some(key => {
      const existing = this.storageService.get<Pokemon>(key);
      return existing && existing.id === pokemon.id;
    });

    if (alreadyInTeam) {
      return false;
    }

    this.storageService.set(pokemon.id.toString(), pokemon);
    this._teamCount.update(c => c + 1);
    return true;
  }

  removeFromTeam(pokemonId: number): void {
    this.storageService.remove(pokemonId.toString());
    this._teamCount.update(c => Math.max(0, c - 1));
  }

  isInTeam(pokemonId: number): boolean {
    const team = this.getTeam();
    return team.some(p => p.id === pokemonId);
  }

  clearTeam(): void {
    this.storageService.clear();
    this._teamCount.set(0);
  }

  isTeamFull(): boolean {
    return this._teamCount() >= this.TEAM_SIZE_LIMIT;
  }

  refreshCount(): void {
    this.loadTeamCount();
  }
}