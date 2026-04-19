import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      @if (title) {
        <h3>{{ title }}</h3>
      }
      @if (message) {
        <p>{{ message }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
      text-align: center;
    }

    mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 1.5em;
      color: #1a1a2e;
      margin: 0 0 10px 0;
    }

    p {
      font-size: 1.1em;
      margin: 0;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'search_off';
  @Input() title = '';
  @Input() message = '';
}
