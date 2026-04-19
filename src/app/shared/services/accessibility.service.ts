import { Injectable, inject, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.setupRouteAnnouncer();
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    this.ngZone.runOutsideAngular(() => {
      const region = document.createElement('div');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.id = 'a11y-live-region';
      document.body.appendChild(region);
      this.liveRegion = region;
    });
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = '';
    setTimeout(() => {
      this.liveRegion!.textContent = message;
    }, 100);
  }

  private setupRouteAnnouncer(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects || event.url;
      const pageName = this.getPageName(url);
      this.announce(`Navigated to ${pageName} page`);
    });
  }

  private getPageName(url: string): string {
    if (url === '/' || url === '') return 'Home';
    if (url.startsWith('/catalog')) return 'Pokemon Catalog';
    if (url.startsWith('/team')) return 'My Team';
    if (url.startsWith('/photo')) return 'Pokemon Details';
    return url;
  }

  focusElement(selector: string): void {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
    }
  }

  trapFocus(containerSelector: string): void {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }
}
