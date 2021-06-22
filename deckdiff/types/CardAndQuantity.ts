export class CardAndQuantity {
    readonly name: string;
    private quantity: number;

    constructor(name: string, quantity = 0) {
        this.name = name;
        this.quantity = quantity;
    }

    getQuantity(): number {
        return this.quantity;
    }

    incrementQuantity(amount: number = 1) {
        this.quantity += amount;
    }
}
