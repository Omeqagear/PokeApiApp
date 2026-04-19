import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" [class.size-sm]="size === 'sm'" [class.size-lg]="size === 'lg'">
      <div class="skeleton-badge"></div>
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-name"></div>
      </div>
      @if (showTypes) {
        <div class="skeleton-types">
          <div class="skeleton-type"></div>
          <div class="skeleton-type"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-card {
      border-radius: 12px;
      overflow: hidden;
      background: var(--surface-card, #ffffff);
      border: 0.5px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--border-subtle, rgba(0, 0, 0, 0.08));
      }
    }

    .skeleton-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 50px;
      height: 22px;
      border-radius: 6px;
      background: linear-gradient(90deg, var(--gray-100, #f4f4f4) 25%, var(--gray-200, #e4e4e4) 50%, var(--gray-100, #f4f4f4) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      z-index: 2;
    }

    .skeleton-image {
      width: 100%;
      height: 180px;
      background: linear-gradient(90deg, var(--gray-100, #f4f4f4) 25%, var(--gray-200, #e4e4e4) 50%, var(--gray-100, #f4f4f4) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .skeleton-content {
      padding: 14px 16px;

      .skeleton-name {
        width: 60%;
        height: 16px;
        border-radius: 4px;
        background: linear-gradient(90deg, var(--gray-100, #f4f4f4) 25%, var(--gray-200, #e4e4e4) 50%, var(--gray-100, #f4f4f4) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    }

    .skeleton-types {
      padding: 0 16px 14px;
      display: flex;
      gap: 6px;

      .skeleton-type {
        width: 60px;
        height: 22px;
        border-radius: 20px;
        background: linear-gradient(90deg, var(--gray-100, #f4f4f4) 25%, var(--gray-200, #e4e4e4) 50%, var(--gray-100, #f4f4f4) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    }

    .size-sm {
      .skeleton-image {
        height: 150px;
      }
    }

    .size-lg {
      .skeleton-image {
        height: 240px;
      }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class SkeletonCardComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showTypes = false;
}