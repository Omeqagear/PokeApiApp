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
      margin-bottom: 48px;
      padding: 0 20px;
      position: relative;
    }

    .header-content {
      margin-bottom: 28px;
    }

    .header-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1.75rem, 5vw, 2.75rem);
      font-weight: 900;
      margin: 0 0 16px 0;
      background: var(--gradient-brand);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.03em;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .header-subtitle {
      font-size: 1.05em;
      color: var(--text-tertiary);
      margin: 0;
      line-height: 1.5;
      font-weight: 500;
    }

    .header-stats {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      background: var(--surface-card);
      border: 3px solid var(--border-default);
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 0.95em;
      font-weight: 600;
      box-shadow: 4px 4px 0px var(--border-default);
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showStats = false;
}
