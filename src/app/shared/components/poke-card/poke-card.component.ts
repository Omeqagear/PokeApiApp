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
      border-radius: 8px;
      overflow: hidden;
      background: var(--surface-card, #ffffff);
      border: 1px solid var(--border-subtle, #e4e4e4);
      position: relative;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

      &.clickable {
        cursor: pointer;
      }

      &.clickable:hover {
        border-color: var(--border-default, #d3d3d3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);

        .card-image-wrapper img {
          transform: scale(1.08);
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
      background: var(--brand-primary, #8b5cf6);
      color: var(--text-inverse, #ffffff);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75em;
      font-weight: 500;
      z-index: 1;
      letter-spacing: 0.02em;
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
        transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    }

    .card-content {
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;

      .pokeName {
        font-size: 0.875em;
        font-weight: 500;
        color: var(--text-primary, #171717);
        text-transform: capitalize;
        margin: 0;
        letter-spacing: 0.01em;
      }

      .card-actions {
        display: flex;
        gap: 4px;

        ::ng-deep button {
          transition: transform 150ms;
          &:hover { transform: scale(1.05); }
        }
      }
    }

    .card-types {
      padding: 0 12px 12px;
      display: flex;
      gap: 6px;
      background: var(--surface-card, #ffffff);

      .type-pill {
        padding: 3px 10px;
        border-radius: 4px;
        font-size: 0.7em;
        font-weight: 500;
        text-transform: capitalize;
        background: var(--type-bg, rgba(168, 168, 120, 0.15));
        color: var(--type-color, #A8A878);
      }

      .type-normal { background: rgba(168, 168, 120, 0.15); color: #A8A878; }
      .type-fire { background: rgba(240, 128, 48, 0.15); color: #F08030; }
      .type-water { background: rgba(104, 144, 240, 0.15); color: #6890F0; }
      .type-electric { background: rgba(248, 208, 48, 0.15); color: #F8D030; }
      .type-grass { background: rgba(120, 200, 80, 0.15); color: #78C850; }
      .type-ice { background: rgba(152, 216, 216, 0.15); color: #98D8D8; }
      .type-fighting { background: rgba(192, 48, 40, 0.15); color: #C03028; }
      .type-poison { background: rgba(160, 64, 160, 0.15); color: #A040A0; }
      .type-ground { background: rgba(224, 192, 104, 0.15); color: #E0C068; }
      .type-flying { background: rgba(168, 144, 240, 0.15); color: #A890F0; }
      .type-psychic { background: rgba(248, 88, 136, 0.15); color: #F85888; }
      .type-bug { background: rgba(168, 184, 32, 0.15); color: #A8B820; }
      .type-rock { background: rgba(184, 160, 56, 0.15); color: #B8A038; }
      .type-ghost { background: rgba(112, 88, 152, 0.15); color: #705898; }
      .type-dragon { background: rgba(112, 56, 248, 0.15); color: #7038F8; }
      .type-dark { background: rgba(112, 88, 72, 0.15); color: #705848; }
      .type-steel { background: rgba(184, 184, 208, 0.15); color: #B8B8D0; }
      .type-fairy { background: rgba(238, 153, 172, 0.15); color: #EE99AC; }
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

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg';
    }
  }
}
