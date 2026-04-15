export class Pokemon {
    id: number;
    name: string;
    spriteUrl: string;
    type1: string;
    type2: string;
    move1: string;
    move2: string;

    constructor(
        id: number | string,
        name: string,
        spriteUrl: string,
        type1: string,
        type2: string,
        move1: string,
        move2: string
    ) {
        this.id = typeof id === 'string' ? parseInt(id, 10) : id;
        this.name = name;
        this.spriteUrl = spriteUrl;
        this.type1 = type1;
        this.type2 = type2;
        this.move1 = move1;
        this.move2 = move2;
    }
}