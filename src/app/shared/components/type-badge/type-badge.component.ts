import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="type-badge"
      [class]="'type-' + type"
      [class.size-sm]="size === 'sm'"
      [class.size-lg]="size === 'lg'"
      [class.variant-solid]="variant === 'solid'"
      [class.variant-outline]="variant === 'outline'"
      [class.variant-ghost]="variant === 'ghost'"
    >
      {{ type | titlecase }}
    </span>
  `,
  styles: [`
    .type-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.025em;
      transition: all 200ms ease-out;
      white-space: nowrap;
    }

    .size-sm {
      padding: 0.2rem 0.6rem;
      font-size: 0.7rem;
    }

    .size-lg {
      padding: 0.5rem 1.2rem;
      font-size: 0.95rem;
    }

    .variant-solid {
      color: #fff;
      border: 2px solid transparent;
    }

    .variant-outline {
      background: transparent;
      border: 2px solid;
    }

    .variant-ghost {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: inherit;
    }

    .type-normal.variant-solid { background: #A8A878; }
    .type-fire.variant-solid { background: #F08030; }
    .type-water.variant-solid { background: #6890F0; }
    .type-electric.variant-solid { background: #F8D030; color: #1a202c; }
    .type-grass.variant-solid { background: #78C850; }
    .type-ice.variant-solid { background: #98D8D8; color: #1a202c; }
    .type-fighting.variant-solid { background: #C03028; }
    .type-poison.variant-solid { background: #A040A0; }
    .type-ground.variant-solid { background: #E0C068; color: #1a202c; }
    .type-flying.variant-solid { background: #A890F0; }
    .type-psychic.variant-solid { background: #F85888; }
    .type-bug.variant-solid { background: #A8B820; }
    .type-rock.variant-solid { background: #B8A038; }
    .type-ghost.variant-solid { background: #705898; }
    .type-dragon.variant-solid { background: #7038F8; }
    .type-dark.variant-solid { background: #705848; }
    .type-steel.variant-solid { background: #B8B8D0; color: #1a202c; }
    .type-fairy.variant-solid { background: #EE99AC; }

    .type-normal.variant-outline { border-color: #A8A878; color: #A8A878; }
    .type-fire.variant-outline { border-color: #F08030; color: #F08030; }
    .type-water.variant-outline { border-color: #6890F0; color: #6890F0; }
    .type-electric.variant-outline { border-color: #F8D030; color: #F8D030; }
    .type-grass.variant-outline { border-color: #78C850; color: #78C850; }
    .type-ice.variant-outline { border-color: #98D8D8; color: #98D8D8; }
    .type-fighting.variant-outline { border-color: #C03028; color: #C03028; }
    .type-poison.variant-outline { border-color: #A040A0; color: #A040A0; }
    .type-ground.variant-outline { border-color: #E0C068; color: #E0C068; }
    .type-flying.variant-outline { border-color: #A890F0; color: #A890F0; }
    .type-psychic.variant-outline { border-color: #F85888; color: #F85888; }
    .type-bug.variant-outline { border-color: #A8B820; color: #A8B820; }
    .type-rock.variant-outline { border-color: #B8A038; color: #B8A038; }
    .type-ghost.variant-outline { border-color: #705898; color: #705898; }
    .type-dragon.variant-outline { border-color: #7038F8; color: #7038F8; }
    .type-dark.variant-outline { border-color: #705848; color: #705848; }
    .type-steel.variant-outline { border-color: #B8B8D0; color: #B8B8D0; }
    .type-fairy.variant-outline { border-color: #EE99AC; color: #EE99AC; }
  `]
})
export class TypeBadgeComponent {
  @Input({ required: true }) type!: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
}
