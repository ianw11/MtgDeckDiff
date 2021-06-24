import {Deck, DeckType, ValidationError} from "./Deck";
import {CardAndQuantity} from "./CardAndQuantity";

type MagicCardData = {
    quantity: number;
    name: string;
    set?: string;
    cardId?: string;
}

export class MtgDeck extends Deck {

    inMainboard = true;

    constructor(type: DeckType) {
        super(type);
    }

    processLine(line: string): ValidationError | undefined {
        const data = this.parseMagicCardLine(line);
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            return {message: data};
        }
        const {name, quantity, set} = data;
        const card = new CardAndQuantity(name, set, quantity);
        if (this.inMainboard) {
            this.addToMainboard(card);
        } else {
            this.addToSideboard(card);
        }
        return;
    }

    protected parseMagicCardLine(line: string): string | MagicCardData | undefined {
        if (line === 'Deck' || line.length === 0) {
            return;
        }
        if (line === 'Commander') {
            return "Found Commander in non-Commander deck list";
        }
        if (line === 'Sideboard') {
            this.inMainboard = false;
            return;
        }

        const split = line.split(" ");
        if (split.length < 2) {
            return "Line did not split into 2 or more segments: " + line;
        }

        const quantityStr = split[0];
        const quantity = parseInt(quantityStr);
        if (isNaN(quantity)) {
            return "Invalid quantity for line: " + line;
        }

        const setStr = split[split.length - 2];
        const cardIdStr = split[split.length - 1];
        let cardNameOffset = 0;
        if (setStr.startsWith("(")) {
            cardNameOffset = setStr.length + cardIdStr.length + 2; // Include 2 spaces
        }

        const nameStartIndex = quantityStr.length + 1; // Include the space
        const nameEndIndex = line.length - cardNameOffset;
        const name = line.substring(nameStartIndex, nameEndIndex);

        return {
            quantity,
            name,
            set: cardNameOffset > 0 ? setStr : undefined,
            cardId: cardNameOffset > 0 ? cardIdStr : undefined,
        };
    }
}
