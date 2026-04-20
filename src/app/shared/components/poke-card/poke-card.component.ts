import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

export interface PokeCardPokemon {
  id: number;
  name: string;
  spriteUrl?: string;
  types?: { type: { name: string } }[];
}

@Component({
  selector: 'ds-poke-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatRippleModule],
  template: `
    <div
      class="poke-card"
      [class.size-sm]="size === 'sm'"
      [class.size-lg]="size === 'lg'"
      [class.clickable]="clickable"
      [style.--type-accent]="getPrimaryTypeColor()"
      (click)="cardClick.emit()"
      (keydown.enter)="cardClick.emit()"
      (keydown.space)="cardClick.emit(); $event.preventDefault()"
      [tabindex]="clickable ? 0 : null"
      role="article"
      [attr.aria-label]="pokemon.name | titlecase"
    >
      <div class="card-badge">#{{ pokemon.id | number: '3.0-0' }}</div>

      <div class="card-image-wrapper">
        <img
          [src]="getSpriteUrl()"
          [alt]="pokemon.name | titlecase"
          [attr.aria-label]="pokemon.name | titlecase"
          loading="lazy"
          (error)="onImageError($event)"
        />
      </div>

      <div class="card-content">
        <h3 class="pokeName">{{ pokemon.name }}</h3>
        <div class="card-actions" (click)="$event.stopPropagation()">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      @if (showTypes && pokemon.types) {
        <div class="card-types" [attr.aria-label]="pokemon.name | titlecase">
          @for (typeEntry of pokemon.types; track typeEntry.type.name) {
            <span class="type-pill" [class]="'type-' + typeEntry.type.name">
              {{ typeEntry.type.name | titlecase }}
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .poke-card {
      border-radius: 12px;
      overflow: hidden;
      background: var(--surface-card, #ffffff);
      border: 0.5px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
      position: relative;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--type-accent, #a8a878);
        transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.clickable {
        cursor: pointer;
      }

      &.clickable:hover {
        border-color: var(--type-accent, rgba(168, 168, 120, 0.3));
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

        &::before {
          width: 4px;
        }

        .card-image-wrapper img {
          transform: scale(1.05);
        }
      }

      &.size-sm {
        .card-image-wrapper {
          height: 150px;
          img { width: 110px; height: 110px; }
        }
        .card-badge { font-size: 0.7em; padding: 3px 6px; }
        .pokeName { font-size: 0.9em; }
      }

      &.size-lg {
        .card-image-wrapper {
          height: 240px;
          img { width: 180px; height: 180px; }
        }
      }
    }

    .card-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--type-accent, #8b5cf6);
      color: var(--text-inverse, #ffffff);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75em;
      font-weight: 600;
      z-index: 2;
      letter-spacing: 0.02em;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .card-image-wrapper {
      width: 100%;
      height: 180px;
      background: var(--bg-secondary, #fafafa);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;

      img {
        width: 120px;
        height: 120px;
        object-fit: contain;
        transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
      }
    }

    .card-content {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;

      .pokeName {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--text-primary, #171717);
        text-transform: capitalize;
        margin: 0;
        letter-spacing: 0.01em;
      }

      .card-actions {
        display: flex;
        gap: 6px;

        ::ng-deep button {
          transition: all 150ms;
          &:hover { transform: scale(1.08); }
        }
      }
    }

    .card-types {
      padding: 0 16px 14px;
      display: flex;
      gap: 6px;

      .type-pill {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.7em;
        font-weight: 600;
        text-transform: capitalize;
        letter-spacing: 0.03em;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 0.5px solid rgba(0, 0, 0, 0.05);
      }

      .type-normal { background: rgba(168, 168, 120, 0.15); color: #A8A878; }
      .type-fire { background: rgba(240, 128, 48, 0.18); color: #F08030; }
      .type-water { background: rgba(104, 144, 240, 0.18); color: #6890F0; }
      .type-electric { background: rgba(248, 208, 48, 0.18); color: #F8D030; }
      .type-grass { background: rgba(120, 200, 80, 0.18); color: #78C850; }
      .type-ice { background: rgba(152, 216, 216, 0.18); color: #98D8D8; }
      .type-fighting { background: rgba(192, 48, 40, 0.18); color: #C03028; }
      .type-poison { background: rgba(160, 64, 160, 0.18); color: #A040A0; }
      .type-ground { background: rgba(224, 192, 104, 0.18); color: #E0C068; }
      .type-flying { background: rgba(168, 144, 240, 0.18); color: #A890F0; }
      .type-psychic { background: rgba(248, 88, 136, 0.18); color: #F85888; }
      .type-bug { background: rgba(168, 184, 32, 0.18); color: #A8B820; }
      .type-rock { background: rgba(184, 160, 56, 0.18); color: #B8A038; }
      .type-ghost { background: rgba(112, 88, 152, 0.18); color: #705898; }
      .type-dragon { background: rgba(112, 56, 248, 0.18); color: #7038F8; }
      .type-dark { background: rgba(112, 88, 72, 0.18); color: #705848; }
      .type-steel { background: rgba(184, 184, 208, 0.18); color: #B8B8D0; }
      .type-fairy { background: rgba(238, 153, 172, 0.18); color: #EE99AC; }
    }
  `]
})
export class PokeCardComponent {
  @Input({ required: true }) pokemon!: PokeCardPokemon;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable = true;
  @Input() showTypes = false;
  @Output() cardClick = new EventEmitter<void>();

  getSpriteUrl(): string {
    const p = this.pokemon;
    return p.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
  }

  getPrimaryTypeColor(): string {
    if (this.pokemon.types && this.pokemon.types.length > 0) {
      const typeName = this.pokemon.types[0].type.name;
      const typeColors: Record<string, string> = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
      };
      return typeColors[typeName] || '#8b5cf6';
    }
    return '#8b5cf6';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg';
    }
  }
}
