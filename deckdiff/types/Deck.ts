import {CardAndQuantity} from "./CardAndQuantity";
import {DeckParameter, DeckType, getDeckParameters} from "./DeckType";

export type ValidationError = {
    message: string;
}

export abstract class Deck {
    readonly timestamp: number;
    readonly type: DeckType;
    readonly mainboard: CardAndQuantity[] = [];
    readonly sideboard: CardAndQuantity[] = [];
    readonly parameters: DeckParameter;
    readonly validationErrors: ValidationError[] = []

    protected constructor(type: DeckType) {
        this.timestamp = Date.now();
        this.type = type;
        this.parameters = getDeckParameters(type);
    }

    applyText(text: string) {
        text.split("\n").forEach((line) => {
            const validationError = this.processLine(line);
            if (validationError) {
                this.validationErrors.push(validationError);
            }
        });

        const mainboardSize = this.getNumCardsInMainboard();
        const sideboardSize = this.getNumCardsInSideboard();
        const params = this.parameters;

        if (params.mainboardIsSizeExact && mainboardSize !== params.mainboardSize) {
            this.validationErrors.push({message: `Deck size must be EXACTLY ${params.mainboardSize} cards`});
        }
        if (!params.mainboardIsSizeExact && mainboardSize < params.mainboardSize) {
            this.validationErrors.push({message: `Deck size must be AT LEAST ${params.mainboardSize} cards`});
        }
        if (sideboardSize > params.sideboardSize) {
            this.validationErrors.push({message: `Sideboard cannot exceed ${params.sideboardSize} cards`});;
        }
    }

    protected abstract processLine(line: string): ValidationError | undefined;

    protected addToMainboard(card: CardAndQuantity) {
        this.mainboard.push(card);
    }

    protected addToSideboard(card: CardAndQuantity) {
        this.sideboard.push(card);
    }

    public getNumCardsInMainboard(): number {
        return this.mainboard.reduce((accum, card) => {
            return accum + card.getQuantity();
        }, 0);
    }

    public getNumCardsInSideboard(): number {
        return this.sideboard.reduce((accum, card) => {
            return accum + card.getQuantity();
        }, 0);
    }

    public mainboardToString(): string {
        return this.listToString(this.mainboard);
    }

    public sideboardToString(): string {
        return this.listToString(this.sideboard);
    }

    private listToString(list: CardAndQuantity[]): string {
        const sorted = list.sort((left, right) => {
            return left.name === right.name ? 0 :
                (left.name > right.name ? 1 : -1);
        });
        return sorted.reduce((accum, cardQuantity) => {
            let curr = "";
            for (let i = 0; i < cardQuantity.getQuantity(); ++i) {
                curr += `${cardQuantity.name}\n`;
            }
            return accum + curr;
        }, "");
    }
}
