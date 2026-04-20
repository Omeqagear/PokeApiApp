import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataServiceService } from '../../services/data-service.service';
import { AbilityDetail, PokemonSummary } from '../../shared/pokemon-api.interfaces';
import { PokeballSpinnerComponent } from '../../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { capitalize } from '../../shared/utils/pokemon.utils';

@Component({
  selector: 'app-ability-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent
  ],
  templateUrl: './ability-detail.component.html',
  styleUrls: ['./ability-detail.component.scss']
})
export class AbilityDetailComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private route = inject(ActivatedRoute);

  abilityId = signal<number>(0);
  ability = signal<AbilityDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.abilityId.set(id);
    this.loadAbilityDetail(id);
  }

  private loadAbilityDetail(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.dataService.getAbilityDetail(id).subscribe({
      next: (data) => {
        if (data && data.id) {
          this.ability.set(data);
        } else {
          this.error.set('Ability not found.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading ability:', err);
        this.error.set('Failed to load ability details.');
        this.loading.set(false);
      }
    });
  }

  capitalize(name: string): string {
    return capitalize(name);
  }

  getEnglishName(): string {
    const entry = this.ability()?.names.find(n => n.language.name === 'en');
    return entry?.name ?? this.capitalize(this.ability()?.name ?? '');
  }

  getEnglishEffect(): string | null {
    const entry = this.ability()?.effect_entries.find(e => e.language.name === 'en');
    return entry?.effect ?? null;
  }

  getEnglishShortEffect(): string | null {
    const entry = this.ability()?.effect_entries.find(e => e.language.name === 'en');
    return entry?.short_effect ?? null;
  }

  getEnglishFlavorTexts(): { text: string; version: string }[] {
    return (this.ability()?.flavor_text_entries ?? [])
      .filter(e => e.language.name === 'en')
      .slice(-5)
      .map(e => ({ text: e.flavor_text, version: e.version_group.name.replace('-', ' ') }));
  }

  getPokemonWithAbility(pokemon: PokemonSummary): string {
    const parts = pokemon.url.split('/').filter(Boolean);
    return `/photo/${parts[parts.length - 1]}`;
  }

  getSpriteUrl(pokemon: PokemonSummary): string {
    const parts = pokemon.url.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}
