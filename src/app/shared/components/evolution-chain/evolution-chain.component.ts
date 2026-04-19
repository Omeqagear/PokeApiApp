import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DataServiceService } from '../../../services/data-service.service';
import { EvolutionChainLink, PokemonDetail } from '../../../shared/pokemon-api.interfaces';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface EvolutionNode {
  speciesName: string;
  pokemonId: number;
  spriteUrl: string;
  minLevel: number | null;
  trigger: string;
  item: string | null;
  evolutionDetails: string;
  isCurrentForm: boolean;
  evolutionDetailsList: EvolutionDetailInfo[];
}

interface EvolutionDetailInfo {
  label: string;
  value: string;
}

@Component({
  selector: 'app-evolution-chain',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './evolution-chain.component.html',
  styleUrls: ['./evolution-chain.component.scss']
})
export class EvolutionChainComponent implements OnInit {
  private dataService = inject(DataServiceService);

  @Input() pokemonId!: number;
  @Input() pokemonSpecies!: { evolution_chain?: { url: string } };

  evolutionNodes = signal<EvolutionNode[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  chainId = signal<number | null>(null);

  ngOnInit(): void {
    if (this.pokemonSpecies?.evolution_chain?.url) {
      const id = this.extractChainId(this.pokemonSpecies.evolution_chain.url);
      if (id) {
        this.chainId.set(id);
        this.loadEvolutionChain(this.pokemonSpecies.evolution_chain.url);
      } else {
        this.loading.set(false);
        this.error.set('Invalid evolution chain URL');
      }
    } else {
      this.loading.set(false);
    }
  }

  private extractChainId(url: string): number | null {
    const matches = url.match(/\/evolution-chain\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : null;
  }

  private loadEvolutionChain(url: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.dataService.getEvolutionChain(url).pipe(
      catchError((err) => {
        console.error('Error loading evolution chain:', err);
        this.error.set('Failed to load evolution chain');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe((chain) => {
      if (chain?.chain) {
        this.buildEvolutionNodes(chain.chain);
      } else {
        this.loading.set(false);
      }
    });
  }

  private buildEvolutionNodes(chain: EvolutionChainLink): void {
    const nodes: EvolutionNode[] = [];
    const currentId = this.pokemonId;

    const traverse = (link: EvolutionChainLink, depth = 0) => {
      const pokemonId = this.extractSpeciesId(link.species.url);
      const node: EvolutionNode = {
        speciesName: link.species.name,
        pokemonId,
        spriteUrl: '',
        minLevel: null,
        trigger: '',
        item: null,
        evolutionDetails: '',
        isCurrentForm: pokemonId === currentId,
        evolutionDetailsList: []
      };

      if (link.evolution_details && link.evolution_details.length > 0) {
        const detail = link.evolution_details[0];
        node.minLevel = detail.min_level;
        node.trigger = detail.trigger?.name || '';
        node.item = detail.item?.name || null;

        const detailsList: EvolutionDetailInfo[] = [];
        if (detail.min_level) {
          detailsList.push({ label: 'Level', value: detail.min_level.toString() });
        }
        if (detail.item) {
          detailsList.push({ label: 'Item', value: this.capitalize(detail.item.name) });
        }
        if (detail.trigger) {
          detailsList.push({ label: 'Trigger', value: this.capitalize(detail.trigger.name) });
        }
        if (detail.min_happiness) {
          detailsList.push({ label: 'Happiness', value: detail.min_happiness.toString() });
        }
        if (detail.min_beauty) {
          detailsList.push({ label: 'Beauty', value: detail.min_beauty.toString() });
        }
        if (detail.location) {
          detailsList.push({ label: 'Location', value: this.capitalize(detail.location.name) });
        }
        if (detail.known_move) {
          detailsList.push({ label: 'Move', value: this.capitalize(detail.known_move.name) });
        }
        if (detail.held_item) {
          detailsList.push({ label: 'Held Item', value: this.capitalize(detail.held_item.name) });
        }
        node.evolutionDetailsList = detailsList;

        if (detail.min_level) {
          node.evolutionDetails = `Level ${detail.min_level}`;
        } else if (detail.item) {
          node.evolutionDetails = `Use ${this.capitalize(detail.item.name)}`;
        } else if (detail.trigger) {
          node.evolutionDetails = this.capitalize(detail.trigger.name);
        }
      }

      nodes.push(node);

      if (link.evolves_to && link.evolves_to.length > 0) {
        for (const next of link.evolves_to) {
          traverse(next, depth + 1);
        }
      }
    };

    traverse(chain);

    const pokemonIds = nodes.map(n => n.pokemonId).filter(id => id > 0);
    const observables = pokemonIds.map(id => {
      if (id && id <= 1025) {
        return this.dataService.getPokemonDetail(id).pipe(
          catchError(() => of(null))
        );
      }
      return of(null);
    });

    if (observables.length > 0) {
      forkJoin(observables).subscribe((details: (PokemonDetail | null)[]) => {
        details.forEach((detail, index) => {
          if (detail && nodes[index]) {
            nodes[index].spriteUrl = detail.sprites.other?.['official-artwork']?.front_default
              || detail.sprites.front_default
              || '';
          }
        });
        this.evolutionNodes.set(nodes);
        this.loading.set(false);
      });
    } else {
      this.evolutionNodes.set(nodes);
      this.loading.set(false);
    }
  }

  private extractSpeciesId(url: string): number {
    const matches = url.match(/\/pokemon-species\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 0;
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }

  hasMultipleEvolutionsFrom(node: EvolutionNode): boolean {
    const currentIndex = this.evolutionNodes().findIndex(n => n.pokemonId === node.pokemonId);
    if (currentIndex < 0 || currentIndex >= this.evolutionNodes().length - 1) return false;
    const nextNodes = this.evolutionNodes().slice(currentIndex + 1);
    const sameLevel = nextNodes.filter(n => n.minLevel === node.minLevel && n.trigger === node.trigger);
    return sameLevel.length > 1;
  }

  getEvolvesToNodes(node: EvolutionNode): EvolutionNode[] {
    const currentIndex = this.evolutionNodes().findIndex(n => n.pokemonId === node.pokemonId);
    if (currentIndex < 0) return [];
    return this.evolutionNodes().slice(currentIndex + 1);
  }
}
