import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../shared/services/theme.service';
import { TeamService } from '../services/team.service';
import { FavoritesService } from '../services/favorites.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
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
  private teamService = inject(TeamService);
  private favoritesService = inject(FavoritesService);

  currentUrl = signal('/');
  isCollapsed = signal(false);
  isDark = computed(() => this.themeService.theme() === 'dark');
  teamCount = this.teamService.teamCount;
  favoritesCount = this.favoritesService.favoritesCount;

  navItems = computed<NavItem[]>(() => [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/catalog', icon: 'book', label: 'Pokédex' },
    { path: '/evolution-chains', icon: 'account_tree', label: 'Evolutions' },
    { path: '/moves', icon: 'menu_book', label: 'Moves' },
    { path: '/abilities', icon: 'psychology', label: 'Abilities' },
    { path: '/battle-strategy', icon: 'bolt', label: 'Battle' },
    { path: '/types', icon: 'category', label: 'Types' },
    { path: '/locations', icon: 'map', label: 'Locations' },
    { path: '/natures', icon: 'psychology_alt', label: 'Natures' },
    { path: '/compare', icon: 'compare_arrows', label: 'Compare' },
    { path: '/favorites', icon: 'favorite', label: 'Favorites', badge: this.favoritesCount() },
    { path: '/team', icon: 'groups', label: 'My Team', badge: this.teamCount() }
  ]);

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
