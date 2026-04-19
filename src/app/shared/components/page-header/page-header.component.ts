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
    }

    .header-content {
      margin-bottom: 20px;
    }

    .header-title {
      font-size: 2.5em;
      font-weight: 700;
      margin: 0 0 20px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      font-size: 1.1em;
      color: #666;
      margin: 0;
    }

    .header-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #666;
      font-size: 1.1em;
      font-weight: 500;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showStats = false;
}
