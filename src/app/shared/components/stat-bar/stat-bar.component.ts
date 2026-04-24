import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-stat-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-row">
      <span class="stat-label">{{ shortLabel() }}</span>
      @if (showValue) {
        <span class="stat-value">{{ value }}</span>
      }
      <div class="stat-bar-container">
        <div
          class="stat-bar"
          [style.width.%]="percentage()"
          [style.background]="barColor()"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .stat-row {
      display: grid;
      grid-template-columns: 48px 40px 1fr;
      align-items: center;
      gap: 12px;
    }

    .stat-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stat-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .stat-bar-container {
      height: 14px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      border: 2px solid var(--border-default);
    }

    .stat-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 4px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%);
      }
    }
  `]
})
export class StatBarComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input() maxValue = 255;
  @Input() showValue = true;

  private shortNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'SPA',
    'special-defense': 'SPD',
    'speed': 'SPE'
  };

  shortLabel = computed(() => this.shortNames[this.label] || this.label);

  percentage = computed(() => Math.min((this.value / this.maxValue) * 100, 100));

  barColor = computed(() => {
    const v = this.value;
    if (v >= 150) return '#E8453C';
    if (v >= 120) return '#F06058';
    if (v >= 90) return '#F5C842';
    if (v >= 60) return '#78C850';
    return '#5B6ABF';
  });
}
