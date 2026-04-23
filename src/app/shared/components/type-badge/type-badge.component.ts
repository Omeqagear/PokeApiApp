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
      padding: 0.4rem 1rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: capitalize;
      letter-spacing: 0.03em;
      transition: all 150ms ease-out;
      white-space: nowrap;
      border: 2px solid;
    }

    .size-sm {
      padding: 0.25rem 0.7rem;
      font-size: 0.7rem;
    }

    .size-lg {
      padding: 0.55rem 1.4rem;
      font-size: 0.95rem;
    }

    .variant-solid {
      color: #fff;
      box-shadow: 2px 2px 0px;
    }

    .variant-outline {
      background: transparent;
      box-shadow: 2px 2px 0px;
    }

    .variant-ghost {
      background: var(--type-bg-normal, rgba(168, 168, 120, 0.15));
      border: 2px solid rgba(128, 128, 128, 0.3);
      color: var(--text-primary);
      box-shadow: none;
    }

    .type-normal.variant-solid { background: #A8A878; border-color: #8A8A58; box-shadow: 2px 2px 0px #8A8A58; }
    .type-fire.variant-solid { background: #F08030; border-color: #D06010; box-shadow: 2px 2px 0px #D06010; }
    .type-water.variant-solid { background: #6890F0; border-color: #4870D0; box-shadow: 2px 2px 0px #4870D0; }
    .type-electric.variant-solid { background: #F8D030; color: #1a202c; border-color: #D8B010; box-shadow: 2px 2px 0px #D8B010; }
    .type-grass.variant-solid { background: #78C850; border-color: #58A830; box-shadow: 2px 2px 0px #58A830; }
    .type-ice.variant-solid { background: #98D8D8; color: #1a202c; border-color: #78B8B8; box-shadow: 2px 2px 0px #78B8B8; }
    .type-fighting.variant-solid { background: #C03028; border-color: #A01008; box-shadow: 2px 2px 0px #A01008; }
    .type-poison.variant-solid { background: #A040A0; border-color: #802080; box-shadow: 2px 2px 0px #802080; }
    .type-ground.variant-solid { background: #E0C068; color: #1a202c; border-color: #C0A048; box-shadow: 2px 2px 0px #C0A048; }
    .type-flying.variant-solid { background: #A890F0; border-color: #8870D0; box-shadow: 2px 2px 0px #8870D0; }
    .type-psychic.variant-solid { background: #F85888; border-color: #D83868; box-shadow: 2px 2px 0px #D83868; }
    .type-bug.variant-solid { background: #A8B820; border-color: #889800; box-shadow: 2px 2px 0px #889800; }
    .type-rock.variant-solid { background: #B8A038; border-color: #988018; box-shadow: 2px 2px 0px #988018; }
    .type-ghost.variant-solid { background: #705898; border-color: #503878; box-shadow: 2px 2px 0px #503878; }
    .type-dragon.variant-solid { background: #7038F8; border-color: #5018D8; box-shadow: 2px 2px 0px #5018D8; }
    .type-dark.variant-solid { background: #705848; border-color: #503828; box-shadow: 2px 2px 0px #503828; }
    .type-steel.variant-solid { background: #B8B8D0; color: #1a202c; border-color: #9898B0; box-shadow: 2px 2px 0px #9898B0; }
    .type-fairy.variant-solid { background: #EE99AC; border-color: #CE798C; box-shadow: 2px 2px 0px #CE798C; }

    .type-normal.variant-outline { border-color: #A8A878; color: #A8A878; box-shadow: 2px 2px 0px #A8A878; }
    .type-fire.variant-outline { border-color: #F08030; color: #F08030; box-shadow: 2px 2px 0px #F08030; }
    .type-water.variant-outline { border-color: #6890F0; color: #6890F0; box-shadow: 2px 2px 0px #6890F0; }
    .type-electric.variant-outline { border-color: #F8D030; color: #F8D030; box-shadow: 2px 2px 0px #F8D030; }
    .type-grass.variant-outline { border-color: #78C850; color: #78C850; box-shadow: 2px 2px 0px #78C850; }
    .type-ice.variant-outline { border-color: #98D8D8; color: #98D8D8; box-shadow: 2px 2px 0px #98D8D8; }
    .type-fighting.variant-outline { border-color: #C03028; color: #C03028; box-shadow: 2px 2px 0px #C03028; }
    .type-poison.variant-outline { border-color: #A040A0; color: #A040A0; box-shadow: 2px 2px 0px #A040A0; }
    .type-ground.variant-outline { border-color: #E0C068; color: #E0C068; box-shadow: 2px 2px 0px #E0C068; }
    .type-flying.variant-outline { border-color: #A890F0; color: #A890F0; box-shadow: 2px 2px 0px #A890F0; }
    .type-psychic.variant-outline { border-color: #F85888; color: #F85888; box-shadow: 2px 2px 0px #F85888; }
    .type-bug.variant-outline { border-color: #A8B820; color: #A8B820; box-shadow: 2px 2px 0px #A8B820; }
    .type-rock.variant-outline { border-color: #B8A038; color: #B8A038; box-shadow: 2px 2px 0px #B8A038; }
    .type-ghost.variant-outline { border-color: #705898; color: #705898; box-shadow: 2px 2px 0px #705898; }
    .type-dragon.variant-outline { border-color: #7038F8; color: #7038F8; box-shadow: 2px 2px 0px #7038F8; }
    .type-dark.variant-outline { border-color: #705848; color: #705848; box-shadow: 2px 2px 0px #705848; }
    .type-steel.variant-outline { border-color: #B8B8D0; color: #B8B8D0; box-shadow: 2px 2px 0px #B8B8D0; }
    .type-fairy.variant-outline { border-color: #EE99AC; color: #EE99AC; box-shadow: 2px 2px 0px #EE99AC; }
  `]
})
export class TypeBadgeComponent {
  @Input({ required: true }) type!: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
}
