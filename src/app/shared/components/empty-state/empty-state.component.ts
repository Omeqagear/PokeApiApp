import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state" [class.compact]="compact">
      <div class="empty-icon-wrapper">
        <span class="empty-emoji">{{ icon }}</span>
        <div class="empty-icon-ring"></div>
      </div>

      @if (title) {
        <h3 class="empty-title">{{ title }}</h3>
      }

      @if (message) {
        <p class="empty-message">{{ message }}</p>
      }

      @if (actionLabel && actionRoute) {
        <a [routerLink]="actionRoute" class="btn btn-primary empty-action">
          <span class="btn-icon">{{ actionIcon || '→' }}</span>
          {{ actionLabel }}
        </a>
      }

      @if (secondaryActionLabel && secondaryActionRoute) {
        <a [routerLink]="secondaryActionRoute" class="btn btn-secondary empty-action">
          <span class="btn-icon">{{ secondaryActionIcon || '→' }}</span>
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

        .empty-emoji {
          font-size: 56px;
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
      margin-bottom: 28px;

      .empty-emoji {
        font-size: 72px;
        display: block;
        opacity: 0.7;
      }

      .empty-icon-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 110px;
        height: 110px;
        border: 3px dashed var(--border-default);
        border-radius: 4px;
        opacity: 0.5;
        animation: pulse-ring 3s ease-in-out infinite;
      }
    }

    @keyframes pulse-ring {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1) rotate(0deg);
        opacity: 0.3;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
        opacity: 0.5;
      }
    }

    .empty-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6em;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .empty-message {
      font-size: 1em;
      color: var(--text-secondary);
      margin: 0 0 32px 0;
      line-height: 1.6;
      max-width: 360px;
    }

    .empty-action {
      margin: 8px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 0.9em;
      border-radius: 4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      text-decoration: none;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      border: 3px solid var(--border-default);

      &.btn-primary {
        background: var(--brand-primary);
        color: var(--text-inverse);
        box-shadow: 4px 4px 0px var(--border-default);

        &:focus-visible {
          outline: 3px solid var(--brand-primary);
          outline-offset: 2px;
        }

        &:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--border-default);
        }
      }

      &.btn-secondary {
        background: var(--surface-card);
        color: var(--brand-secondary);
        border-color: var(--brand-secondary);
        box-shadow: 4px 4px 0px var(--border-default);

        &:focus-visible {
          outline: 3px solid var(--brand-primary);
          outline-offset: 2px;
        }

        &:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--border-default);
        }
      }
    }

    @media (max-width: 480px) {
      .empty-state {
        padding: 48px 16px;
      }

      .empty-icon-wrapper .empty-emoji {
        font-size: 56px;
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
  @Input() icon = '🔍';
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
