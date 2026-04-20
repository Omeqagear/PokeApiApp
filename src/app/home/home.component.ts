import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Feature {
  icon: string;
  title: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features: Feature[] = [
    {
      icon: 'book',
      title: 'Regional Pokédex',
      description: 'Browse Pokémon by region: Kanto, Johto, Paldea and more',
      route: '/catalog'
    },
    {
      icon: 'search',
      title: 'Search by ID',
      description: 'Find any Pokémon instantly by ID number',
      route: '/catalog'
    },
    {
      icon: 'book',
      title: 'Regional Pokédex',
      description: 'Browse Pokémon by region: Kanto, Johto, Paldea and more',
      route: '/catalog'
    },
    {
      icon: 'menu_book',
      title: 'Moves Encyclopedia',
      description: 'Explore 900+ moves with power, accuracy, and effects',
      route: '/moves'
    },
    {
      icon: 'psychology',
      title: 'Abilities Browser',
      description: 'Discover 300+ abilities and which Pokémon have them',
      route: '/abilities'
    },
    {
      icon: 'groups',
      title: 'Build Your Team',
      description: 'Create and manage your ultimate Pokémon team of 6',
      route: '/team'
    },
    {
      icon: 'auto_awesome',
      title: 'Random Team',
      description: 'Generate a random team with one click for quick battles',
      route: '/team'
    },
    {
      icon: 'compare_arrows',
      title: 'Compare Pokémon',
      description: 'Side-by-side stat comparison of any two Pokémon',
      route: '/compare'
    }
  ];
}

