import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-pokeball-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pokeball-loader" role="status" aria-busy="true" [attr.aria-label]="label || 'Loading'" [style.width.px]="size" [style.height.px]="size">
      <div class="pokeball-top"></div>
      <div class="pokeball-bottom"></div>
      <div class="pokeball-center"></div>
      <div class="pokeball-line"></div>
    </div>
    @if (label) {
      <p class="loading-text">{{ label }}</p>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
    }

    .pokeball-loader {
      position: relative;
      animation: spin 1.2s linear infinite;
    }

    .pokeball-top {
      position: absolute;
      width: 100%;
      height: 50%;
      border-radius: 50% 50% 0 0;
      background: var(--brand-primary, #E8453C);
      top: 0;
      border: 3px solid var(--border-default, #1A1A1A);
      border-bottom: none;
    }

    .pokeball-bottom {
      position: absolute;
      width: 100%;
      height: 50%;
      background: var(--surface-card, #ffffff);
      bottom: 0;
      border-radius: 0 0 50% 50%;
      border: 3px solid var(--border-default, #1A1A1A);
      border-top: none;
    }

    .pokeball-line {
      position: absolute;
      width: 100%;
      height: 3px;
      background: var(--border-default, #1A1A1A);
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }

    .pokeball-center {
      position: absolute;
      width: 28%;
      height: 28%;
      background: var(--surface-card, #ffffff);
      border: 3px solid var(--border-default, #1A1A1A);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      box-shadow: 0 0 0 2px var(--border-default, #1A1A1A);
    }

    .loading-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      color: var(--text-tertiary);
      letter-spacing: 0.05em;
      font-weight: 600;
      text-transform: uppercase;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class PokeballSpinnerComponent {
  @Input() size = 80;
  @Input() label = '';
}
