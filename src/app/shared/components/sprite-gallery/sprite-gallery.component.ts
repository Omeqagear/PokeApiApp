import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface SpriteVariant {
  name: string;
  url: string;
  label: string;
}

@Component({
  selector: 'app-sprite-gallery',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    @if (sprites().length > 0) {
      <div class="sprite-gallery">
        <div class="gallery-header">
          <h3 class="gallery-title">
            <mat-icon>image</mat-icon>
            Sprite Gallery
          </h3>
          <span class="gallery-count">{{ sprites().length }} variants</span>
        </div>
        <div class="gallery-grid">
          @for (sprite of sprites(); track sprite.name) {
            <div class="sprite-item" [matTooltip]="sprite.label">
              <div class="sprite-frame">
                <img
                  [src]="sprite.url"
                  [alt]="sprite.label"
                  loading="lazy"
                  (error)="onImageError($event)"
                />
              </div>
              <span class="sprite-label">{{ sprite.label }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .sprite-gallery {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-top: 1rem;
    }

    .gallery-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      .gallery-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary, #fff);
        margin: 0;

        mat-icon {
          color: var(--brand-primary, #8b5cf6);
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .gallery-count {
        font-size: 0.75rem;
        color: var(--text-tertiary, #737373);
        background: rgba(255, 255, 255, 0.06);
        padding: 2px 10px;
        border-radius: 10px;
      }
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .sprite-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: transform 200ms ease;

      &:hover {
        transform: scale(1.08);

        .sprite-frame {
          border-color: var(--brand-primary, #8b5cf6);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }
      }
    }

    .sprite-frame {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      transition: all 200ms ease;

      img {
        width: 64px;
        height: 64px;
        object-fit: contain;
        image-rendering: pixelated;
      }
    }

    .sprite-label {
      font-size: 0.65rem;
      color: var(--text-tertiary, #737373);
      text-align: center;
      line-height: 1.3;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
      }

      .sprite-frame {
        width: 64px;
        height: 64px;

        img {
          width: 52px;
          height: 52px;
        }
      }
    }
  `]
})
export class SpriteGalleryComponent implements OnChanges {
  @Input() pokemonId = 0;
  @Input() isShiny = false;

  sprites = signal<SpriteVariant[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemonId'] || changes['isShiny']) {
      this.loadSprites();
    }
  }

  private loadSprites(): void {
    if (!this.pokemonId) return;

    const id = this.pokemonId;
    const prefix = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
    const variants: SpriteVariant[] = [];

    const normalSprites = [
      { url: `${prefix}/${id}.png`, label: 'Front' },
      { url: `${prefix}/back/${id}.png`, label: 'Back' },
      { url: `${prefix}/other/official-artwork/${id}.png`, label: 'Official Artwork' },
      { url: `${prefix}/other/dream-world/${id}.svg`, label: 'Dream World' },
      { url: `${prefix}/other/home/${id}.png`, label: 'Home' },
    ];

    const shinyPrefix = this.isShiny ? '/shiny' : '';
    const shinySprites = [
      { url: `${prefix}${shinyPrefix}/${id}.png`, label: this.isShiny ? 'Shiny Front' : 'Normal Front' },
      { url: `${prefix}${shinyPrefix}/back/${id}.png`, label: this.isShiny ? 'Shiny Back' : 'Normal Back' },
      { url: `${prefix}/other/official-artwork${shinyPrefix}/${id}.png`, label: this.isShiny ? 'Shiny Artwork' : 'Normal Artwork' },
    ];

    const allSprites = [...normalSprites, ...shinySprites];

    allSprites.forEach(s => {
      variants.push({
        name: s.label.toLowerCase().replace(/\s+/g, '-'),
        url: s.url,
        label: s.label,
      });
    });

    this.sprites.set(variants);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
