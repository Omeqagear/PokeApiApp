import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '../services/favorites.service';
import { TeamService } from '../services/team.service';
import { Pokemon } from '../shared/pokemon';
import { PokeCardComponent } from '../shared/components/poke-card/poke-card.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    PokeCardComponent,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  template: `
    <ds-page-header title="Favorites" [showStats]="true">
      <div stats aria-live="polite">
        <mat-icon>favorite</mat-icon>
        <span>{{ favorites().length }} Pokémon saved</span>
      </div>
      @if (favorites().length > 0) {
        <div class="header-actions">
          <button mat-flat-button color="warn" (click)="clearAll()" aria-label="Clear all favorites">
            <mat-icon>delete_sweep</mat-icon>
            Clear All
          </button>
        </div>
      }
    </ds-page-header>

    @if (favorites().length === 0) {
      <ds-empty-state
        icon="favorite_border"
        title="No favorites yet"
        message="Tap the heart icon on any Pokémon to save them here for quick access!"
        actionLabel="Browse Catalog"
        actionRoute="/catalog"
        actionIcon="grid_view"
      ></ds-empty-state>
    }

    @if (favorites().length > 0) {
      <div class="favorites-grid" role="list">
        @for (pokemon of favorites(); track pokemon.id) {
          <div role="listitem">
            <ds-poke-card
              [pokemon]="{
                id: pokemon.id,
                name: pokemon.name,
                spriteUrl: pokemon.spriteUrl,
                types: pokemon.types
              }"
              [showTypes]="true"
              (cardClick)="navigateToPokemon(pokemon.id)"
            >
              <div actions>
                <button
                  mat-icon-button
                  class="remove-btn"
                  (click)="removeFavorite(pokemon.id); $event.stopPropagation()"
                  [attr.aria-label]="'Remove ' + pokemon.name + ' from favorites'"
                  matTooltip="Remove from favorites"
                >
                  <mat-icon>favorite</mat-icon>
                </button>
                @if (!isInTeam(pokemon.id)) {
                  <button
                    mat-icon-button
                    class="add-team-btn"
                    (click)="addToTeam(pokemon); $event.stopPropagation()"
                    [attr.aria-label]="'Add ' + pokemon.name + ' to team'"
                    matTooltip="Add to team"
                  >
                    <mat-icon>add_circle</mat-icon>
                  </button>
                }
              </div>
            </ds-poke-card>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .header-actions {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 0 24px 48px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .remove-btn {
      color: var(--color-danger, #ef4444);

      &:hover {
        transform: scale(1.15);
      }
    }

    .add-team-btn {
      color: var(--brand-primary, #8b5cf6);

      &:hover {
        transform: scale(1.15);
      }
    }

    @media (max-width: 600px) {
      .favorites-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 0 12px 32px;
      }
    }
  `]
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  private teamService = inject(TeamService);
  private router = inject(Router);

  favorites = this.favoritesService.favorites;

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  removeFavorite(id: number): void {
    this.favoritesService.removeFavorite(id);
  }

  clearAll(): void {
    if (confirm('Are you sure you want to remove all favorites?')) {
      this.favoritesService.clearFavorites();
    }
  }

  addToTeam(pokemon: { id: number; name: string; spriteUrl?: string; types?: { type: { name: string } }[] }): void {
    if (this.teamService.isTeamFull()) {
      alert('Your team is full! Remove a Pokémon to add more.');
      return;
    }

    if (this.teamService.isInTeam(pokemon.id)) {
      alert('This Pokémon is already in your team!');
      return;
    }

    const pokemonObj = new Pokemon(
      pokemon.id.toString(),
      pokemon.name,
      pokemon.spriteUrl || '',
      pokemon.types?.[0]?.type?.name || 'unknown',
      pokemon.types?.[1]?.type?.name || '',
      'unknown',
      'unknown',
      [],
      0,
      1,
      0,
      pokemon.types?.map(t => ({ slot: t.type.name === 'unknown' ? 0 : 1, type: { name: t.type.name, url: '' } })) || [],
      0,
      0,
      [],
      []
    );

    const added = this.teamService.addToTeam(pokemonObj);
    if (added) {
      this.showAddedFeedback(pokemon.id);
    }
  }

  isInTeam(id: number): boolean {
    return this.teamService.isInTeam(id);
  }

  private showAddedFeedback(id: number): void {
    const card = document.querySelector(`[data-pokemon-id="${id}"]`);
    if (card) {
      card.classList.add('added-to-team');
      setTimeout(() => card.classList.remove('added-to-team'), 600);
    }
  }
}