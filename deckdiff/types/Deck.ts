import {CardAndQuantity} from "./CardAndQuantity";

export enum DeckType {
    MTG_STANDARD = "M:tG Standard",
    MTG_BRAWL = "M:tG Brawl",
    MTG_HISTORIC_BRAWL = "M:tG Historic 100-card Brawl",
}

type DeckParameter = {
    readonly mainboardSize: number;
    readonly mainboardIsSizeExact: boolean;
    readonly sideboardSize: number;
}
function getDeckParameters(type: DeckType): DeckParameter {
    switch (type) {
        case DeckType.MTG_STANDARD:
            return {
                mainboardSize: 60,
                mainboardIsSizeExact: false,
                sideboardSize: 15
            };
        case DeckType.MTG_BRAWL:
            return {
                mainboardSize: 59,
                mainboardIsSizeExact: true,
                sideboardSize: 0
            };
        case DeckType.MTG_HISTORIC_BRAWL:
            return {
                mainboardSize: 99,
                mainboardIsSizeExact: true,
                sideboardSize: 0
            };
        default:
            throw new Error("Invalid, unhandled DeckType: " + type);
    }
}

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
