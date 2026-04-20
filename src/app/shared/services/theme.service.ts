import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'pokedex-theme';

  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const isDark = this.theme() === 'dark';
        document.documentElement.classList.toggle('dark-theme', isDark);
        try {
          localStorage.setItem(this.STORAGE_KEY, this.theme());
        } catch {
          // localStorage may be unavailable
        }
      }
    });
  }

  private getInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // localStorage may be unavailable
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
