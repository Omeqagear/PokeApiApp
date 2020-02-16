import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoPokemonComponent } from './equipo-pokemon.component';

describe('EquipoPokemonComponent', () => {
  let component: EquipoPokemonComponent;
  let fixture: ComponentFixture<EquipoPokemonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipoPokemonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipoPokemonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
