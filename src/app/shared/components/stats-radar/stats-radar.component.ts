import { Component, Input, computed, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface StatPoint {
  label: string;
  value: number;
  maxValue: number;
}

@Component({
  selector: 'app-stats-radar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="radar-container">
      <div class="radar-header">
        <h3 class="radar-title">
          <mat-icon>radar</mat-icon>
          Stat Distribution
        </h3>
        <span class="radar-total">Total: {{ totalStats() }}</span>
      </div>
      <div class="radar-canvas-wrapper">
        <canvas #radarCanvas [width]="size" [height]="size"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .radar-container {
      background: var(--glass-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-default);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-top: 1rem;
    }

    .radar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      .radar-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;

        mat-icon {
          color: var(--brand-primary);
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .radar-total {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--brand-primary);
        background: var(--glass-surface);
        padding: 4px 12px;
        border-radius: 10px;
        border: 1px solid var(--border-default);
      }
    }

    .radar-canvas-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class StatsRadarComponent implements AfterViewInit, OnChanges {
  @Input() stats: { name: string; value: number }[] = [];
  @Input() size = 280;

  @ViewChild('radarCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private shortNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'SPA',
    'special-defense': 'SPD',
    'speed': 'SPE'
  };

  statPoints = computed<StatPoint[]>(() =>
    this.stats.map(s => ({
      label: this.shortNames[s.name] || s.name,
      value: s.value,
      maxValue: 255
    }))
  );

  totalStats = computed(() => this.stats.reduce((sum, s) => sum + s.value, 0));

  ngAfterViewInit(): void {
    this.drawRadar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.canvasRef) {
      this.drawRadar();
    }
  }

  private drawRadar(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = this.statPoints();
    if (points.length === 0) return;

    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.classList.contains('dark-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const labelColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.55)';
    const valueColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)';
    const accentColor = styles.getPropertyValue('--brand-primary').trim() || '#E8453C';
    const dotStrokeColor = isDark ? '#fff' : '#1a1c2e';

    const width = this.size;
    const height = this.size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const levels = 5;

    ctx.clearRect(0, 0, width, height);

    const angleStep = (Math.PI * 2) / points.length;

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i <= points.length; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < points.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    for (let i = 0; i <= points.length; i++) {
      const idx = i % points.length;
      const angle = angleStep * idx - Math.PI / 2;
      const valueRatio = Math.min(points[idx].value / points[idx].maxValue, 1);
      const pointRadius = radius * valueRatio;
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, isDark ? 'rgba(232, 69, 60, 0.3)' : 'rgba(232, 69, 60, 0.15)');
    gradient.addColorStop(1, isDark ? 'rgba(232, 69, 60, 0.1)' : 'rgba(232, 69, 60, 0.04)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = isDark ? 'rgba(232, 69, 60, 0.8)' : 'rgba(232, 69, 60, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < points.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const valueRatio = Math.min(points[i].value / points[i].maxValue, 1);
      const pointRadius = radius * valueRatio;
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = dotStrokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.font = '600 11px Segoe UI, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < points.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const labelRadius = radius + 24;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      ctx.fillStyle = labelColor;
      ctx.fillText(points[i].label, x, y);

      const valueX = centerX + (radius * 0.5) * Math.cos(angle);
      const valueY = centerY + (radius * 0.5) * Math.sin(angle);
      ctx.fillStyle = valueColor;
      ctx.font = '500 10px Segoe UI, system-ui, sans-serif';
      ctx.fillText(points[i].value.toString(), valueX, valueY);
      ctx.font = '600 11px Segoe UI, system-ui, sans-serif';
    }
  }
}
