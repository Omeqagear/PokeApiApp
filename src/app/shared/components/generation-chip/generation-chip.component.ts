import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-generation-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="gen-chip"
      [class.active]="active"
      [style.--gen-color]="color"
      [attr.aria-pressed]="active"
      (click)="clicked.emit()"
    >
      <span class="gen-name">{{ name }}</span>
      @if (region) {
        <span class="gen-region">{{ region }}</span>
      }
    </button>
  `,
  styles: [`
    .gen-chip {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      border: 1.5px solid transparent;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      line-height: 1.2;
      min-width: 68px;
      background: var(--surface-card, #ffffff);
      cursor: pointer;
      color: var(--text-secondary, #525252);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

      .gen-name {
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .gen-region {
        font-size: 0.7em;
        font-weight: 400;
        opacity: 0.7;
      }

      &.active {
        background: var(--gen-color, #667eea);
        border-color: var(--gen-color, #667eea);
        color: #ffffff;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--gen-color, #667eea) 35%, transparent);
        transform: translateY(-1px);

        .gen-region {
          opacity: 0.9;
        }
      }

      &:not(.active):hover {
        border-color: var(--gen-color, #667eea);
        color: var(--gen-color, #667eea);
        background: color-mix(in srgb, var(--gen-color, #667eea) 8%, transparent);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transform: translateY(-1px);
      }
    }
  `]
})
export class GenerationChipComponent {
  @Input({ required: true }) name!: string;
  @Input() region = '';
  @Input() color = '#667eea';
  @Input() active = false;
  @Output() clicked = new EventEmitter<void>();
}
