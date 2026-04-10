import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { PokemonSummary, PokemonListResponse } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  animations: [
    trigger('listStagger', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-15px)' }),
            stagger(
              '50ms',
              animate(
                '550ms ease-out',
                style({ opacity: 1, transform: 'translateY(0px)' })
              )
            )
          ],
          { optional: true }
        ),
        query(':leave', animate('50ms', style({ opacity: 0 })), {
          optional: true
        })
      ])
    ])
  ]
})
export class CatalogComponent implements OnInit {
  private dataService = inject(DataServiceService);

  pokemons: PokemonSummary[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadPokemonList();
  }

  private loadPokemonList(): void {
    this.loading = true;
    this.error = null;
    
    this.dataService.getPokemonNames().subscribe({
      next: (data: PokemonListResponse) => {
        this.pokemons = data.results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading Pokemon list:', err);
        this.error = 'Failed to load Pokemon list. Please try again.';
        this.loading = false;
      }
    });
  }

  extractPokemonId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
  }

  capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  onItem(item: PokemonSummary): number {
    return this.extractPokemonId(item.url);
  }
}
