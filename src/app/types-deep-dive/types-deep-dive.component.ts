import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DataServiceService } from '../services/data-service.service';
import { TypeDetail, PokemonSummary } from '../shared/pokemon-api.interfaces';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { PokeCardComponent, PokeCardPokemon } from '../shared/components/poke-card/poke-card.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { getTypeColor } from '../shared/utils/type.utils';
import { capitalize } from '../shared/utils/pokemon.utils';
import { catchError, of } from 'rxjs';

interface TypeEffectiveness {
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
}

@Component({
  selector: 'app-types-deep-dive',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TypeBadgeComponent,
    PokeCardComponent,
    PokeballSpinnerComponent,
    PageHeaderComponent
  ],
  templateUrl: './types-deep-dive.component.html',
  styleUrl: './types-deep-dive.component.scss'
})
export class TypesDeepDiveComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private router = inject(Router);

  allTypes = signal<TypeDetail[]>([]);
  selectedType = signal<TypeDetail | null>(null);
  loading = signal(true);
  selectedTab = signal(0);

  typeEffectiveness = computed<TypeEffectiveness | null>(() => {
    const type = this.selectedType();
    if (!type) return null;
    const dr = type.damage_relations;
    return {
      doubleDamageFrom: dr.double_damage_from.map(t => t.name),
      halfDamageFrom: dr.half_damage_from.map(t => t.name),
      noDamageFrom: dr.no_damage_from.map(t => t.name),
      doubleDamageTo: dr.double_damage_to.map(t => t.name),
      halfDamageTo: dr.half_damage_to.map(t => t.name),
      noDamageTo: dr.no_damage_to.map(t => t.name)
    };
  });

  typePokemon = computed<PokeCardPokemon[]>(() => {
    const type = this.selectedType();
    if (!type) return [];
    return type.pokemon.slice(0, 20).map(entry => {
      const id = parseInt(entry.pokemon.url.split('/').filter(Boolean).pop() ?? '0', 10);
      return {
        id,
        name: entry.pokemon.name,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        types: [{ type: { name: type.name } }]
      };
    });
  });

  typeMoves = computed<PokemonSummary[]>(() => {
    const type = this.selectedType();
    if (!type) return [];
    return type.moves.slice(0, 20);
  });

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading.set(true);
    this.dataService.getAllTypesWithDetails().pipe(
      catchError(() => of([]))
    ).subscribe(types => {
      this.allTypes.set(types.filter(t => t.id <= 18));
      this.loading.set(false);
    });
  }

  selectType(type: TypeDetail): void {
    this.selectedType.set(type);
    this.selectedTab.set(0);
  }

  goBack(): void {
    this.selectedType.set(null);
  }

  navigateToMove(move: PokemonSummary): void {
    const id = parseInt(move.url.split('/').filter(Boolean).pop() ?? '0', 10);
    this.router.navigate(['/move', id]);
  }

  navigateToPokemon(id: number): void {
    this.router.navigate(['/photo', id]);
  }

  getTypeColor(typeName: string): string {
    return getTypeColor(typeName);
  }

  capitalize(value: string): string {
    return capitalize(value);
  }

  trackByName(_index: number, item: { name: string }): string {
    return item.name;
  }
}
