import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../shared/services/theme.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatRippleModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  currentUrl = signal('/');
  isCollapsed = signal(false);
  isDark = this.themeService.theme;

  navItems: NavItem[] = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/catalog', icon: 'grid_view', label: 'Catalog' },
    { path: '/team', icon: 'groups', label: 'My Team' }
  ];

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
    });
  }

  isActive(route: string): boolean {
    return this.currentUrl() === route;
  }

  toggleSidebar(): void {
    this.isCollapsed.update(val => !val);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
