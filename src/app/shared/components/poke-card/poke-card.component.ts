import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PokeCardPokemon {
  id: number;
  name: string;
  spriteUrl?: string;
  types?: { type: { name: string } }[];
}

@Component({
  selector: 'ds-poke-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poke-card.component.html',
  styleUrls: ['./poke-card.component.scss']
})
export class PokeCardComponent {
  @Input({ required: true }) pokemon!: PokeCardPokemon;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable = true;
  @Input() showTypes = false;
  @Output() cardClick = new EventEmitter<void>();

  getTypeClasses(typeEntry: { type: { name: string } }): string {
    return `type-pill type-${typeEntry.type.name}`;
  }

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
