export interface PokemonStat {
    name: string;
    value: number;
}

export class Pokemon {
    id: number;
    name: string;
    spriteUrl: string;
    type1: string;
    type2: string;
    move1: string;
    move2: string;
    stats: PokemonStat[];
    totalStats: number;
    generation: number;
    baseExperience: number;
    types: any[];
    height: number;
    weight: number;
    abilities: any[];
    moves: any[];

    constructor(
        id: number | string,
        name: string,
        spriteUrl: string,
        type1: string,
        type2: string,
        move1: string,
        move2: string,
        stats: PokemonStat[] = [],
        totalStats: number = 0,
        generation: number = 1,
        baseExperience: number = 0,
        types: any[] = [],
        height: number = 0,
        weight: number = 0,
        abilities: any[] = [],
        moves: any[] = []
    ) {
        this.id = typeof id === 'string' ? parseInt(id, 10) : id;
        this.name = name;
        this.spriteUrl = spriteUrl;
        this.type1 = type1;
        this.type2 = type2;
        this.move1 = move1;
        this.move2 = move2;
        this.stats = stats;
        this.totalStats = totalStats;
        this.generation = generation;
        this.baseExperience = baseExperience;
        this.types = types;
        this.height = height;
        this.weight = weight;
        this.abilities = abilities;
        this.moves = moves;
    }
}
