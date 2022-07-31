import {ComparisonError, Deck, ValidationError} from "./Deck";
import {CardAndQuantity} from "./CardAndQuantity";
import {LineFormat} from "./LineFormat";
import {DeckType} from "./DeckType";

type MagicCardData = {
    quantity: number;
    name: string;
    set?: string;
    cardId?: string;
}

export class MtgDeck extends Deck {

    readonly lineFormat: LineFormat;

    private inMainboard = true;

    private companion?: CardAndQuantity;
    private companionNextLine = false;

    constructor(type: DeckType, lineFormat: LineFormat) {
        super(type);
        this.lineFormat = lineFormat;
    }

    processLine(line: string): ValidationError | undefined {
        const data = this.parseMagicCardLine(line);
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            return {message: data.replaceAll("%LINE%", line)};
        }
        const {name, quantity, set} = data;
        const card = new CardAndQuantity(name, set, quantity);

        if (this.companionNextLine) {
            this.companionNextLine = false;
            this.companion = card;
            return;
        }
        if (this.inMainboard) {
            this.addToMainboard(card);
        } else {
            if (this.companion === undefined || this.companion.name !== card.name) {
                this.addToSideboard(card);
            }
        }
    }

    protected parseMagicCardLine(line: string): string | MagicCardData | undefined {
        if (line === 'Deck' || line.length === 0) {
            return;
        }
        if (line === 'Commander') {
            return "Found Commander in non-Commander deck list";
        }
        if (line === 'Companion') {
            this.companionNextLine = true;
            return;
        }
        if (line === 'Sideboard') {
            this.inMainboard = false;
            return;
        }

        const split = line.split(" ");

        switch (this.lineFormat) {
            case LineFormat.ARENA_EXPORT:
                return this.parseArenaLine(split);
            case LineFormat.BASIC:
                return this.parseBasicLine(split);
            default:
                throw new Error("Unknown line format");
        }
    }

    private parseArenaLine(split: string[]): string | MagicCardData | undefined {
        if (split.length < 4) {
            return "Line did not split into 4 or more segments: %LINE%";
        }

        const cardIdStr = split.pop();
        const setStr = split.pop();

        const basicData = this.parseBasicLine(split);
        if (typeof basicData === 'string') {
            return basicData;
        }
        return { ...basicData, set: setStr, cardId: cardIdStr };
    }

    private parseBasicLine(split: string[]): string | MagicCardData {
        const quantity = this.getQuantity(split);
        if (typeof quantity === "string") {
            return quantity;
        }

        const name = split.join(" ");

        return { quantity, name };
    }

    private getQuantity(split: string[]): string | number {
        if (split.length < 2) {
            return "Line did not split into 2 or more segments: %LINE%";
        }
        const quantityStr = split.shift() ?? "0";
        const quantity = parseInt(quantityStr);
        if (isNaN(quantity) || quantity < 1) {
            return "Invalid quantity for line: %LINE%";
        }
        return quantity;
    }

    compareAgainst(other: Deck): ComparisonError[] {
        const companionErrors: ValidationError[] = [];

        if (! (other instanceof MtgDeck)) {
            companionErrors.push({message: 'Cannot compare Decks - wrong type (non-MtG)'})
        } else {
            const otherCompanion = other.companion;
            if (otherCompanion !== undefined) {
                if (this.companion === undefined) {
                    companionErrors.push({message: 'This deck does not have a Companion', severity: "WARN"})
                } else if (this.companion.name !== otherCompanion.name) {
                    companionErrors.push({message: 'Companions do not match'});
                }
            }
        }

        const errors = super.compareAgainst(other);
        if (companionErrors.length > 0) {
            errors.push({
                listName: 'Companion',
                comparisonValidationErrors: companionErrors
            });
        }
        return errors;
    }
}
