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
      padding: 8px 18px;
      border-radius: 24px;
      font-size: 0.9em;
      font-weight: 600;
      border-width: 2px;
      border-style: solid;
      transition: all 200ms ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      line-height: 1.1;
      min-width: 70px;
      background: transparent;
      cursor: pointer;
      border-color: transparent;
      color: inherit;

      &.active {
        background: var(--gen-color, #667eea);
        border-color: var(--gen-color, #667eea);
        color: #fff;
        box-shadow: 0 2px 12px color-mix(in srgb, var(--gen-color, #667eea) 40%, transparent);

        .gen-region {
          opacity: 0.9;
        }
      }

      &:not(.active):hover {
        border-color: #667eea;
        color: #667eea;
        background: rgba(102, 126, 234, 0.05);
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
