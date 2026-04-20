import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-pokeball-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pokeball-loader" [style.width.px]="size" [style.height.px]="size">
      <div class="pokeball-top"></div>
      <div class="pokeball-bottom"></div>
      <div class="pokeball-center"></div>
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
      animation: spin 1s linear infinite;
    }

    .pokeball-top,
    .pokeball-bottom {
      position: absolute;
      width: 100%;
      height: 50%;
      border-radius: 50% 50% 0 0;
    }

    .pokeball-top {
      background: #ff1744;
      top: 0;
    }

    .pokeball-bottom {
      background: #fff;
      bottom: 0;
      border-radius: 0 0 50% 50%;
    }

    .pokeball-center {
      position: absolute;
      width: 25%;
      height: 25%;
      background: #fff;
      border: 4px solid #333;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }

    .loading-text {
      font-size: 1.1rem;
      color: #888;
      letter-spacing: 0.5px;
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
