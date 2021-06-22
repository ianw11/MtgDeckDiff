import {Deck, DeckType} from "./Deck";
import {CardAndQuantity} from "./CardAndQuantity";

type MagicCardData = {
    quantity: number;
    name: string;
    set: string;
    cardId: string;
}

export class MtgDeck extends Deck {

    inMainboard = true;

    constructor(type: DeckType) {
        super(type);
    }

    processLine(line: string): string | undefined {
        const data = this.parseMagicCardLine(line);
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            return data;
        }
        const {name, quantity} = data;
        const card = new CardAndQuantity(name, quantity);
        if (this.inMainboard) {
            this.addToMainboard(card);
        } else {
            this.addToSideboard(card);
        }
        return;
    }

    protected parseMagicCardLine(line: string): string | MagicCardData | undefined {
        if (line === 'Deck' || line === '') {
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
        if (split.length < 4) {
            //console.error("Line did not split into 4 or more segments: " + line);
            return "Line did not split into 4 or more segments: " + line;
        }

        const quantityStr = split[0];
        const quantity = parseInt(quantityStr);
        if (isNaN(quantity)) {
            return "Invalid quantity for line: " + line;
        }

        const setStr = split[split.length - 2];
        const cardIdStr = split[split.length - 1];

        const nameStartIndex = quantityStr.length + 1; // Include the space
        const nameEndIndex = line.length - (setStr.length + cardIdStr.length + 2); // Include 2 spaces
        const name = line.substring(nameStartIndex, nameEndIndex);

        return {
            quantity,
            name,
            set: setStr,
            cardId: cardIdStr,
        };
    }
}
