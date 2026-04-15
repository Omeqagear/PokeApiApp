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
      icon: 'grid_view',
      title: 'Browse Catalog',
      description: 'Explore all 1025+ Pokémon with search and filters',
      route: '/catalog'
    },
    {
      icon: 'search',
      title: 'Search by ID',
      description: 'Find any Pokémon instantly by ID number',
      route: '/catalog'
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
    }
  ];
}

