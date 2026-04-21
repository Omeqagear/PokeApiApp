import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, forkJoin } from 'rxjs';
import { DataServiceService } from '../services/data-service.service';
import { PokemonSummary, LocationDetail, LocationAreaDetail } from '../shared/pokemon-api.interfaces';
import { PokeballSpinnerComponent } from '../shared/components/pokeball-spinner/pokeball-spinner.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

interface LocationWithRegion {
  id: number;
  name: string;
  region: string;
  areaCount: number;
}

interface LocationAreaPokemon {
  areaName: string;
  pokemon: { name: string; id: number; spriteUrl: string; maxChance: number; methods: string[] }[];
}

const REGIONS = [
  { id: 1, name: 'kanto', displayName: 'Kanto', icon: 'location_city' },
  { id: 2, name: 'johto', displayName: 'Johto', icon: 'park' },
  { id: 3, name: 'hoenn', displayName: 'Hoenn', icon: 'water' },
  { id: 4, name: 'sinnoh', displayName: 'Sinnoh', icon: 'ac_unit' },
  { id: 5, name: 'unova', displayName: 'Unova', icon: 'apartment' },
  { id: 6, name: 'kalos', displayName: 'Kalos', icon: 'wb_sunny' },
  { id: 7, name: 'alola', displayName: 'Alola', icon: 'beach_access' },
  { id: 8, name: 'galar', displayName: 'Galar', icon: 'grass' },
  { id: 9, name: 'paldea', displayName: 'Paldea', icon: 'landscape' },
];

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    ReactiveFormsModule,
    PokeballSpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent,
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})
export class LocationsComponent implements OnInit {
  private dataService = inject(DataServiceService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  searchControl = new FormControl('');

  selectedRegion = signal<string>('all');
  locationsWithRegions = signal<LocationWithRegion[]>([]);
  filteredLocations = signal<LocationWithRegion[]>([]);
  loadingLocations = signal(true);
  loadingArea = signal(false);
  expandedLocationId = signal<number | null>(null);
  locationAreas = signal<Record<number, LocationAreaPokemon[]>>({});
  allPokemonCache = signal<Map<string, { id: number; spriteUrl: string }>>(new Map());

  regions = REGIONS;

  filteredRegions = computed(() => {
    const search = this.searchControl.value?.toLowerCase() || '';
    if (!search) return this.regions;
    return this.regions.filter((r) => r.displayName.toLowerCase().includes(search));
  });

  ngOnInit(): void {
    this.loadAllLocations();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private loadAllLocations(): void {
    this.loadingLocations.set(true);
    this.dataService.getAllLocations().pipe(
      switchMap((summaries: PokemonSummary[]) => {
        const requests = summaries.map((s) => {
          const id = parseInt(s.url.split('/').filter(Boolean).pop() ?? '0', 10);
          return this.dataService.getLocationDetail(id).pipe(
            map((detail: LocationDetail) => ({
              id: detail.id,
              name: detail.name,
              region: detail.region?.name || 'unknown',
              areaCount: detail.areas?.length || 0,
            })),
            catchError(() => of(null)),
          );
        });
        return forkJoin(requests);
      }),
      map((results) => results.filter((r): r is LocationWithRegion => r !== null)),
      catchError(() => of([])),
    ).subscribe((locations: LocationWithRegion[]) => {
      this.locationsWithRegions.set(locations);
      this.applyFilters();
      this.loadingLocations.set(false);
    });
  }

  private applyFilters(): void {
    const search = this.searchControl.value?.toLowerCase() || '';
    const region = this.selectedRegion();
    let filtered = this.locationsWithRegions();

    if (region !== 'all') {
      filtered = filtered.filter((l) => l.region === region);
    }

    if (search) {
      filtered = filtered.filter((l) => l.name.toLowerCase().includes(search));
    }

    this.filteredLocations.set(filtered);
  }

  selectRegion(regionName: string): void {
    this.selectedRegion.set(regionName);
    this.applyFilters();
  }

  toggleLocation(location: LocationWithRegion): void {
    const currentId = this.expandedLocationId();
    if (currentId === location.id) {
      this.expandedLocationId.set(null);
      return;
    }

    this.expandedLocationId.set(location.id);

    if (!this.locationAreas()[location.id]) {
      this.loadLocationAreas(location);
    }
  }

  private loadLocationAreas(location: LocationWithRegion): void {
    this.loadingArea.set(true);
    this.dataService.getLocationDetail(location.id).pipe(
      switchMap((detail: LocationDetail) => {
        if (!detail.areas || detail.areas.length === 0) {
          this.locationAreas.update((areas) => ({ ...areas, [location.id]: [] }));
          this.loadingArea.set(false);
          return of([]);
        }

        const areaRequests = detail.areas.map((area: PokemonSummary) => {
          const areaId = parseInt(area.url.split('/').filter(Boolean).pop() ?? '0', 10);
          return this.dataService.getLocationAreaDetail(areaId).pipe(
            map((areaDetail: LocationAreaDetail) => this.processAreaDetail(areaDetail)),
            catchError(() => of({ areaName: area.name, pokemon: [] })),
          );
        });

        return forkJoin(areaRequests);
      }),
      catchError(() => {
        this.loadingArea.set(false);
        return of([]);
      }),
    ).subscribe((areas: LocationAreaPokemon[]) => {
      this.locationAreas.update((existing) => ({ ...existing, [location.id]: areas }));
      this.loadingArea.set(false);
    });
  }

  private processAreaDetail(areaDetail: LocationAreaDetail): LocationAreaPokemon {
    const pokemonMap = new Map<string, { id: number; maxChance: number; methods: Set<string> }>();

    areaDetail.pokemon_encounters.forEach((encounter) => {
      const name = encounter.pokemon.name;
      const urlParts = encounter.pokemon.url.split('/').filter(Boolean);
      const id = parseInt(urlParts[urlParts.length - 1], 10);

      if (!pokemonMap.has(name)) {
        pokemonMap.set(name, { id, maxChance: 0, methods: new Set() });
      }

      const entry = pokemonMap.get(name);
      if (entry) {
        encounter.version_details.forEach((version) => {
          if (version.max_chance > entry.maxChance) {
            entry.maxChance = version.max_chance;
          }
          version.encounter_details.forEach((detail) => {
            entry.methods.add(detail.method.name);
          });
        });
      }
    });

    const pokemon = Array.from(pokemonMap.entries()).map(([name, data]) => ({
      name,
      id: data.id,
      spriteUrl: this.getSpriteUrl(data.id),
      maxChance: data.maxChance,
      methods: Array.from(data.methods),
    }));

    pokemon.sort((a, b) => a.id - b.id);

    return {
      areaName: areaDetail.name,
      pokemon,
    };
  }

  private getSpriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  formatMethodName(method: string): string {
    return method.replace('-', ' ');
  }

  onSpriteError(event: Event, id: number): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
  }
}
