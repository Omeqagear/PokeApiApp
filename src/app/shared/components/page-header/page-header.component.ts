import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        @if (title) {
          <h1 class="header-title">{{ title }}</h1>
        }
        @if (subtitle) {
          <p class="header-subtitle">{{ subtitle }}</p>
        }
      </div>
      @if (showStats) {
        <div class="header-stats">
          <ng-content select="[stats]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .page-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 0 20px;
    }

    .header-content {
      margin-bottom: 24px;
    }

    .header-title {
      font-size: 2.5em;
      font-weight: 700;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, var(--brand-primary, #8b5cf6) 0%, var(--brand-secondary, #6366f1) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }

    .header-subtitle {
      font-size: 1.05em;
      color: var(--text-tertiary, #737373);
      margin: 0;
      line-height: 1.5;
    }

    .header-stats {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: var(--surface-card, #ffffff);
      border: 0.5px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
      border-radius: 12px;
      color: var(--text-secondary, #525252);
      font-size: 0.95em;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showStats = false;
}
