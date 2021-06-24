export class CardAndQuantity {
    readonly name: string;
    readonly cardSet?: string;
    private quantity: number;

    constructor(name: string, cardSet?: string, quantity = 0) {
        this.name = name;
        this.cardSet = cardSet;
        this.quantity = quantity;
    }

    getQuantity(): number {
        return this.quantity;
    }

    incrementQuantity(amount: number = 1) {
        this.quantity += amount;
    }
}
