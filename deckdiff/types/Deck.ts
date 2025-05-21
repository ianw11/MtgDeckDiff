import {CardAndQuantity, MtGCardType, SORT_ORDER} from "./CardAndQuantity";
import {DeckParameter, DeckType, getDeckParameters} from "./DeckType";

export type ValidationError = {
    message: string;
    severity?: 'WARN' | 'ERROR';
}

export type ComparisonError = {
    listName: string;
    comparisonValidationErrors: ValidationError[];
}

type CardsByType = { [k in MtGCardType]?: CardAndQuantity[] };

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
        for (let line of text.split('\n')) {

            // Don't bother with double-faced cards. Just use the front face
            line = line.split(' // ')[0];

            const validationError = this.processLine(line);
            if (validationError) {
                this.validationErrors.push(validationError);
            }
        }

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
    public compareAgainst(_other: Deck): ComparisonError[] {
        return [];
    }

    protected addToMainboard(card: CardAndQuantity) {
        this.mainboard.push(card);
    }

    protected addToSideboard(card: CardAndQuantity) {
        this.sideboard.push(card);
    }

    public getNumCardsInMainboard(): number {
        return this.mainboard.reduce(cardCounterReducer, 0);
    }

    public getNumCardsInSideboard(): number {
        return this.sideboard.reduce(cardCounterReducer, 0);
    }

    public mainboardToString(): string {
        return this.listToString(this.mainboard);
    }

    public sideboardToString(): string {
        return this.listToString(this.sideboard);
    }

    private listToString(list: CardAndQuantity[]): string {
        // Join cards based on their (most prominent) type
        const cardsByTypes: CardsByType = list.reduce((accum: CardsByType, card) => {
            // This takes MASSIVE advantage of scope
            const addToKey = (key: MtGCardType) => {
                if (accum[key] === undefined) {
                    accum[key] = [];
                }
                accum[key]!.push(card)
            }

            // For things like Dryad Arbor or artifact lands, we group as a land first
            // Then for things like artifact creatures or enchantment creatures, we group as a creature next
            const { types } = card;
            if (types.includes('LAND')) {
                addToKey('LAND');
            } else if (types.includes('CREATURE')) {
                addToKey('CREATURE');
            } else {
                if (types.length < 1) {
                    addToKey('UNKNOWN');
                } else {
                    addToKey(types[0]);
                }
            }

            return accum;
        }, {});

        const alternateRet: string = SORT_ORDER.reduce((accum: string, type) => {
            const cards = cardsByTypes[type];
            if (!cards) {
                return accum;
            }

            // For the cards in this type, write out card names with duplicates on their own lines
            const suffix = cards.sort(sortCardListByName).reduce((suffixAccum, card) => {
                let curr = "";
                for (let i = 0; i < card.quantity; ++i) {
                    curr += `${card.name}\n`;
                }
                return suffixAccum + curr;
            }, '');

            return `${accum}${suffix}`;
        }, '');


        const originalRet = list.sort(sortCardListByName).reduce((accum, cardQuantity) => {
            let curr = "";
            for (let i = 0; i < cardQuantity.quantity; ++i) {
                curr += `${cardQuantity.name}\n`;
            }
            return accum + curr;
        }, "");

        return originalRet;
    }
}

function sortCardListByName(left: CardAndQuantity, right: CardAndQuantity): number {
    return left.name === right.name ? 0 :
        (left.name > right.name ? 1 : -1);
}

function cardCounterReducer(accum: number, card: CardAndQuantity): number {
    return accum + card.quantity
}
