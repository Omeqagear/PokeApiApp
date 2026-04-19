import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state" [class.compact]="compact">
      <div class="empty-icon-wrapper">
        <mat-icon class="empty-icon">{{ icon }}</mat-icon>
        <div class="empty-icon-ring"></div>
      </div>

      @if (title) {
        <h3 class="empty-title">{{ title }}</h3>
      }

      @if (message) {
        <p class="empty-message">{{ message }}</p>
      }

      @if (actionLabel && actionRoute) {
        <a [routerLink]="actionRoute" mat-flat-button color="primary" class="empty-action">
          <mat-icon>{{ actionIcon || 'arrow_forward' }}</mat-icon>
          {{ actionLabel }}
        </a>
      }

      @if (secondaryActionLabel && secondaryActionRoute) {
        <a [routerLink]="secondaryActionRoute" mat-stroked-button class="empty-action secondary">
          <mat-icon>{{ secondaryActionIcon || 'arrow_forward' }}</mat-icon>
          {{ secondaryActionLabel }}
        </a>
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
      padding: 80px 24px;
      text-align: center;
      max-width: 480px;
      margin: 0 auto;

      &.compact {
        padding: 40px 20px;

        .empty-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
        }

        .empty-title {
          font-size: 1.2em;
        }

        .empty-message {
          font-size: 0.95em;
        }
      }
    }

    .empty-icon-wrapper {
      position: relative;
      margin-bottom: 24px;

      .empty-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: var(--text-tertiary, #737373);
        opacity: 0.6;
      }

      .empty-icon-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border: 2px dashed var(--border-subtle, #e4e4e4);
        border-radius: 50%;
        opacity: 0.5;
        animation: pulse-ring 3s ease-in-out infinite;
      }
    }

    @keyframes pulse-ring {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.3;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 0.5;
      }
    }

    .empty-title {
      font-size: 1.5em;
      font-weight: 600;
      color: var(--text-primary, #171717);
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }

    .empty-message {
      font-size: 1em;
      color: var(--text-secondary, #525252);
      margin: 0 0 28px 0;
      line-height: 1.6;
      max-width: 360px;
    }

    .empty-action {
      margin: 6px;
      border-radius: 10px !important;

      mat-icon {
        margin-right: 8px;
      }

      &.secondary {
        border-color: var(--border-default, #d3d3d3);
        color: var(--text-secondary, #525252);
      }
    }

    @media (max-width: 480px) {
      .empty-state {
        padding: 48px 16px;
      }

      .empty-icon-wrapper .empty-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
      }

      .empty-title {
        font-size: 1.25em;
      }

      .empty-action {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'search_off';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionRoute = '';
  @Input() actionIcon = '';
  @Input() secondaryActionLabel = '';
  @Input() secondaryActionRoute = '';
  @Input() secondaryActionIcon = '';
  @Input() compact = false;
}