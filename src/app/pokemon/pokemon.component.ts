import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { PokemonDetail } from '../shared/pokemon-api.interfaces';
import { DataServiceService } from '../services/data-service.service';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
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
export class PokemonComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataServiceService);

  pokemonForm: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.min(1), Validators.max(1025), Validators.pattern('^[0-9]+$')]]
  });
  
  // Signal-based state
  pokemonDetail = signal<PokemonDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Form already initialized in the declaration
  }

  onSubmit(): void {
    if (this.pokemonForm.invalid) {
      return;
    }

    const id = this.pokemonForm.value.id;
    this.loading.set(true);
    this.error.set(null);
    this.pokemonDetail.set(null);

    this.dataService.getPokemonDetail(id).subscribe({
      next: (data) => {
        this.pokemonDetail.set(data);
        this.loading.set(false);
        this.pokemonForm.reset();
      },
      error: (err) => {
        console.error('Error loading Pokemon:', err);
        this.error.set(`Pokemon with ID ${id} not found. Please try a different ID.`);
        this.loading.set(false);
      }
    });
  }

  getTypes(): string[] {
    return this.pokemonDetail()?.types.map(t => t.type.name) || [];
  }
}
