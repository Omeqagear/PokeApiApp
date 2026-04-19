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
      grid-template-columns: 40px 32px 1fr;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .stat-value {
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      text-align: right;
    }

    .stat-bar-container {
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .stat-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease-out;
      min-width: 4px;
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
    if (v >= 150) return '#ff4081';
    if (v >= 120) return '#ff7043';
    if (v >= 90) return '#ffca28';
    if (v >= 60) return '#66bb6a';
    return '#42a5f5';
  });
}
