import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Shortcut {
  keys: string[];
  description: string;
}

@Component({
  selector: 'app-shortcuts-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <mat-icon>keyboard</mat-icon>
              Keyboard Shortcuts
            </h2>
            <button mat-icon-button (click)="close()" aria-label="Close">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="modal-body">
            @for (group of shortcutGroups(); track group.title) {
              <div class="shortcut-group">
                <h3>{{ group.title }}</h3>
                @for (shortcut of group.shortcuts; track shortcut.description) {
                  <div class="shortcut-row">
                    <div class="shortcut-keys">
                      @for (key of shortcut.keys; track key; let last = $last) {
                        <kbd>{{ key }}</kbd>
                        @if (!last) {
                          <span class="key-separator">+</span>
                        }
                      }
                    </div>
                    <span class="shortcut-desc">{{ shortcut.description }}</span>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button mat-flat-button color="primary" (click)="close()">
              Got it!
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 200ms ease;
    }

    .modal-content {
      background: var(--surface-card, #1a1a2e);
      border: 1px solid var(--border, #333);
      border-radius: 16px;
      width: 90%;
      max-width: 560px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
      animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border, #333);

      h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary, #fff);

        mat-icon {
          color: var(--brand-primary, #8b5cf6);
        }
      }
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .shortcut-group {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-tertiary, #737373);
        margin: 0 0 10px 0;
      }
    }

    .shortcut-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
    }

    .shortcut-keys {
      display: flex;
      align-items: center;
      gap: 4px;

      kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary, #fff);
      }

      .key-separator {
        color: var(--text-tertiary, #737373);
        font-size: 0.8rem;
        margin: 0 2px;
      }
    }

    .shortcut-desc {
      font-size: 0.9rem;
      color: var(--text-secondary, #aaa);
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border, #333);
      display: flex;
      justify-content: flex-end;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ShortcutsModalComponent {
  isOpen = signal(false);

  shortcutGroups = signal([
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['←', '→'], description: 'Navigate between Pokémon' },
        { keys: ['Esc'], description: 'Close modals / blur inputs' },
      ] as Shortcut[],
    },
    {
      title: 'Actions',
      shortcuts: [
        { keys: ['S'], description: 'Toggle shiny sprite' },
        { keys: ['F'], description: 'Toggle favorite' },
        { keys: ['T'], description: 'Add to team' },
      ] as Shortcut[],
    },
    {
      title: 'Search',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Focus search' },
        { keys: ['/'], description: 'Quick search' },
      ] as Shortcut[],
    },
    {
      title: 'Help',
      shortcuts: [
        { keys: ['?'], description: 'Show this shortcuts panel' },
      ] as Shortcut[],
    },
  ]);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === '?' && !(event.target instanceof HTMLInputElement)) {
      event.preventDefault();
      this.open();
    }
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }
}
