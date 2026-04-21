import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { DataServiceService } from '../services/data-service.service';
import { TypeDetail } from '../shared/pokemon-api.interfaces';
import { TypeBadgeComponent } from '../shared/components/type-badge/type-badge.component';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { catchError, of } from 'rxjs';

const TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

interface TypeHoverInfo {
  attackingType: string;
  defendingType: string;
  effectiveness: number;
  label: string;
}

@Component({
  selector: 'app-battle-strategy',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    TypeBadgeComponent,
    PokeballSpinnerComponent,
    PageHeaderComponent
  ],
  templateUrl: './battle-strategy.component.html',
  styleUrl: './battle-strategy.component.scss'
})
export class BattleStrategyComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private fb = inject(FormBuilder);

  readonly types = TYPES;
  readonly activeTab = signal<'chart' | 'calculator'>('chart');
  readonly typeDetails = signal<TypeDetail[]>([]);
  readonly loading = signal(true);
  readonly selectedType = signal<string | null>(null);
  readonly selectedDefensiveTypes = signal<string[]>([]);
  readonly damageResult = signal<{ damage: number; effectiveness: number; label: string } | null>(null);
  readonly hoveredCell = signal<TypeHoverInfo | null>(null);
  readonly typeSearch = signal('');

  filteredTypes = computed(() => {
    const search = this.typeSearch().toLowerCase();
    if (!search) return this.types;
    return this.types.filter(t => t.includes(search));
  });

  moveRecommendations = computed(() => {
    const selected = this.selectedType();
    if (!selected) return { strongAgainst: [], weakAgainst: [], resistantTo: [], weakTo: [] };

    const details = this.typeDetails();
    const typeDetail = details.find(t => t.name === selected);
    if (!typeDetail) return { strongAgainst: [], weakAgainst: [], resistantTo: [], weakTo: [] };

    const strongAgainst = typeDetail.damage_relations.double_damage_to.map(t => t.name);
    const weakAgainst = typeDetail.damage_relations.half_damage_to.map(t => t.name)
      .concat(typeDetail.damage_relations.no_damage_to.map(t => t.name));
    const weakTo = typeDetail.damage_relations.double_damage_from.map(t => t.name);
    const resistantTo = typeDetail.damage_relations.half_damage_from.map(t => t.name)
      .concat(typeDetail.damage_relations.no_damage_from.map(t => t.name));

    return { strongAgainst, weakAgainst, resistantTo, weakTo };
  });

  defensiveMatchups = computed(() => {
    const selected = this.selectedDefensiveTypes();
    if (selected.length === 0) return { weakTo: [], resistantTo: [], immuneTo: [], neutralTo: [] };

    const details = this.typeDetails();
    const effectivenessMap = new Map<string, number>();

    for (const defType of selected) {
      const typeDetail = details.find(t => t.name === defType);
      if (!typeDetail) continue;

      for (const atkType of TYPES) {
        const atkDetail = details.find(t => t.name === atkType);
        if (!atkDetail) continue;

        let eff = 1;
        if (atkDetail.damage_relations.double_damage_to.some(t => t.name === defType)) eff = 2;
        else if (atkDetail.damage_relations.half_damage_to.some(t => t.name === defType)) eff = 0.5;
        else if (atkDetail.damage_relations.no_damage_to.some(t => t.name === defType)) eff = 0;

        const current = effectivenessMap.get(atkType) ?? 1;
        effectivenessMap.set(atkType, current * eff);
      }
    }

    const weakTo: string[] = [];
    const resistantTo: string[] = [];
    const immuneTo: string[] = [];
    const neutralTo: string[] = [];

    effectivenessMap.forEach((eff, type) => {
      if (eff === 0) immuneTo.push(type);
      else if (eff < 1) resistantTo.push(type);
      else if (eff > 1) weakTo.push(type);
      else neutralTo.push(type);
    });

    return { weakTo, resistantTo, immuneTo, neutralTo };
  });

  calculatorForm = this.fb.group({
    attackingType: ['fire'],
    defendingTypes: [['normal']],
    power: [80],
    level: [50]
  });

  ngOnInit(): void {
    this.dataService.getAllTypesWithDetails().pipe(
      catchError((error) => {
        console.error('Error loading type details:', error);
        return of([]);
      })
    ).subscribe((details) => {
      this.typeDetails.set(details);
      this.loading.set(false);
    });
  }

  getEffectiveness(attackingType: string, defendingType: string): number {
    const details = this.typeDetails();
    const typeDetail = details.find(t => t.name === attackingType);
    if (!typeDetail) return 1;

    const relations = typeDetail.damage_relations;

    if (relations.no_damage_to.some(t => t.name === defendingType)) return 0;
    if (relations.half_damage_to.some(t => t.name === defendingType)) return 0.5;
    if (relations.double_damage_to.some(t => t.name === defendingType)) return 2;

    return 1;
  }

  getCellClass(effectiveness: number): string {
    if (effectiveness === 0) return 'cell-none';
    if (effectiveness === 0.25) return 'cell-very-resistant';
    if (effectiveness === 0.5) return 'cell-resistant';
    if (effectiveness === 1) return 'cell-neutral';
    if (effectiveness === 2) return 'cell-super-effective';
    if (effectiveness === 4) return 'cell-very-super-effective';
    return 'cell-neutral';
  }

  getEffectivenessLabel(effectiveness: number): string {
    if (effectiveness === 0) return '0x';
    if (effectiveness === 0.25) return '0.25x';
    if (effectiveness === 0.5) return '0.5x';
    if (effectiveness === 1) return '1x';
    if (effectiveness === 2) return '2x';
    if (effectiveness === 4) return '4x';
    return '1x';
  }

  getHoverLabel(effectiveness: number): string {
    if (effectiveness === 0) return 'No effect';
    if (effectiveness === 0.25) return 'Very resistant';
    if (effectiveness === 0.5) return 'Resistant';
    if (effectiveness === 1) return 'Neutral';
    if (effectiveness === 2) return 'Super effective';
    if (effectiveness === 4) return 'Very super effective';
    return 'Neutral';
  }

  selectType(type: string): void {
    this.selectedType.set(this.selectedType() === type ? null : type);
  }

  isTypeSelected(type: string): boolean {
    return this.selectedType() === type;
  }

  toggleDefensiveType(type: string): void {
    const current = this.selectedDefensiveTypes();
    if (current.includes(type)) {
      this.selectedDefensiveTypes.set(current.filter(t => t !== type));
    } else if (current.length < 2) {
      this.selectedDefensiveTypes.set([...current, type]);
    }
  }

  isDefensiveTypeSelected(type: string): boolean {
    return this.selectedDefensiveTypes().includes(type);
  }

  clearDefensiveSelection(): void {
    this.selectedDefensiveTypes.set([]);
  }

  calculateDamage(): void {
    const formValue = this.calculatorForm.value;
    const attackingType = formValue.attackingType || 'normal';
    const defendingTypes = formValue.defendingTypes || ['normal'];
    const power = formValue.power || 80;
    const level = formValue.level || 50;

    let effectiveness = 1;
    for (const defType of defendingTypes) {
      effectiveness *= this.getEffectiveness(attackingType, defType);
    }

    const attack = 100;
    const defense = 100;
    const damage = ((2 * level / 5 + 2) * power * attack / defense / 50 + 2) * effectiveness;

    let label = 'Normal damage';
    if (effectiveness === 0) label = 'No effect';
    else if (effectiveness < 1) label = 'Not very effective';
    else if (effectiveness > 1) label = 'Super effective!';

    this.damageResult.set({ damage: Math.round(damage), effectiveness, label });
  }

  setActiveTab(tab: 'chart' | 'calculator'): void {
    this.activeTab.set(tab);
  }

  onCellHover(atkType: string, defType: string): void {
    const eff = this.getEffectiveness(atkType, defType);
    this.hoveredCell.set({
      attackingType: atkType,
      defendingType: defType,
      effectiveness: eff,
      label: this.getHoverLabel(eff)
    });
  }

  onCellLeave(): void {
    this.hoveredCell.set(null);
  }
}
