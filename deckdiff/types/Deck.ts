import {CardAndQuantity} from "./CardAndQuantity";
import {DeckParameter, DeckType, getDeckParameters} from "./DeckType";

export type ValidationError = {
    message: string;
    severity?: 'WARN' | 'ERROR';
}

export type ComparisonError = {
    listName: string;
    comparisonValidationErrors: ValidationError[];
}

export abstract class Deck {
    readonly type: DeckType;
    readonly mainboard: CardAndQuantity[] = [];
    readonly sideboard: CardAndQuantity[] = [];
    readonly parameters: DeckParameter;
    readonly validationErrors: ValidationError[] = [];

    protected constructor(type: DeckType) {
        this.type = type;
        this.parameters = getDeckParameters(type);
    }

    applyText(text: string): Deck {
        text.split("\n").forEach((line) => {
            const validationError = this.processLine(line);
            if (validationError) {
                this.validationErrors.push(validationError);
            }
        });

        this.validateSelf().forEach(vError => {
            this.validationErrors.push(vError);
        });

        return this;
    }

    protected abstract processLine(line: string): ValidationError | undefined;

    /*
        This method is expected to be overridden by child classes
        to provide additional checks
     */
    protected validateSelf(): ValidationError[] {
        const errors = [];

        const mainboardSize = this.getNumCardsInMainboard();
        const sideboardSize = this.getNumCardsInSideboard();
        const params = this.parameters;

        if (params.mainboardIsSizeExact && mainboardSize !== params.mainboardSize) {
            errors.push({message: `Deck size must be EXACTLY ${params.mainboardSize} cards`});
        }
        if (!params.mainboardIsSizeExact && mainboardSize < params.mainboardSize) {
            errors.push({message: `Deck size must be AT LEAST ${params.mainboardSize} cards`});
        }
        if (sideboardSize > params.sideboardSize) {
            errors.push({message: `Sideboard cannot exceed ${params.sideboardSize} cards`});;
        }

        return errors;
    }

    /*
        This method is expected to be overridden by child classes
        to provide additional checks
     */
    public compareAgainst(other: Deck): ComparisonError[] {
        return [];
    }

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
