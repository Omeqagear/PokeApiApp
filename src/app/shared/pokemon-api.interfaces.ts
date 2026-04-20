export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSummary[];
}

export interface PokemonSummary {
  name: string;
  url: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonTypeEntry[];
  abilities: PokemonAbilityEntry[];
  moves: PokemonMoveEntry[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  forms: PokemonSummary[];
  game_indices: PokemonGameIndex[];
  species: PokemonSummary;
}

export interface PokemonTypeEntry {
  slot: number;
  type: PokemonSummary;
}

export interface PokemonAbilityEntry {
  is_hidden: boolean;
  slot: number;
  ability: PokemonSummary;
}

export interface PokemonMoveEntry {
  move: PokemonSummary;
  version_group_details: PokemonMoveVersionDetail[];
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number;
  move_learn_method: PokemonSummary;
  version_group: PokemonSummary;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: PokemonSummary;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    'home'?: {
      front_default: string | null;
      front_female: string | null;
      front_shiny: string | null;
      front_shiny_female: string | null;
    };
    'dream_world'?: {
      front_default: string | null;
      front_female: string | null;
    };
  };
}

export interface PokemonGameIndex {
  game_index: number;
  version: PokemonSummary;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain?: {
    url: string;
  };
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink;
}

export interface EvolutionChainLink {
  species: PokemonSummary;
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionDetail {
  item: PokemonSummary | null;
  trigger: PokemonSummary;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  location: PokemonSummary | null;
  held_item: PokemonSummary | null;
  known_move: PokemonSummary | null;
  known_move_type: PokemonSummary | null;
  trade_species: PokemonSummary | null;
  turn_upside_down: boolean;
}

