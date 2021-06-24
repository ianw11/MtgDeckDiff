import {MtgDeck} from "./MtgDeck";
import {CardAndQuantity} from "./CardAndQuantity";
import {DeckType, ValidationError} from "./Deck";

export class MtgCommanderDeck extends MtgDeck {
    private commander?: CardAndQuantity;
    private lineCounter = 0;

    constructor(type: DeckType) {
        super(type);
    }

    processLine(line: string): ValidationError | undefined {
        ++this.lineCounter;
        if (this.lineCounter === 1) {
            if (line !== 'Commander') {
                // This assumes the next line is NOT the Commander
                ++this.lineCounter;
                return {message: 'Expected the first line to exactly match: "Commander"'};
            }
            return;
        }
        if (this.lineCounter === 2) {
            const data = this.parseMagicCardLine(line);
            if (!data) {
                return {message: "Unable to parse Commander from: " + line};
            }
            if (typeof data === 'string') {
                return {message: data};
            }
            if (data.quantity !== 1) {
                return {message: "Invalid quantity for Commander: " + data.quantity};
            }
            this.commander = new CardAndQuantity(data.name, data.set, 1);
            return;
        }
        return super.processLine(line);
    }

    getCommander(): CardAndQuantity | undefined {
        return this.commander;
    }
}
