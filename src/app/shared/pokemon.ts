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

    getId(): number {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getImage(): string {
        return this.spriteUrl;
    }

    getType1(): string {
        return this.type1;
    }

    getType2(): string {
        return this.type2;
    }

    getMove1(): string {
        return this.move1;
    }

    getMove2(): string {
        return this.move2;
    }

    setId(id: number | string): void {
        this.id = typeof id === 'string' ? parseInt(id, 10) : id;
    }

    setName(name: string): void {
        this.name = name;
    }

    setImage(img: string): void {
        this.spriteUrl = img;
    }

    setType1(t1: string): void {
        this.type1 = t1;
    }

    setType2(t2: string): void {
        this.type2 = t2;
    }

    setMove1(m1: string): void {
        this.move1 = m1;
    }

    setMove2(m2: string): void {
        this.move2 = m2;
    }
}