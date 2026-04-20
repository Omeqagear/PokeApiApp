import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataServiceService } from '../../services/data-service.service';
import { MoveDetail, MoveMeta, PokemonSummary } from '../../shared/pokemon-api.interfaces';
import { PokeballSpinnerComponent } from '../../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TypeBadgeComponent } from '../../shared/components/type-badge/type-badge.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { capitalize } from '../../shared/utils/pokemon.utils';

@Component({
  selector: 'app-move-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    TypeBadgeComponent,
    PageHeaderComponent
  ],
  templateUrl: './move-detail.component.html',
  styleUrls: ['./move-detail.component.scss']
})
export class MoveDetailComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private route = inject(ActivatedRoute);

  moveId = signal<number>(0);
  move = signal<MoveDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.moveId.set(id);
    this.loadMoveDetail(id);
  }

  private loadMoveDetail(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.dataService.getMoveDetail(id).subscribe({
      next: (data: MoveDetail) => {
        if (data && data.id) {
          this.move.set(data);
        } else {
          this.error.set('Move not found.');
        }
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading move:', err);
        this.error.set('Failed to load move details.');
        this.loading.set(false);
      }
    });
  }

  capitalize(name: string): string {
    return capitalize(name);
  }

  getDamageClassLabel(dc: string | null): string {
    if (!dc) return 'Unknown';
    return dc.charAt(0).toUpperCase() + dc.slice(1);
  }

  getDamageClassIcon(dc: string | null): string {
    if (!dc) return 'help';
    const icons: Record<string, string> = { physical: 'swords', special: 'auto_awesome', status: 'healing' };
    return icons[dc] || 'help';
  }

  getMetaLabel(meta: MoveMeta | null): string[] {
    if (!meta) return [];
    const labels: string[] = [];
    if (meta.min_hits && meta.max_hits) labels.push(`Hits: ${meta.min_hits}-${meta.max_hits}`);
    if (meta.min_turns) labels.push(`Duration: ${meta.min_turns} turn(s)`);
    if (meta.drain) labels.push(`Drain: ${meta.drain}%`);
    if (meta.healing) labels.push(`Healing: ${meta.healing}%`);
    if (meta.flinch_chance) labels.push(`Flinch: ${meta.flinch_chance}%`);
    if (meta.ailment_chance) labels.push(`Ailment: ${meta.ailment_chance}%`);
    return labels;
  }

  navigateToPokemon(id: number): string {
    return `/photo/${id}`;
  }

  getLearnedByPokemonUrl(pokemon: PokemonSummary): string {
    const parts = pokemon.url.split('/').filter(Boolean);
    return `/photo/${parts[parts.length - 1]}`;
  }

  getPokemonSpriteUrl(pokemon: PokemonSummary): string {
    const parts = pokemon.url.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}
