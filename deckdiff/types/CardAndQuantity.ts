export type MtGCardType =
    'CREATURE' |
    'LAND' |
    'INSTANT' |
    'SORCERY' |
    'ARTIFACT' |
    'ENCHANTMENT' |
    'PLANESWALKER' |
    'BATTLE' |
    'UNKNOWN'
    ;

export const SORT_ORDER: MtGCardType[] = [
    'CREATURE',
    'INSTANT',
    'SORCERY',
    'ARTIFACT',
    'ENCHANTMENT',
    'BATTLE',
    'PLANESWALKER',
    'LAND',
    'UNKNOWN'
];

export interface CardProps {
    name: string
    types: MtGCardType[]
    cardSet?: string
}

export class CardAndQuantity {
    readonly name: string;
    readonly types: MtGCardType[];
    readonly cardSet?: string;

    private _quantity: number;
    get quantity() {
        return this._quantity;
    }
    private set quantity(newValue) {
        this._quantity = newValue;
    }

    constructor({name, types, cardSet}: CardProps, quantity = 0) {
        this.name = name;
        this.types = types;
        this.cardSet = cardSet;
        this._quantity = quantity;
    }
}
